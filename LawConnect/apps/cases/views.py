from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import viewsets


from apps.users.models import LawyerProfile, User
from apps.notifications.signals import create_notification
from .models import Case, CaseUpdate, Appointment, Document, Message, Invoice
from .serializers import CaseSerializer, CaseUpdateSerializer, AppointmentSerializer, DocumentSerializer, MessageSerializer, InvoiceSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]
    def perform_create(self, serializer):
        message = serializer.save(client=self.request.user)
        # Create notification for recipient
        create_notification(
            user=message.client,
            notif_type='case',
            title='New Message',
            content=f"Your case '{message.title}' has been created.",
            related_id=message.id
        )


class CaseUpdateViewSet(viewsets.ModelViewSet):
    queryset = CaseUpdate.objects.all()
    serializer_class = CaseUpdateSerializer
    permission_classes = [IsAuthenticated]
    def perform_create(self, serializer):
        message = serializer.save(sender=self.request.user)
        # Create notification for recipient
        create_notification(
            user=message.recipient,
            notif_type='case',
            title='New Message',
            content=message.content[:100],
            related_id=message.id
        )


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    def perform_create(self, serializer):
        appointment = serializer.save()
        
        create_notification(
            user=self.request.user,  # ✅ Use the currently authenticated user
            notif_type='appointment',
            title='New Appointment',
            content=f"Appointment scheduled for {appointment.end_time}",  # or whatever your actual field name is
            related_id=appointment.id
        )


from rest_framework import viewsets, permissions
from .models import Document, Folder
from .serializers import DocumentSerializer, FolderSerializer

class FolderViewSet(viewsets.ModelViewSet):
    queryset = Folder.objects.all() 
    serializer_class = FolderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Folder.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()  
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

# views.py
from django.http import FileResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_file(request, pk):
    doc = Document.objects.get(pk=pk, owner=request.user)
    return FileResponse(doc.file.open(), as_attachment=True)



from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Thread, Message
from .serializers import ThreadSerializer, MessageSerializer

# views.py
from rest_framework import viewsets
from .models import Thread, Message
from .serializers import ThreadSerializer, MessageSerializer
from rest_framework.permissions import IsAuthenticated

class ThreadViewSet(viewsets.ModelViewSet):
    queryset = Thread.objects.all()
    serializer_class = ThreadSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        participants = self.request.data.get('participants')
        if participants:
            user1 = self.request.user
            user2 = User.objects.get(id=participants[0])
            thread = Thread.get_or_create_thread(user1, user2)
            serializer.save()
        else:
            # Handle error: participants not provided
            pass

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    queryset = Message.objects.all()

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        
        message = serializer.save(client=self.request.user)
        lawyer_id= self.request.data.get('lawyer')
         # Retrieve the lawyer's profile to get the per_case_charge
        lawyer_profile = get_object_or_404(LawyerProfile, user_id=lawyer_id)
        
        # Determine the status based on the per_case_charge
        if message.amount >= lawyer_profile.per_case_charge:
            message.status = 'paid'
        else:
            message.status = 'pending'
        
        # Save the updated invoice with the new status
        message.save()
        print(self.request.data)
        user = User.objects.get(id=lawyer_id)
        # Create notification for recipient
        create_notification(user=user,
            notif_type='invoice',
            title='payment',
            content="message credited",
            related_id=message.id
        )
class AcceptCase(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, case_id):
        case = get_object_or_404(Case, id=case_id)
 # Get additional data from the request body if needed
        
        if request.user.role != 'lawyer':
            accepted_by_lawyer = request.data.get('accepted_by_lawyer', request.user.id)
            lawyer_id = request.data.get('lawyer', request.user.id)
            print(accepted_by_lawyer,lawyer_id)
        else:
            accepted_by_lawyer = request.user.id
            lawyer_id = request.user.id

        if case.lawyer:
            return Response({'error': 'This case has already been accepted.'}, status=status.HTTP_400_BAD_REQUEST)

       

        # Assign lawyer and update the case status
        case.lawyer = lawyer_id
        case.accepted_by_lawyer = accepted_by_lawyer
        case.status = 'in_review'
        case.save()

        # Create a thread for this case
        thread, created = Thread.objects.get_or_create(case=case)
        thread.participants.add(case.client, request.user)

        # Notify the client about the case acceptance
        create_notification(
            user=case.client,
            notif_type='case',
            title='Case Accepted',
            content=f"Your case '{case.title}' was accepted by {request.user.get_full_name()}",
            related_id=case.id
        )

        return Response({
            'message': 'Case accepted successfully. Chat thread created.',
            'thread_id': thread.id,
            'thread_created': created
        }, status=status.HTTP_200_OK)
        # Assign lawyer and update status
        

from rest_framework import viewsets, permissions
from .models import CaseRequest
from .serializers import CaseRequestSerializer

class CaseRequestViewSet(viewsets.ModelViewSet):
    queryset = CaseRequest.objects.all()
    serializer_class = CaseRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name="lawyers").exists():
            return CaseRequest.objects.filter(lawyer=user).order_by('-created_at')
        return CaseRequest.objects.filter(client=user).order_by('-created_at')

    def perform_create(self, serializer):
         # Get the currently authenticated user (client)
        user = self.request.user
        
        # Get the lawyer ID from the request data
        lawyer_id = self.request.data.get('lawyer')  # Get the lawyer ID from the request data
        client_id = self.request.data.get('client')
        # Ensure a lawyer ID is provided
        if not lawyer_id:
            raise ValueError("Lawyer ID is required.")
        
        try:
            lawyer = User.objects.get(id=lawyer_id)  # Fetch the lawyer by the ID
            client=User.objects.get(id=client_id)  # Fetch the client by the ID
        except User.DoesNotExist:
            raise ValueError("Lawyer with the given ID does not exist.")
        print(lawyer,client)
        # Save the case request with the client and lawyer
        # Ensure the `client` is the current authenticated user
        
        serializer.save(client=client, lawyer=lawyer)