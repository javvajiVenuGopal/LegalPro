from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AcceptCase, CaseRequestViewSet, CaseViewSet, CaseUpdateViewSet, AppointmentViewSet, DocumentViewSet, FolderViewSet, MessageViewSet, InvoiceViewSet, ThreadViewSet, download_file

router = DefaultRouter()
router.register(r'cases', CaseViewSet)
router.register(r'case-updates', CaseUpdateViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'folders', FolderViewSet, basename='folder')
router.register(r'threads', ThreadViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register('case-requests', CaseRequestViewSet, basename='case-request')


urlpatterns = [
    path('', include(router.urls)),
    #path('messages/receiver/<int:receiver_id>/', MessageViewSet.as_view(), name='messages_for_receiver'),
    path('cases/<int:case_id>/accept/', AcceptCase.as_view(), name='accept-case'),
    path('api/download/<int:pk>/', download_file, name='download_file'),
]
