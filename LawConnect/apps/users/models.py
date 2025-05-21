from django.db import models
from django.contrib.auth.models import AbstractUser, PermissionsMixin, UserManager

# Custom User Model
class User(AbstractUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('lawyer', 'Lawyer'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email=models.EmailField( unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = UserManager()
    def __str__(self):
        return self.username


# Lawyer Profile Model
class LawyerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lawyer_profile')
    specialization = models.CharField(max_length=255)
    license = models.CharField(max_length=100)
    firm = models.CharField(max_length=255)
    approved = models.BooleanField(default=False)

    def __str__(self):
        return f"Lawyer Profile for {self.user.username}"


# Client Profile Model
class ClientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')

    def __str__(self):
        return f"Client Profile for {self.user.username}"
