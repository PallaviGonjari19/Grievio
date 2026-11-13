from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import CurrentUserView, RegisterView, LogoutView

urlpatterns = [
    # JWT Authentication Endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Registration & Profile
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
