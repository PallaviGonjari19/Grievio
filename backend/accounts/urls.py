from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    CurrentUserView,
    RegisterView,
    LogoutView,
    PendingUsersListView,
    ApproveUserView,
    InstitutionStaffListView
)

urlpatterns = [
    # JWT Authentication Endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Registration, Verification & Profile
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('staff/', InstitutionStaffListView.as_view(), name='institution_staff_list'),
    path('pending-users/', PendingUsersListView.as_view(), name='pending_users'),
    path('users/<int:pk>/approve/', ApproveUserView.as_view(), name='approve_user'),
    path('logout/', LogoutView.as_view(), name='logout'),
]

