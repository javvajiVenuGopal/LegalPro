from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, LawyerProfile, ClientProfile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'lawyer':
            LawyerProfile.objects.create(user=instance)
        elif instance.role == 'client':
            ClientProfile.objects.create(user=instance)
