# backend/product/payment_views.py - CREATE THIS NEW FILE
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import razorpay
import hmac
import hashlib
import uuid
import logging

from .models import Cart, Order, OrderItem

logger = logging.getLogger(__name__)

# Initialize Razorpay client
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_razorpay_order(request):
    """Create a Razorpay order for payment"""
    logger.info(f"💳 Creating Razorpay order for user: {request.user.email}")
    
    try:
        cart = Cart.objects.filter(user=request.user).first()
        
        if not cart or not cart.items.exists():
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate amount in paise (Razorpay uses smallest currency unit)
        amount_in_paise = int(float(cart.total_price) * 100)
        
        # Create Razorpay order
        razorpay_order = razorpay_client.order.create({
            'amount': amount_in_paise,
            'currency': 'INR',
            'payment_capture': 1,
            'notes': {
                'user_id': str(request.user.id),
                'user_email': request.user.email,
                'cart_id': str(cart.id)
            }
        })
        
        logger.info(f"✅ Razorpay order created: {razorpay_order['id']}")
        
        return Response({
            'razorpay_order_id': razorpay_order['id'],
            'amount': amount_in_paise,
            'currency': 'INR',
            'key': settings.RAZORPAY_KEY_ID,
            'cart_total': str(cart.total_price)
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"❌ Error creating Razorpay order: {str(e)}")
        return Response(
            {'error': f'Failed to create payment order: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """Verify Razorpay payment and create order"""
    logger.info(f"🔐 Verifying payment for user: {request.user.email}")
    
    try:
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        
        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response(
                {'error': 'Missing payment verification parameters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify signature
        generated_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != razorpay_signature:
            return Response(
                {'error': 'Payment verification failed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info("✅ Payment signature verified")
        
        # Get user's cart
        cart = Cart.objects.filter(user=request.user).first()
        
        if not cart or not cart.items.exists():
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate order number
        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        
        # Create order
        order = Order.objects.create(
            user=request.user,
            order_number=order_number,
            total_amount=cart.total_price,
            status='processing',
            payment_method='Razorpay',
            payment_status='PAID',
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature,
            is_paid=True,
            shipping_name=request.data.get('shipping_name'),
            shipping_email=request.data.get('shipping_email'),
            shipping_phone=request.data.get('shipping_phone'),
            shipping_address=request.data.get('shipping_address'),
            shipping_city=request.data.get('shipping_city'),
            shipping_state=request.data.get('shipping_state'),
            shipping_zip_code=request.data.get('shipping_zip_code'),
            shipping_country=request.data.get('shipping_country', 'India')
        )
        
        # Create order items
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
        
        # Clear cart
        cart.items.all().delete()
        
        logger.info(f"✅ Order created: {order.order_number}")
        
        return Response({
            'message': 'Payment verified and order created successfully',
            'order_number': order.order_number,
            'order_id': order.id,
            'total_amount': str(order.total_amount),
            'payment_id': razorpay_payment_id
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"❌ Error verifying payment: {str(e)}")
        return Response(
            {'error': f'Payment verification failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )