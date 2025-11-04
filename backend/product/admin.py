# backend/product/admin.py - SIMPLE REFUND WORKFLOW FOR ADMIN

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Category, Product, ProductImage, ProductColor, ProductSize,
    ProductSpecification, ProductMaterial, Cart, CartItem, Order, OrderItem, Review
)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductColorInline(admin.TabularInline):
    model = ProductColor
    extra = 1


class ProductSizeInline(admin.TabularInline):
    model = ProductSize
    extra = 1


class ProductSpecificationInline(admin.TabularInline):
    model = ProductSpecification
    extra = 1


class ProductMaterialInline(admin.StackedInline):
    model = ProductMaterial
    extra = 0


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'rating', 'reviews_count', 'in_stock', 'created_at']
    list_filter = ['category', 'in_stock', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['price', 'in_stock']
    inlines = [
        ProductImageInline,
        ProductColorInline,
        ProductSizeInline,
        ProductSpecificationInline,
        ProductMaterialInline
    ]


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['subtotal']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'session_id', 'total_items', 'total_price', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'session_id']
    readonly_fields = ['total_items', 'total_price']
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'product_price', 'quantity', 'subtotal']
    can_delete = False
    
    def subtotal(self, obj):
        return f"₹{obj.subtotal}"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number', 'user', 'total_amount', 'status', 
        'payment_status_badge', 'created_at'
    ]
    list_filter = [
        'status', 
        'payment_status',  # ✅ Filter by payment status (includes REFUND_PENDING, REFUNDED)
        'created_at'
    ]
    search_fields = ['order_number', 'user__email', 'shipping_email']
    list_editable = ['status']  # Can change order status in list view
    readonly_fields = [
        'order_number', 'created_at', 'updated_at',
        'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature',
        'refund_requested_at', 'refund_completed_at', 'get_display_payment_method'
    ]
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('📦 Order Information', {
            'fields': ('order_number', 'user', 'total_amount', 'status')
        }),
        ('💳 Payment Information', {
            'fields': (
                'payment_method', 'get_display_payment_method', 'is_paid', 
                'payment_status',  # ✅ ADMIN CAN CHANGE THIS DROPDOWN
                'actual_payment_method', 'payment_method_details',
                'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'
            )
        }),
        ('💰 Refund Management', {
            'fields': (
                'refund_requested_at', 
                'refund_reason',
                'refund_completed_at', 
                'refund_notes'
            ),
            'description': '''
                <strong style="color: #d97706; font-size: 14px;">HOW TO PROCESS REFUNDS:</strong><br>
                <ol style="margin-top: 10px; line-height: 1.8;">
                    <li><strong>User cancels order</strong> → Payment Status automatically becomes "REFUND_PENDING"</li>
                    <li><strong>You manually refund money</strong> to customer (via Razorpay dashboard, bank transfer, etc.)</li>
                    <li><strong>Change "Payment status" above to "REFUNDED"</strong></li>
                    <li><strong>Click Save</strong> → Refund completion timestamp will be auto-recorded</li>
                </ol>
                <p style="background: #fef3c7; padding: 10px; margin-top: 10px; border-left: 4px solid #f59e0b;">
                    ⚠️ <strong>Important:</strong> Payment Status dropdown above controls refunds. 
                    When you change it to "REFUNDED", the system will automatically record the completion time.
                </p>
            '''
        }),
        ('📍 Shipping Information', {
            'fields': (
                'shipping_name', 'shipping_email', 'shipping_phone',
                'shipping_address', 'shipping_city', 'shipping_state',
                'shipping_zip_code', 'shipping_country'
            )
        }),
        ('🕒 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def payment_status_badge(self, obj):
        """Display payment status with color coding"""
        colors = {
            'PAID': '#10b981',      # Green
            'PENDING': '#f59e0b',   # Orange
            'FAILED': '#ef4444',    # Red
            'REFUND_PENDING': '#3b82f6',  # Blue
            'REFUNDED': '#6b7280',  # Gray
        }
        color = colors.get(obj.payment_status, '#6b7280')
        
        # Add icons for better visibility
        icons = {
            'PAID': '✅',
            'PENDING': '⏳',
            'FAILED': '❌',
            'REFUND_PENDING': '⏳',
            'REFUNDED': '✓',
        }
        icon = icons.get(obj.payment_status, '')
        
        display_text = obj.payment_status.replace('_', ' ')
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 11px; display: inline-block;">{} {}</span>',
            color,
            icon,
            display_text
        )
    payment_status_badge.short_description = 'Payment Status'
    
    def get_display_payment_method(self, obj):
        """Show the display payment method"""
        return obj.get_display_payment_method()
    get_display_payment_method.short_description = 'Payment Method Used'
    
    def save_model(self, request, obj, form, change):
        """Auto-update refund timestamps when payment_status changes"""
        from django.utils import timezone
        
        if change:  # Only for existing orders
            old_obj = Order.objects.get(pk=obj.pk)
            
            # ✅ When admin changes payment_status to REFUNDED
            if (old_obj.payment_status != 'REFUNDED' and 
                obj.payment_status == 'REFUNDED'):
                
                # Set completion timestamp
                if not obj.refund_completed_at:
                    obj.refund_completed_at = timezone.now()
                
                # Add admin notes
                admin_note = f"Refund completed by {request.user.email} on {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}"
                if obj.refund_notes:
                    obj.refund_notes += f"\n{admin_note}"
                else:
                    obj.refund_notes = admin_note
            
            # ✅ When admin changes payment_status to REFUND_PENDING (manually)
            if (old_obj.payment_status != 'REFUND_PENDING' and 
                obj.payment_status == 'REFUND_PENDING'):
                
                # Set request timestamp if not set
                if not obj.refund_requested_at:
                    obj.refund_requested_at = timezone.now()
                
                # Clear completion data
                obj.refund_completed_at = None
        
        super().save_model(request, obj, form, change)
    
    # ✅ Add custom action to bulk process refunds
    actions = ['mark_as_refunded']
    
    def mark_as_refunded(self, request, queryset):
        """Bulk action: Mark selected orders as refunded"""
        from django.utils import timezone
        
        # Only update orders that are in REFUND_PENDING status
        refund_pending_orders = queryset.filter(payment_status='REFUND_PENDING')
        
        count = 0
        for order in refund_pending_orders:
            order.payment_status = 'REFUNDED'
            order.refund_completed_at = timezone.now()
            
            admin_note = f"Bulk refund completed by {request.user.email} on {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}"
            if order.refund_notes:
                order.refund_notes += f"\n{admin_note}"
            else:
                order.refund_notes = admin_note
            
            order.save()
            count += 1
        
        self.message_user(request, f'{count} order(s) marked as refunded successfully.')
    
    mark_as_refunded.short_description = "✓ Mark selected as REFUNDED (after you refund money)"


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['product__name', 'user__email', 'comment']
    readonly_fields = ['created_at', 'updated_at']