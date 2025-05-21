from django.db import models
from apps.users.models import User

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('message', 'Message'),
        ('appointment', 'Appointment'),
        ('document', 'Document'),
        ('case', 'Case'),
        ('invoice', 'Invoice'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    related_id = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.type} for {self.user.username}"
