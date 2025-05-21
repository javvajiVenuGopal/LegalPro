from django.db import models
from django.conf import settings

from apps.users.models import User

from django.utils import timezone

class Case(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_review', 'In Review'),
        ('closed', 'Closed'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    client = models.ForeignKey(User, related_name='client_cases', on_delete=models.CASCADE)
    lawyer = models.ForeignKey(User, related_name='lawyer_cases', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=50)
    client = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='client_cases', on_delete=models.CASCADE)
    lawyer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='lawyer_cases', on_delete=models.SET_NULL, null=True, blank=True)
    accepted_by_lawyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='accepted_cases'
    )
    def accept_case(self, lawyer: User):
        """Allow a lawyer to accept the case"""
        if self.status == 'open' and not self.accepted_by_lawyer:
            self.lawyer = lawyer
            self.status = 'in_review'  # Status will be updated when accepted
            self.accepted_by_lawyer = lawyer
            self.save()

    def __str__(self):
        return f'Case: {self.title}, Status: {self.status}, Accepted: {self.accepted_by_lawyer}'


class CaseUpdate(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    case = models.ForeignKey(Case, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=255)
    client = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='appointments_as_client', on_delete=models.CASCADE)
    lawyer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='appointments_as_lawyer', on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

# models.py
from django.db import models
from django.contrib.auth.models import User

def upload_to(instance, filename):
    return f'user_{instance.owner.id}/{instance.folder.id if instance.folder else "root"}/{filename}'

class Folder(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

class Document(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to=upload_to)
    folder = models.ForeignKey(Folder, on_delete=models.SET_NULL, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    @property
    def file_size(self):
        return self.file.size

    @property
    def mime_type(self):
        import mimetypes
        return mimetypes.guess_type(self.file.name)[0]

    
# models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Thread(models.Model):
    case=models.ForeignKey(Case,on_delete=models.CASCADE)
    participants = models.ManyToManyField(User, related_name="threads")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Thread between {', '.join([p.username for p in self.participants.all()])}"

    @classmethod
    def get_or_create_thread(cls, user1, user2):
        """Ensure only one thread exists between two users."""
        thread = cls.objects.filter(participants=user1).filter(participants=user2).first()
        if not thread:
            thread = cls.objects.create()
            thread.participants.set([user1, user2])
            thread.save()
        return thread

    
class Message(models.Model):
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name="messages")  # ✅ Add this line
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    is_read = models.BooleanField(default=False)
# models.py
from django.db import models


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    ]
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    client = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='client_invoices', on_delete=models.CASCADE)
    lawyer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='lawyer_invoices', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Invoice #{self.id} for {self.case.title}"

# Example: apps/messages/models.py
