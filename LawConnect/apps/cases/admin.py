from django.contrib import admin
from .models import Case, CaseUpdate, Appointment, Document, Message, Invoice

admin.site.register(Case)
admin.site.register(CaseUpdate)
admin.site.register(Appointment)
admin.site.register(Document)
admin.site.register(Message)
admin.site.register(Invoice)
