# backend/product/serializers.py - FIXED VERSION WITH PROPER IMAGE URLS

from rest_framework import serializers
from .models import (
    Category, Product, ProductImage, ProductColor, ProductSize,
    ProductSpecification, ProductMaterial, Cart, CartItem, Order, OrderItem, Review
)


class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'is_primary', 'order']
    
    def get_image_url(self, obj):
        """Return uploaded image URL or external URL"""
        request = self.context.get('request')
        
        # For uploaded images
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            # Fallback without request
            return f"http://127.0.0.1:8000{obj.image.url}"
        
        # For external URLs
        return obj.image_url or None


class ProductColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductColor
        fields = ['id', 'color_name']
    
    def to_representation(self, instance):
        return instance.color_name


class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ['id', 'size_name']
    
    def to_representation(self, instance):
        return instance.size_name


class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ['id', 'specification', 'order']
    
    def to_representation(self, instance):
        return instance.specification


class ProductMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMaterial
        fields = ['shell', 'lining', 'care_instructions']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']


class ProductListSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.name')
    image = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()  # ✅ Added full images array
    colors = ProductColorSerializer(many=True, read_only=True)
    sizes = ProductSizeSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'price', 'category', 'image', 'images',
            'rating', 'reviews_count', 'in_stock', 'colors', 'sizes'
        ]

    def get_image(self, obj):
        """Get primary image URL using ProductImageSerializer"""
        request = self.context.get('request')
        
        # Try to get primary image first
        primary_image = obj.images.filter(is_primary=True).first()
        if not primary_image:
            # Fall back to first image
            primary_image = obj.images.first()
        
        if primary_image:
            # Use ProductImageSerializer to get proper URL
            serializer = ProductImageSerializer(primary_image, context={'request': request})
            return serializer.data.get('image_url')
        
        return None

    def get_images(self, obj):
        """Get all product images with proper URLs"""
        request = self.context.get('request')
        images = obj.images.all().order_by('order')
        serializer = ProductImageSerializer(images, many=True, context={'request': request})
        return serializer.data


class ProductDetailSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.name')
    category_name = serializers.CharField(source='category.name')  # Added for compatibility
    image = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    colors = ProductColorSerializer(many=True, read_only=True)
    sizes = ProductSizeSerializer(many=True, read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    material = ProductMaterialSerializer(read_only=True)
    reviews = serializers.SerializerMethodField()
    original_price = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        required=False, 
        allow_null=True
    )

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'price', 'original_price', 'category', 'category_name',
            'description', 'rating', 'reviews_count', 'reviews', 'in_stock', 
            'image', 'images', 'colors', 'sizes', 'specifications', 
            'material', 'created_at'
        ]

    def get_image(self, obj):
        """Get primary image URL using ProductImageSerializer"""
        request = self.context.get('request')
        
        primary_image = obj.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.images.first()
        
        if primary_image:
            serializer = ProductImageSerializer(primary_image, context={'request': request})
            return serializer.data.get('image_url')
        
        return None

    def get_images(self, obj):
        """Get all product images as objects with full URLs"""
        request = self.context.get('request')
        images = obj.images.all().order_by('order')
        serializer = ProductImageSerializer(images, many=True, context={'request': request})
        return serializer.data
    
    def get_reviews(self, obj):
        return obj.reviews_count if obj.reviews_count > 0 else None


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'product_id', 'quantity',
            'selected_color', 'selected_size', 'subtotal', 'added_at'
        ]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price', 'total_items', 'created_at', 'updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product_name', 'product_price', 'quantity',
            'selected_color', 'selected_size', 'subtotal'
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'total_amount', 'status',
            'shipping_name', 'shipping_email', 'shipping_phone',
            'shipping_address', 'shipping_city', 'shipping_state',
            'shipping_zip_code', 'shipping_country',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['order_number', 'created_at', 'updated_at']


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']