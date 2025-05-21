from .models import Notification

def create_notification(user, notif_type, title, content, related_id=None):
    Notification.objects.create(
        user=user,
        type=notif_type,
        title=title,
        content=content,
        related_id=related_id
    )