from rest_framework.permissions import BasePermission

class IsLawyer(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'lawyer'

class IsClient(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'client'

class IsCaseOwner(BasePermission):
    def has_permission(self, request, view):
        case = view.get_object()
        return request.user == case.client or request.user == case.lawyer
