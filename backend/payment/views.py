# payment/views.py - Clean version without logs
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import razorpay
import uuid

from product.models import Cart, Order, OrderItem

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
        if not request.user.is_authenticated:
            return Response({
                'success': False,
                'message': 'Authentication credentials were not provided.',
                'detail': 'User not authenticated'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            cart = Cart.objects.filter(user=request.user).first()
            
            if not cart or not cart.items.exists():
                return Response({
                    'success': False,
                    'message': 'Cart is empty'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate amount (Razorpay expects amount in paise)
            amount = int(float(cart.total_price) * 100)
            
            # Create Razorpay order
            razorpay_order = razorpay_client.order.create({
                'amount': amount,
                'currency': 'INR',
                'payment_capture': 1
            })
            
            return Response({
                'success': True,
                'razorpay_order_id': razorpay_order['id'],
                'amount': amount,
                'currency': 'INR',
                'key': settings.RAZORPAY_KEY_ID,
                'cart_total': f"{float(cart.total_price):.2f}"
            }, status=status.HTTP_200_OK)
            
        except Cart.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Cart not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to create payment order: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyPaymentView(APIView):
    """Verify Razorpay payment and create order"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({
                'success': False,
                'message': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            razorpay_order_id = request.data.get('razorpay_order_id')
            razorpay_payment_id = request.data.get('razorpay_payment_id')
            razorpay_signature = request.data.get('razorpay_signature')
            
            if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
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
            except razorpay.errors.SignatureVerificationError:
                return Response({
                    'success': False,
                    'message': 'Payment verification failed'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            cart = Cart.objects.filter(user=request.user).first()
            
            if not cart or not cart.items.exists():
                return Response({
                    'success': False,
                    'message': 'Cart is empty'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate unique order number
            order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
            
            # Create order
            order = Order.objects.create(
                user=request.user,
                order_number=order_number,
                total_amount=cart.total_price,
                payment_method='razorpay',
                payment_status='PAID',
                is_paid=True,
                razorpay_order_id=razorpay_order_id,
                razorpay_payment_id=razorpay_payment_id,
                razorpay_signature=razorpay_signature,
                shipping_name=request.data.get('shipping_name'),
                shipping_email=request.data.get('shipping_email'),
                shipping_phone=request.data.get('shipping_phone'),
                shipping_address=request.data.get('shipping_address'),
                shipping_city=request.data.get('shipping_city'),
                shipping_state=request.data.get('shipping_state'),
                shipping_zip_code=request.data.get('shipping_zip_code'),
                shipping_country=request.data.get('shipping_country', 'India')
            )
            
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
            
            # Clear cart
            cart.items.all().delete()
            
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
            return Response({
                'success': False,
                'message': f'Error verifying payment: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)