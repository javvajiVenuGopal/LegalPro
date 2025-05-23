from rest_framework import serializers

from apps.users.serializers import UserRegistrationSerializer
from apps.users.models import User
from .models import Case, CaseUpdate, Appointment, Document, Message, Invoice

class CaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = '__all__'
        read_only_fields = ['client']

class CaseUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseUpdate
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'

from rest_framework import serializers
from .models import Document, Folder

class DocumentSerializer(serializers.ModelSerializer):
    file_size = serializers.ReadOnlyField()
    mime_type = serializers.ReadOnlyField()
    url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = '__all__'
        extra_kwargs = {
            'name': {'required': True},
            'owner': {'required': True}
        }
    def get_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url)

class FolderSerializer(serializers.ModelSerializer):
    count = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = ['id', 'name', 'count']

    def get_count(self, obj):
        return obj.document_set.count()


# serializers.py
from rest_framework import serializers
from .models import Message

# serializers.py
from rest_framework import serializers
from .models import Thread, Message
from django.contrib.auth import get_user_model

User = get_user_model()

from rest_framework import serializers
from .models import Message, Thread, Case


# Thread Serializer
class ThreadSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(queryset=get_user_model().objects.all(), many=True)

    class Meta:
        model = Thread
        fields = ['id', 'participants', 'created_at','case']
    def create(self, validated_data):
        participants = validated_data.pop('participants')
        thread = Thread.get_or_create_thread(*participants)
        return thread
class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField(read_only=True)
    receiver = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    thread = serializers.PrimaryKeyRelatedField(queryset=Thread.objects.all())

    class Meta:
        model = Message
        fields = ['id', 'case', 'thread', 'content', 'created_at', 'sender', 'receiver', 'is_read']

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'
# serializers.py

from rest_framework import serializers
from .models import CaseRequest

class CaseRequestSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.username', read_only=True)
    lawyer_name = serializers.CharField(source='lawyer.username', read_only=True)

    class Meta:
        model = CaseRequest
        fields = '__all__'
        read_only_fields = ['status', 'created_at']

