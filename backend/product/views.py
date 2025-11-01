# product/views.py - UPDATED with better error handling and logging
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Avg
from django.shortcuts import get_object_or_404
import uuid
import logging

from .models import (
    Category, Product, Cart, CartItem, Order, OrderItem, Review
)
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    CartSerializer, CartItemSerializer,
    OrderSerializer, ReviewSerializer
)

logger = logging.getLogger(__name__)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """List all categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def list(self, request, *args, **kwargs):
        """Override list to add logging"""
        logger.info("📋 CategoryViewSet.list() called")
        try:
            queryset = self.filter_queryset(self.get_queryset())
            logger.info(f"✅ Found {queryset.count()} categories")
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"❌ Error in CategoryViewSet.list(): {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """Product listing and detail views"""
    queryset = Product.objects.filter(is_active=True).prefetch_related(
        'images', 'colors', 'sizes', 'specifications', 'material', 'category'
    )
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['price', 'rating', 'created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_object(self):
        """Support both ID and slug lookup"""
        lookup_value = self.kwargs[self.lookup_url_kwarg or self.lookup_field]
        
        if lookup_value.isdigit():
            filter_kwargs = {'pk': lookup_value}
        else:
            filter_kwargs = {'slug': lookup_value}
        
        queryset = self.filter_queryset(self.get_queryset())
        obj = get_object_or_404(queryset, **filter_kwargs)
        self.check_object_permissions(self.request, obj)
        return obj

    def get_queryset(self):
        """Filter products based on query parameters and full-word search"""
        logger.info("📋 ProductViewSet.get_queryset() called")
        queryset = super().get_queryset()
        
        # Log query params
        logger.info(f"Query params: {self.request.query_params}")
        
        # --- Multi-word search ---
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(category__name__icontains=search)
            )
            logger.info(f"🔍 Filtering by search: {search}")
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category and category.lower() != 'all':
            queryset = queryset.filter(
                Q(category__slug=category) | Q(category__name__iexact=category)
            )
        
        # Filter by in_stock
        in_stock = self.request.query_params.get('in_stock', None)
        if in_stock is not None:
            queryset = queryset.filter(in_stock=in_stock.lower() == 'true')
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        count = queryset.count()
        logger.info(f"✅ Returning {count} products")
        
        return queryset

    def list(self, request, *args, **kwargs):
        """Override list to add logging"""
        logger.info("📋 ProductViewSet.list() called")
        try:
            queryset = self.filter_queryset(self.get_queryset())
            
            # Handle pagination if enabled
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            logger.info(f"✅ Returning {len(serializer.data)} products")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"❌ Error in ProductViewSet.list(): {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CartViewSet(viewsets.ModelViewSet):
    """Cart management"""
    serializer_class = CartSerializer
    
    def get_permissions(self):
        return [AllowAny()]


class OrderViewSet(viewsets.ModelViewSet):
    """Order management"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            'items',
            'items__product',
            'items__product__images'
        )
    def get_serializer_context(self):
        # ✅ This ensures request context is passed to serializers
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def create(self, request):
        """Create a new order from cart"""
        cart = Cart.objects.filter(user=request.user).first()
        
        if not cart or not cart.items.exists():
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate unique order number
        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"

        # Create order
        order = Order.objects.create(
            user=request.user,
            order_number=order_number,
            total_amount=cart.total_price,
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

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an order"""
        order = self.get_object()
        
        # Check if order can be cancelled
        if order.status.upper() not in ['PENDING', 'PROCESSING']:
            return Response(
                {'error': f'Cannot cancel order with status: {order.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update order status
        order.status = 'cancelled'
        
        # If payment was made, update payment status and initiate refund
        if order.payment_status == 'PAID' and order.razorpay_payment_id:
            order.payment_status = 'REFUNDED'
            
            # Initiate Razorpay refund
            try:
                client = razorpay.Client(
                    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
                )
                refund = client.payment.refund(
                    order.razorpay_payment_id,
                    {
                        "amount": int(float(order.total_amount) * 100),
                        "speed": "normal",
                        "notes": {
                            "reason": "Order cancelled by customer",
                            "order_number": order.order_number
                        }
                    }
                )
                logger.info(f"✅ Refund initiated for order {order.order_number}: {refund['id']}")
            except Exception as e:
                logger.error(f"❌ Refund failed for order {order.order_number}: {str(e)}")
                # Continue with cancellation even if refund API fails
        
        order.save()
        
        # Restore product stock
        for item in order.items.all():
            if item.product:
                item.product.stock += item.quantity
                item.product.save()
        
        serializer = self.get_serializer(order)
        return Response({
            'message': 'Order cancelled successfully',
            'order': serializer.data
        })
    
    # ✅ NEW: Refund Order
    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        """Request refund for an order"""
        order = self.get_object()
        
        # Check if order can be refunded
        if order.payment_status != 'PAID':
            return Response(
                {'error': 'Order payment is not completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if order.status.upper() not in ['DELIVERED', 'SHIPPED']:
            return Response(
                {'error': f'Cannot refund order with status: {order.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not order.razorpay_payment_id:
            return Response(
                {'error': 'No payment ID found for refund'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Initiate Razorpay refund
        try:
            client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )
            
            refund = client.payment.refund(
                order.razorpay_payment_id,
                {
                    "amount": int(float(order.total_amount) * 100),
                    "speed": "normal",
                    "notes": {
                        "reason": request.data.get('reason', 'Customer requested refund'),
                        "order_number": order.order_number
                    }
                }
            )
            
            # Update order
            order.payment_status = 'REFUNDED'
            order.status = 'cancelled'
            order.save()
            
            logger.info(f"✅ Refund successful for order {order.order_number}: {refund['id']}")
            
            serializer = self.get_serializer(order)
            return Response({
                'message': 'Refund initiated successfully. Amount will be credited within 5-7 business days.',
                'refund_id': refund['id'],
                'order': serializer.data
            })
            
        except Exception as e:
            logger.error(f"❌ Refund failed for order {order.order_number}: {str(e)}")
            return Response(
                {'error': f'Refund failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ReviewViewSet(viewsets.ModelViewSet):
    """Product reviews"""
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        product_id = self.request.query_params.get('product_id')
        if product_id:
            return Review.objects.filter(product_id=product_id)
        return Review.objects.all()

    def create(self, request):
        """Create a review for a product"""
        product_id = request.data.get('product_id')
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user already reviewed this product
        if Review.objects.filter(user=request.user, product=product).exists():
            return Response(
                {'error': 'You have already reviewed this product'},
                status=status.HTTP_400_BAD_REQUEST
            )

        review = Review.objects.create(
            user=request.user,
            product=product,
            rating=request.data.get('rating'),
            comment=request.data.get('comment', '')
        )

        # Update product rating
        avg_rating = Review.objects.filter(product=product).aggregate(
            Avg('rating')
        )['rating__avg']
        product.rating = round(avg_rating, 1)
        product.reviews_count = Review.objects.filter(product=product).count()
        product.save()

        serializer = self.get_serializer(review)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    


    