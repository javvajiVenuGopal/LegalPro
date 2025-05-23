from rest_framework.permissions import BasePermission

class IsLawyer(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'lawyer'

class IsClient(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'client'
class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.user or request.user.is_staff