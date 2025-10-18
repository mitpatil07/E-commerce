# backend/product/urls.py - REPLACE YOUR ENTIRE FILE WITH THIS

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, ProductViewSet, CartViewSet, 
    OrderViewSet, ReviewViewSet
)
from .payment_views import create_razorpay_order, verify_payment

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
    
    # ⭐ Payment endpoints ⭐
    path('payment/create-order/', create_razorpay_order, name='create-razorpay-order'),
    path('payment/verify/', verify_payment, name='verify-payment'),
]