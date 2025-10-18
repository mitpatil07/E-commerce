# accounts/views.py - COMPLETE UPDATED VERSION
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class RegisterUserView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Register a new user"""
        logger.info("📝 Registration request received")
        
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        
        # Validation
        if not email or not password:
            logger.warning("❌ Missing email or password")
            return Response({
                'success': False,
                'message': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            logger.warning(f"❌ User already exists: {email}")
            return Response({
                'success': False,
                'message': 'User with this email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user
        try:
            user = User.objects.create(
                email=email,
                username=email,
                first_name=first_name,
                last_name=last_name,
                password=make_password(password)
            )
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            logger.info(f"✅ User registered successfully: {email}")
            
            return Response({
                'success': True,
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"❌ Error creating user: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error creating user: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Login user with email and password"""
        logger.info("=" * 60)
        logger.info("🔐 LOGIN REQUEST RECEIVED")
        logger.info(f"Request data keys: {list(request.data.keys())}")
        logger.info("=" * 60)
        
        email = request.data.get('email')
        password = request.data.get('password')
        
        logger.info(f"📧 Email: {email}")
        logger.info(f"🔑 Password provided: {bool(password)}")
        
        # Validation
        if not email or not password:
            logger.warning("❌ Missing credentials")
            return Response({
                'success': False,
                'message': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Try to get user by email
        try:
            user = User.objects.get(email=email)
            logger.info(f"✅ User found: {user.email}")
            logger.info(f"   Active: {user.is_active}")
            logger.info(f"   Has password: {user.has_usable_password()}")
        except User.DoesNotExist:
            logger.warning(f"❌ User not found: {email}")
            return Response({
                'success': False,
                'message': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check password
        password_valid = user.check_password(password)
        logger.info(f"🔐 Password check: {password_valid}")
        
        if not password_valid:
            logger.warning("❌ Invalid password")
            return Response({
                'success': False,
                'message': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user is active
        if not user.is_active:
            logger.warning("❌ User account is disabled")
            return Response({
                'success': False,
                'message': 'Account is disabled'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate tokens
        try:
            refresh = RefreshToken.for_user(user)
            logger.info("✅ Tokens generated successfully")
            logger.info("✅ Login successful")
            logger.info("=" * 60)
            
            return Response({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"❌ Error generating tokens: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error generating tokens: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Login/Register user with Google OAuth"""
        logger.info("🔐 Google login request received")
        
        token = request.data.get('token')
        
        if not token:
            return Response({
                'success': False,
                'message': 'Token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                getattr(settings, 'GOOGLE_CLIENT_ID', None)
            )
            
            # Get user info from token
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            
            logger.info(f"✅ Google token verified for: {email}")
            
            # Get or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'is_google_user': True,
                }
            )
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            logger.info(f"✅ Google login successful: {email} (created={created})")
            
            return Response({
                'success': True,
                'message': 'Google login successful',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            logger.error(f"❌ Invalid Google token: {str(e)}")
            return Response({
                'success': False,
                'message': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"❌ Google login error: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error during Google login: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user profile"""
        user = request.user
        return Response({
            'success': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'username': user.username,
                'phone': user.phone,
                'address': user.address,
            }
        }, status=status.HTTP_200_OK)
    
    def patch(self, request):
        """Update user profile"""
        user = request.user
        
        # Update allowed fields
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        phone = request.data.get('phone')
        address = request.data.get('address')
        
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if phone is not None:
            user.phone = phone
        if address is not None:
            user.address = address
        
        user.save()
        
        logger.info(f"✅ Profile updated for: {user.email}")
        
        return Response({
            'success': True,
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'address': user.address,
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Logout user by blacklisting refresh token"""
        try:
            refresh_token = request.data.get('refresh')
            
            if not refresh_token:
                return Response({
                    'success': False,
                    'message': 'Refresh token is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            logger.info(f"✅ User logged out: {request.user.email}")
            
            return Response({
                'success': True,
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"❌ Logout error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Invalid token or already logged out'
            }, status=status.HTTP_400_BAD_REQUEST)