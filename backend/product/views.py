# product/views.py - Clean version without logs
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Avg
from django.shortcuts import get_object_or_404
import uuid
from django.utils import timezone
from datetime import timedelta



from .models import (
    Category, Product, Cart, CartItem, Order, OrderItem, Review
)
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    CartSerializer,
    OrderSerializer, ReviewSerializer
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """List all categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def list(self, request, *args, **kwargs):
        """Override list to add error handling"""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
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
        """Filter products based on query parameters"""
        queryset = super().get_queryset()
        
        # Multi-word search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(category__name__icontains=search)
            )
        
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
        
        return queryset

    def list(self, request, *args, **kwargs):
        """Override list with error handling"""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CartViewSet(viewsets.ModelViewSet):
    """Cart management with custom actions"""
    serializer_class = CartSerializer
    
    def get_permissions(self):
        return [AllowAny()]
    
    def get_cart(self, request):
        """Get or create cart for user or session"""
        if request.user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=request.user)
            return cart
        else:
            session_key = request.session.session_key
            if not session_key:
                request.session.create()
                session_key = request.session.session_key
            
            cart, created = Cart.objects.get_or_create(session_key=session_key)
            return cart
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def current(self, request):
        """Get current cart"""
        try:
            cart = self.get_cart(request)
            serializer = self.get_serializer(cart)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e), 'items': [], 'total_items': 0, 'total_price': 0},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def add_item(self, request):
        """Add item to cart with duplicate prevention"""
        try:
            product_id = request.data.get('product_id')
            quantity = int(request.data.get('quantity', 1))
            selected_color = request.data.get('selected_color')
            selected_size = request.data.get('selected_size')
            
            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                return Response(
                    {'error': 'Product not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if not product.in_stock or product.stock < quantity:
                return Response(
                    {'error': 'Product is out of stock or insufficient quantity'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            cart = self.get_cart(request)
            
            cart_item = cart.items.filter(
                product=product,
                selected_color=selected_color,
                selected_size=selected_size
            ).first()
            
            if cart_item:
                time_since_update = timezone.now() - cart_item.updated_at
                if time_since_update < timedelta(seconds=2):
                    serializer = self.get_serializer(cart)
                    return Response({
                        'message': 'Item already in cart',
                        'cart': serializer.data
                    }, status=status.HTTP_200_OK)
                
                new_quantity = cart_item.quantity + quantity
                if product.stock < new_quantity:
                    return Response(
                        {'error': f'Only {product.stock} items available in stock'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                cart_item.quantity = new_quantity
                cart_item.save()
            else:
                cart_item = CartItem.objects.create(
                    cart=cart,
                    product=product,
                    quantity=quantity,
                    selected_color=selected_color,
                    selected_size=selected_size
                )
            
            serializer = self.get_serializer(cart)
            return Response({
                'message': 'Item added to cart successfully',
                'cart': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response(
                {'error': 'Invalid quantity or product ID'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['patch'], permission_classes=[AllowAny])
    def update_item(self, request):
        """Update cart item quantity"""
        try:
            item_id = request.data.get('item_id')
            quantity = int(request.data.get('quantity', 1))
            
            if quantity < 1:
                return Response(
                    {'error': 'Quantity must be at least 1'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            cart = self.get_cart(request)
            
            try:
                cart_item = cart.items.get(id=item_id)
            except CartItem.DoesNotExist:
                return Response(
                    {'error': 'Cart item not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if cart_item.product.stock < quantity:
                return Response(
                    {'error': f'Only {cart_item.product.stock} items available'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            cart_item.quantity = quantity
            cart_item.save()
            
            serializer = self.get_serializer(cart)
            return Response({
                'message': 'Cart updated successfully',
                'cart': serializer.data
            })
            
        except ValueError:
            return Response(
                {'error': 'Invalid quantity'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['delete'], permission_classes=[AllowAny])
    def remove_item(self, request):
        """Remove item from cart"""
        try:
            item_id = request.query_params.get('item_id')
            
            if not item_id:
                return Response(
                    {'error': 'item_id parameter is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            cart = self.get_cart(request)
            
            try:
                cart_item = cart.items.get(id=item_id)
                cart_item.delete()
            except CartItem.DoesNotExist:
                return Response(
                    {'error': 'Cart item not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = self.get_serializer(cart)
            return Response({
                'message': 'Item removed from cart',
                'cart': serializer.data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['delete'], permission_classes=[AllowAny])
    def clear(self, request):
        """Clear all items from cart"""
        try:
            cart = self.get_cart(request)
            items_count = cart.items.count()
            cart.items.all().delete()
            
            serializer = self.get_serializer(cart)
            return Response({
                'message': f'Cart cleared successfully. Removed {items_count} items.',
                'cart': serializer.data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrderViewSet(viewsets.ModelViewSet):
    """Order management with refund workflow"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            'items',
            'items__product',
            'items__product__images'
        )
    
    def get_serializer_context(self):
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

        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"

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

        cart.items.all().delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an order - automatically initiates refund if paid"""
        order = self.get_object()
        
        # Check if order can be cancelled
        if order.status.upper() not in ['PENDING', 'PROCESSING']:
            return Response(
                {'error': f'Cannot cancel order with status: {order.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already refunding/refunded
        if order.payment_status in ['REFUND_PENDING', 'REFUNDED']:
            return Response(
                {'error': 'Refund already in progress or completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cancel the order
        order.status = 'cancelled'
        
        # ✅ If order was paid, mark refund as pending
        if order.payment_status == 'PAID' and order.razorpay_payment_id:
            order.payment_status = 'REFUND_PENDING'
            order.refund_requested_at = timezone.now()
            order.refund_reason = request.data.get('reason', 'Order cancelled by customer')
            message = 'Order cancelled. Refund is being processed and will be completed within 5-7 business days.'
        else:
            # If not paid, just cancel
            message = 'Order cancelled successfully.'
        
        order.save()
        
        # Restore stock
        for item in order.items.all():
            if item.product:
                item.product.stock += item.quantity
                item.product.save()
        
        serializer = self.get_serializer(order)
        return Response({
            'message': message,
            'order': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        """Request refund for a delivered/shipped order"""
        order = self.get_object()
        
        # Validation checks
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
        
        # Check if already refunding/refunded
        if order.payment_status in ['REFUND_PENDING', 'REFUNDED']:
            return Response(
                {'error': 'Refund already in progress or completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get refund reason from request
        reason = request.data.get('reason', '').strip()
        if not reason:
            return Response(
                {'error': 'Refund reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ✅ Update order status to refund pending
        order.payment_status = 'REFUND_PENDING'
        order.refund_requested_at = timezone.now()
        order.refund_reason = reason
        order.save()
        
        serializer = self.get_serializer(order)
        return Response({
            'message': 'Refund request submitted successfully. Our team will process it within 5-7 business days.',
            'order': serializer.data
        })
    

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

        avg_rating = Review.objects.filter(product=product).aggregate(
            Avg('rating')
        )['rating__avg']
        product.rating = round(avg_rating, 1)
        product.reviews_count = Review.objects.filter(product=product).count()
        product.save()

        serializer = self.get_serializer(review)
        return Response(serializer.data, status=status.HTTP_201_CREATED)