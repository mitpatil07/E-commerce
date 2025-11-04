# product/models.py - INTEGRATED & CLEAN VERSION
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0.0)
    reviews_count = models.IntegerField(default=0)
    in_stock = models.BooleanField(default=True)
    stock = models.IntegerField(default=0)  # Actual stock quantity
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        # Auto-update in_stock based on stock quantity
        self.in_stock = self.stock > 0
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/%Y/%m/%d/', blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    color_name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.product.name} - Image {self.order}"
    
    def get_image_url(self):
        """Return uploaded image URL or external URL"""
        if self.image:
            return self.image.url
        return self.image_url or ''




class ProductColor(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='colors')
    color_name = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.product.name} - {self.color_name}"


class ProductSize(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sizes')
    size_name = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.product.name} - {self.size_name}"


class ProductSpecification(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='specifications')
    specification = models.CharField(max_length=255)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.product.name} - {self.specification}"


class ProductMaterial(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='material')
    shell = models.CharField(max_length=255, blank=True, null=True)
    lining = models.CharField(max_length=255, blank=True, null=True)
    care_instructions = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.product.name} - Materials"


class Cart(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='cart',
        null=True, 
        blank=True
    )
    session_id = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.user:
            return f"Cart of {self.user.email}"
        return f"Guest Cart {self.session_id}"

    @property
    def total_price(self):
        return sum(item.subtotal for item in self.items.all())

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    selected_color = models.CharField(max_length=50, blank=True, null=True)
    selected_size = models.CharField(max_length=10, blank=True, null=True)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Allow multiple cart items with different color/size combinations
        unique_together = ('cart', 'product', 'selected_color', 'selected_size')

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"

    @property
    def subtotal(self):
        return self.product.price * self.quantity

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='orders'
    )
    order_number = models.CharField(max_length=20, unique=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Shipping Information
    shipping_name = models.CharField(max_length=255)
    shipping_email = models.EmailField()
    shipping_phone = models.CharField(max_length=20)
    shipping_address = models.TextField()
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100)
    shipping_zip_code = models.CharField(max_length=20)
    shipping_country = models.CharField(max_length=100, default='India')
    
    # Payment Information
    payment_method = models.CharField(max_length=50, default='Razorpay')  # Generic method
    is_paid = models.BooleanField(default=False)
    payment_status = models.CharField(
        max_length=20, 
        choices=PAYMENT_STATUS_CHOICES, 
        default='PENDING'
    )
    
    # Razorpay IDs
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    
    # ✅ NEW: Actual payment method from Razorpay
    actual_payment_method = models.CharField(
        max_length=50, 
        blank=True, 
        null=True,
        help_text="Actual payment method: card, upi, netbanking, wallet, etc."
    )
    
    # ✅ NEW: Payment method details
    payment_method_details = models.JSONField(
        blank=True, 
        null=True,
        help_text="Additional details like card type, bank name, UPI app, etc."
    )
        # ✅ NEW: Refund tracking fields
    refund_requested_at = models.DateTimeField(blank=True, null=True)
    refund_reason = models.TextField(blank=True, null=True)
    refund_completed_at = models.DateTimeField(blank=True, null=True)
    refund_notes = models.TextField(
        blank=True, 
        null=True,
        help_text="Admin notes about refund processing"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order_number}"
    
    def get_display_payment_method(self):
        """Return user-friendly payment method string"""
        if not self.actual_payment_method:
            return self.payment_method
        
        method = self.actual_payment_method.upper()
        
        # Add more details if available
        if self.payment_method_details:
            details = self.payment_method_details
            
            if method == 'CARD':
                card_type = details.get('card_type', '').upper()
                card_network = details.get('network', '').upper()
                if card_type and card_network:
                    return f"{card_network} {card_type} Card"
                elif card_network:
                    return f"{card_network} Card"
                return "Card"
            
            elif method == 'UPI':
                vpa = details.get('vpa', '')
                if vpa:
                    # Extract UPI app from VPA (e.g., "user@paytm" -> "Paytm")
                    app = vpa.split('@')[-1].capitalize() if '@' in vpa else ''
                    return f"UPI ({app})" if app else "UPI"
                return "UPI"
            
            elif method == 'NETBANKING':
                bank = details.get('bank', '').upper()
                return f"Net Banking ({bank})" if bank else "Net Banking"
            
            elif method == 'WALLET':
                wallet = details.get('wallet', '').capitalize()
                return f"{wallet} Wallet" if wallet else "Wallet"
        
        return method.replace('_', ' ').title()
    
    
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=255)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=1)
    selected_color = models.CharField(max_length=50, blank=True, null=True)
    selected_size = models.CharField(max_length=10, blank=True, null=True)

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

    @property
    def subtotal(self):
        return self.product_price * self.quantity


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('product', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.product.name} - {self.rating}★"