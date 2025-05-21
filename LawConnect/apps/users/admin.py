from django.contrib import admin
from .models import User, LawyerProfile, ClientProfile

admin.site.register(User)
admin.site.register(LawyerProfile)
admin.site.register(ClientProfile)
