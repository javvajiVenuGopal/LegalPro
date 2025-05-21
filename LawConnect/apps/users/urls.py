from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

urlpatterns = [
    #path('', include(router.urls)),
   path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
      path('clients/', ClientListView.as_view(), name='client-list'),
    path('lawyers/', LawyerListView.as_view(), name='lawyer-list'),
    path('clients/<int:pk>/', ClientDetailView.as_view(), name='client-detail'),
    path('lawyers/<int:pk>/', LawyerDetailView.as_view(), name='lawyer-detail'),

]