# accounts/urls.py
from django.urls import path
from .views import (
    RegisterUserView,
    LoginView,
    GoogleLoginView,
    ProfileView,
    LogoutView,
)

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('google-login/', GoogleLoginView.as_view(), name='google-login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('logout/', LogoutView.as_view(), name='logout'),
]