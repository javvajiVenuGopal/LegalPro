from rest_framework.permissions import BasePermission

class IsLawyer(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'lawyer'

class IsClient(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'client'
