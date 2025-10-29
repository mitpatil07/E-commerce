# payment/views.py - Enhanced with detailed auth debugging
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import razorpay
import hmac
import hashlib
import uuid
import logging

from product.models import Cart, Order, OrderItem

logger = logging.getLogger(__name__)

# Initialize Razorpay client
razorpay_client = razorpay.Client(
    auth=(
        settings.RAZORPAY_KEY_ID,
        settings.RAZORPAY_KEY_SECRET
    )
)


class CreateRazorpayOrderView(APIView):
    """Create a Razorpay order"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        logger.info("=" * 60)
        logger.info("💳 CREATE RAZORPAY ORDER REQUEST")
        
        # 🔍 ENHANCED AUTH DEBUGGING
        logger.info(f"🔐 AUTH DEBUGGING:")
        logger.info(f"  - User: {request.user}")
        logger.info(f"  - Is Authenticated: {request.user.is_authenticated}")
        logger.info(f"  - User ID: {getattr(request.user, 'id', None)}")
        logger.info(f"  - User Email: {getattr(request.user, 'email', None)}")
        logger.info(f"  - Auth Header: {request.META.get('HTTP_AUTHORIZATION', 'NOT PRESENT')[:50]}")
        logger.info(f"  - Request Method: {request.method}")
        logger.info(f"  - Content Type: {request.content_type}")
        logger.info(f"  - Remote Addr: {request.META.get('REMOTE_ADDR')}")
        logger.info(f"  - X-Forwarded-For: {request.META.get('HTTP_X_FORWARDED_FOR')}")
        
        # 🚨 EXPLICIT AUTH CHECK
        if not request.user.is_authenticated:
            logger.error("❌ AUTHENTICATION FAILED - User not authenticated")
            logger.error(f"   User object: {request.user}")
            logger.error(f"   Request headers: {dict(request.headers)}")
            return Response({
                'success': False,
                'message': 'Authentication credentials were not provided.',
                'detail': 'User not authenticated'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        logger.info(f"✅ User authenticated: {request.user.email}")
        logger.info(f"📦 Request data: {request.data}")
        logger.info("=" * 60)
        
        try:
            # Get user's cart
            cart = Cart.objects.filter(user=request.user).first()
            
            if not cart or not cart.items.exists():
                logger.error("❌ Cart is empty or not found")
                return Response({
                    'success': False,
                    'message': 'Cart is empty'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            logger.info(f"✅ Cart found: {cart.total_items} items, ₹{cart.total_price}")
            
            # Calculate amount (Razorpay expects amount in paise)
            amount = int(float(cart.total_price) * 100)
            
            logger.info(f"💰 Amount: ₹{cart.total_price} = {amount} paise")
            
            # Create Razorpay order
            razorpay_order = razorpay_client.order.create({
                'amount': amount,
                'currency': 'INR',
                'payment_capture': 1  # Auto capture
            })
            
            logger.info(f"✅ Razorpay order created: {razorpay_order['id']}")
            logger.info("=" * 60)
            
            return Response({
                'success': True,
                'razorpay_order_id': razorpay_order['id'],
                'amount': amount,
                'currency': 'INR',
                'key': settings.RAZORPAY_KEY_ID,
                'cart_total': f"{float(cart.total_price):.2f}"
            }, status=status.HTTP_200_OK)
            
        except Cart.DoesNotExist:
            logger.error("❌ Cart not found for user")
            return Response({
                'success': False,
                'message': 'Cart not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            logger.error(f"❌ Error creating Razorpay order: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({
                'success': False,
                'message': f'Failed to create payment order: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyPaymentView(APIView):
    """Verify Razorpay payment and create order"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        logger.info("=" * 60)
        logger.info("✅ VERIFY PAYMENT REQUEST")
        
        # 🔍 AUTH CHECK
        if not request.user.is_authenticated:
            logger.error("❌ User not authenticated for payment verification")
            return Response({
                'success': False,
                'message': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        logger.info(f"User: {request.user.email}")
        logger.info(f"Request data keys: {list(request.data.keys())}")
        logger.info("=" * 60)
        
        try:
            # Get payment details
            razorpay_order_id = request.data.get('razorpay_order_id')
            razorpay_payment_id = request.data.get('razorpay_payment_id')
            razorpay_signature = request.data.get('razorpay_signature')
            
            logger.info(f"Order ID: {razorpay_order_id}")
            logger.info(f"Payment ID: {razorpay_payment_id}")
            logger.info(f"Signature: {razorpay_signature[:20] if razorpay_signature else 'None'}...")
            
            if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
                logger.error("❌ Missing payment details")
                return Response({
                    'success': False,
                    'message': 'Missing payment details'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify signature
            try:
                params_dict = {
                    'razorpay_order_id': razorpay_order_id,
                    'razorpay_payment_id': razorpay_payment_id,
                    'razorpay_signature': razorpay_signature
                }
                razorpay_client.utility.verify_payment_signature(params_dict)
                logger.info("✅ Payment signature verified")
            except razorpay.errors.SignatureVerificationError:
                logger.error("❌ Payment signature verification failed")
                return Response({
                    'success': False,
                    'message': 'Payment verification failed'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user's cart
            cart = Cart.objects.filter(user=request.user).first()
            
            if not cart or not cart.items.exists():
                logger.error("❌ Cart is empty or not found")
                return Response({
                    'success': False,
                    'message': 'Cart is empty'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            logger.info(f"✅ Cart found: {cart.total_items} items")
            
            # Generate unique order number
            order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
            
            # Create order
            order = Order.objects.create(
                user=request.user,
                order_number=order_number,
                total_amount=cart.total_price,
                payment_method='razorpay',
                payment_status='completed',
                razorpay_order_id=razorpay_order_id,
                razorpay_payment_id=razorpay_payment_id,
                shipping_name=request.data.get('shipping_name'),
                shipping_email=request.data.get('shipping_email'),
                shipping_phone=request.data.get('shipping_phone'),
                shipping_address=request.data.get('shipping_address'),
                shipping_city=request.data.get('shipping_city'),
                shipping_state=request.data.get('shipping_state'),
                shipping_zip_code=request.data.get('shipping_zip_code'),
                shipping_country=request.data.get('shipping_country', 'India')
            )
            
            logger.info(f"✅ Order created: {order_number}")
            
            # Create order items from cart
            for cart_item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    product_name=cart_item.product.name,
                    product_price=cart_item.product.price,
                    quantity=cart_item.quantity,
                    selected_color=cart_item.selected_color,
                    selected_size=cart_item.selected_size
                )
            
            logger.info(f"✅ Created {cart.items.count()} order items")
            
            # Clear cart
            cart.items.all().delete()
            logger.info("✅ Cart cleared")
            
            logger.info("✅ Payment verification and order creation successful")
            logger.info("=" * 60)
            
            return Response({
                'success': True,
                'message': 'Payment verified and order created successfully',
                'order': {
                    'id': order.id,
                    'order_number': order.order_number,
                    'total_amount': str(order.total_amount),
                    'status': order.status
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"❌ Error verifying payment: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({
                'success': False,
                'message': f'Error verifying payment: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)