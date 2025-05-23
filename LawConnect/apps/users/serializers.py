from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate
from .models import LawyerProfile, ClientProfile

User = get_user_model()

# User Register Serializer

    # Lawyer-specific fields
class UserRegistrationSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    specialization = serializers.CharField(write_only=True, required=False)
    license = serializers.CharField(write_only=True, required=False)
    firm = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'confirm_password',
            'phone', 'role', 'avatar',
            'specialization', 'license', 'firm'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        if data['role'] == 'lawyer':
            if not data.get('specialization') or not data.get('license'):
                raise serializers.ValidationError("Specialization and license are required for lawyers.")
        return data

    def create(self, validated_data):
        specialization = validated_data.pop('specialization', None)
        license = validated_data.pop('license', None)
        firm = validated_data.pop('firm', '')

        validated_data.pop('confirm_password')
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Create profile manually (optional since signals also do it)
        if user.role == 'lawyer':
            LawyerProfile.objects.update_or_create(
                user=user,
                defaults={'specialization': specialization, 'license': license, 'firm': firm}
            )
        elif user.role == 'client':
            ClientProfile.objects.get_or_create(user=user)

        return user

# User Login Serializer
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        raise serializers.ValidationError('Invalid credentials')

class UserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    token = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'avatar', 'phone', 'token']
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def validate_email(self, value):
        """
        Check if the email already exists (for update).
        """
        if User.objects.filter(email=value).exclude(id=self.instance.id).exists():
            raise ValidationError("Email is already taken.")
        return value

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance

    def get_token(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


from rest_framework import serializers
from .models import LawyerProfile
from django.contrib.auth import get_user_model

User = get_user_model()
from rest_framework import serializers
from .models import LawyerProfile

class LawyerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = LawyerProfile
        fields = '__all__'
