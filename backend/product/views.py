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
        """Filter products based on query parameters"""
        logger.info("📋 ProductViewSet.get_queryset() called")
        queryset = super().get_queryset()
        
        # Log query params
        logger.info(f"Query params: {self.request.query_params}")
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category and category.lower() != 'all':
            logger.info(f"🔍 Filtering by category: {category}")
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

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products (top rated)"""
        logger.info("⭐ Featured products requested")
        try:
            featured_products = self.get_queryset().filter(rating__gte=4.5)[:8]
            serializer = self.get_serializer(featured_products, many=True)
            logger.info(f"✅ Returning {len(serializer.data)} featured products")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"❌ Error fetching featured products: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CartViewSet(viewsets.ModelViewSet):
    """Cart management"""
    serializer_class = CartSerializer
    
    def get_permissions(self):
        return [AllowAny()]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Cart.objects.filter(user=self.request.user)
        
        session_id = self.request.session.session_key
        if not session_id:
            self.request.session.create()
            session_id = self.request.session.session_key
        
        return Cart.objects.filter(session_id=session_id)

    def get_cart(self):
        """Get or create cart for current user/session"""
        if self.request.user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=self.request.user)
            logger.info(f"{'Created' if created else 'Retrieved'} cart for user: {self.request.user.email}")
        else:
            session_id = self.request.session.session_key
            if not session_id:
                self.request.session.create()
                session_id = self.request.session.session_key
            cart, created = Cart.objects.get_or_create(session_id=session_id)
            logger.info(f"{'Created' if created else 'Retrieved'} cart for session: {session_id}")
        return cart

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current user's cart"""
        logger.info("🛒 Getting current cart")
        try:
            cart = self.get_cart()
            serializer = self.get_serializer(cart)
            logger.info(f"✅ Cart retrieved: {cart.total_items} items, ${cart.total_price}")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"❌ Error getting cart: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add item to cart"""
        logger.info(f"➕ Adding item to cart: {request.data}")
        try:
            cart = self.get_cart()
            product_id = request.data.get('product_id')
            quantity = int(request.data.get('quantity', 1))
            selected_color = request.data.get('selected_color')
            selected_size = request.data.get('selected_size')

            # Validate product
            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                logger.error(f"❌ Product not found: {product_id}")
                return Response(
                    {'error': 'Product not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            if not product.in_stock:
                logger.error(f"❌ Product out of stock: {product.name}")
                return Response(
                    {'error': 'Product is out of stock'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if item already exists
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                selected_color=selected_color,
                selected_size=selected_size,
                defaults={'quantity': quantity}
            )

            if not created:
                cart_item.quantity += quantity
                cart_item.save()
                logger.info(f"✅ Updated existing cart item quantity: {cart_item.quantity}")
            else:
                logger.info(f"✅ Created new cart item")

            serializer = CartSerializer(cart)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"❌ Error adding to cart: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['patch'])
    def update_item(self, request):
        """Update cart item quantity"""
        logger.info(f"✏️ Updating cart item: {request.data}")
        try:
            cart = self.get_cart()
            item_id = request.data.get('item_id')
            quantity = int(request.data.get('quantity'))

            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.quantity = quantity
            cart_item.save()
            
            logger.info(f"✅ Updated cart item quantity to {quantity}")
            
            serializer = CartSerializer(cart)
            return Response(serializer.data)
            
        except CartItem.DoesNotExist:
            logger.error(f"❌ Cart item not found: {item_id}")
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"❌ Error updating cart item: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        """Remove item from cart"""
        item_id = request.query_params.get('item_id')
        logger.info(f"🗑️ Removing cart item: {item_id}")
        
        try:
            cart = self.get_cart()
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
            
            logger.info(f"✅ Removed cart item")
            
            serializer = CartSerializer(cart)
            return Response(serializer.data)
            
        except CartItem.DoesNotExist:
            logger.error(f"❌ Cart item not found: {item_id}")
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"❌ Error removing cart item: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """Clear all items from cart"""
        logger.info("🗑️ Clearing cart")
        try:
            cart = self.get_cart()
            cart.items.all().delete()
            
            logger.info("✅ Cart cleared")
            
            serializer = CartSerializer(cart)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"❌ Error clearing cart: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class OrderViewSet(viewsets.ModelViewSet):
    """Order management"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

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
    


    