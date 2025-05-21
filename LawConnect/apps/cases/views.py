from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import viewsets


from apps.users.models import User
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
        message = serializer.save(sender=self.request.user)
        # Create notification for recipient
        create_notification(
            user=message.recipient,
            notif_type='invoice',
            title='payment',
            content=message.content[:100],
            related_id=message.id
        )
class AcceptCase(APIView):
    
    permission_classes = [IsAuthenticated]

    def post(self, request, case_id):
        case = get_object_or_404(Case, id=case_id)

        if request.user.role != 'lawyer':
            return Response({'error': 'Only a lawyer can accept a case.'}, status=status.HTTP_403_FORBIDDEN)

        if case.lawyer:
            return Response({'error': 'This case has already been accepted.'}, status=status.HTTP_400_BAD_REQUEST)

        # Assign lawyer and update status
        case.lawyer = request.user
        case.accepted_by_lawyer = request.user
        case.status = 'in_review'
        case.save()

        # Create a thread for this case
        thread, created = Thread.objects.get_or_create(case=case)
        thread.participants.add(case.client, request.user)

        # Notify client
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
    permission_classes = [IsAuthenticated]

    def post(self, request, case_id):
        
        case = get_object_or_404(Case, id=case_id)

        if request.user.role != 'lawyer':
            return JsonResponse({'error': 'Only a lawyer can accept a case.'}, status=status.HTTP_400_BAD_REQUEST)

        # Set the lawyer on the case
        case.lawyer = request.user
        case.accepted_by_lawyer = request.user
        case.status = 'in_review'
        case.save()

        # Create a chat thread for the case if it doesn't exist already
        thread, created = Thread.objects.get_or_create(case=case)
        thread.participants.add(request.user, case.client)

        # Create notification for the client
        create_notification(
            user=case.client,
            notif_type='case',
            title='Case Accepted',
            content=f"Your case '{case.title}' was accepted by {request.user.get_full_name()}",
            related_id=case.id
        )

        return JsonResponse({
            'message': 'Case successfully accepted by lawyer',
            'thread_id': thread.id,
            'thread_created': created
        }, status=status.HTTP_200_OK)

