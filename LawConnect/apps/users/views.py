
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model


User = get_user_model()

# users/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserRegistrationSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully."}, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework import serializers
from django.contrib.auth.models import User  # or your custom user model
# In your serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Optionally add extra claims here
        return token

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError('Both email and password are required.')

        user = authenticate(self.context.get('request'), username=email, password=password)

        if user is None:
            raise serializers.ValidationError('Invalid credentials')
        u={
            'id':user.id,
            "email":user.email,
            "name":user.username,
            "phone":user.phone,
            "role":user.role,
            #"specialization":user.specialization,
        }
        # Generate and return tokens
        token = self.get_token(user)
        return {
            "user": u,
            "token": {
                'refresh': str(token),
                'access': str(token.access_token),
            }
        }
                    
        

from rest_framework_simplejwt.views import TokenObtainPairView
class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({"error": "Invalid token or logout failed"}, status=status.HTTP_400_BAD_REQUEST)
User = get_user_model()

class ClientListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        clients = User.objects.filter(role='client')
        data = [{"id": u.id, "name": u.username, "email": u.email} for u in clients]
        return Response(data)
class LawyerListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        clients = User.objects.filter(role='lawyer')
        print(clients)
        data = list(clients.values())
        print(data)
        for client in data:
            del client['password']
            del   client["last_login"]
            del client["date_joined"]
            del client["is_superuser"]
            del client["is_staff"]
            
            
            
        return Response(data)


class ClientDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            client = User.objects.get(pk=pk, role='client')
        except User.DoesNotExist:
            return Response({"error": "Client not found."}, status=status.HTTP_404_NOT_FOUND)
        
        data = {
            "id": client.id,
            "name": client.username,
            "email": client.email,
            "phone": getattr(client, "phone", ""),
            "role": client.role,
            # Add more fields as needed
        }
        return Response({"client": data}, status=status.HTTP_200_OK)


class LawyerDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            lawyer = User.objects.get(pk=pk, role='lawyer')
        except User.DoesNotExist:
            return Response({"error": "Lawyer not found."}, status=status.HTTP_404_NOT_FOUND)
        
        data = {
            "id": lawyer.id,
            "name": lawyer.username,
            "email": lawyer.email,
            "phone": getattr(lawyer, "phone", ""),
            "role": lawyer.role,
            # Add more fields as needed
        }
        return Response({"lawyer": data}, status=status.HTTP_200_OK)