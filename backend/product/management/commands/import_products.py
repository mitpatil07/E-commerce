from django.core.management.base import BaseCommand
from product.models import (
    Category, Product, ProductImage, ProductColor, ProductSize,
    ProductSpecification, ProductMaterial
)
import random

class Command(BaseCommand):
    help = 'Import products from data file'

    def handle(self, *args, **kwargs):
        # Product data with all categories
        products_data = [
            # T-SHIRTS (5 items)
            {
                'id': 1,
                'name': 'Classic Cotton T-Shirt',
                'price': 29.99,
                'category': 'T-Shirts',
                'image': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=500&fit=crop'
                ],
                'rating': 4.8,
                'reviews': 234,
                'description': 'Premium quality cotton t-shirt perfect for everyday wear. Soft, breathable fabric with a comfortable fit that lasts all day long.',
                'colors': ['Black', 'White', 'Navy', 'Gray'],
                'sizes': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    '100% Premium Cotton',
                    'Pre-shrunk fabric',
                    'Tagless comfort',
                    'Machine washable',
                    'Reinforced stitching'
                ],
                'inStock': True
            },
            {
                'id': 2,
                'name': 'Premium Graphic T-Shirt',
                'price': 34.99,
                'category': 'T-Shirts',
                'image': 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1503341338985-b702b2a4f2a7?w=500&h=500&fit=crop'
                ],
                'rating': 4.6,
                'reviews': 178,
                'description': 'Express yourself with our eye-catching graphic t-shirt. Features unique designs printed on high-quality fabric for lasting style.',
                'colors': ['Black', 'White', 'Charcoal', 'Navy'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    '100% Combed Cotton',
                    'Screen-printed graphics',
                    'Crew neck design',
                    'Durable print quality',
                    'Breathable fabric'
                ],
                'inStock': True
            },
            {
                'id': 3,
                'name': 'V-Neck Essential Tee',
                'price': 27.99,
                'category': 'T-Shirts',
                'image': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1618354691551-44de113f0164?w=500&h=500&fit=crop'
                ],
                'rating': 4.5,
                'reviews': 156,
                'description': 'Classic v-neck t-shirt with a flattering cut. Perfect for layering or wearing alone. Made from soft, durable cotton blend.',
                'colors': ['White', 'Black', 'Gray', 'Navy', 'Burgundy'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    '95% Cotton, 5% Spandex',
                    'Stretch fabric',
                    'V-neck design',
                    'Slim fit',
                    'Tag-free label'
                ],
                'inStock': True
            },
            {
                'id': 4,
                'name': 'Striped Casual T-Shirt',
                'price': 32.99,
                'category': 'T-Shirts',
                'image': 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=500&h=500&fit=crop'
                ],
                'rating': 4.7,
                'reviews': 203,
                'description': 'Trendy striped t-shirt perfect for casual outings. Features horizontal stripes and a comfortable regular fit.',
                'colors': ['Navy/White', 'Black/Gray', 'Red/White', 'Green/White'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    '100% Cotton',
                    'Horizontal stripe pattern',
                    'Crew neck',
                    'Regular fit',
                    'Colorfast dyes'
                ],
                'inStock': True
            },
            {
                'id': 5,
                'name': 'Long Sleeve Performance Tee',
                'price': 39.99,
                'category': 'T-Shirts',
                'image': 'https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop'
                ],
                'rating': 4.8,
                'reviews': 189,
                'description': 'Technical long-sleeve t-shirt with moisture-wicking properties. Ideal for workouts or outdoor activities in cooler weather.',
                'colors': ['Black', 'Navy', 'Gray', 'Olive'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Moisture-wicking fabric',
                    'Quick-dry technology',
                    'Thumbholes at cuffs',
                    'Athletic fit',
                    'UPF 50+ sun protection'
                ],
                'inStock': True
            },

            # HOODIES (5 items)
            {
                'id': 6,
                'name': 'Essential Pullover Hoodie',
                'price': 59.99,
                'category': 'Hoodies',
                'image': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=500&h=500&fit=crop'
                ],
                'rating': 4.9,
                'reviews': 312,
                'description': 'Cozy pullover hoodie with a relaxed fit. Perfect for layering or wearing on its own. Features a spacious kangaroo pocket and adjustable drawstring hood.',
                'colors': ['Black', 'Gray', 'Navy', 'Burgundy', 'Olive'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    '80% Cotton, 20% Polyester',
                    'Fleece-lined interior',
                    'Kangaroo front pocket',
                    'Adjustable drawstring hood',
                    'Ribbed cuffs and hem'
                ],
                'inStock': True,
                'materials': {
                    'shell': '100% Cotton',
                    'lining': 'Cotton blend',
                    'care': ['Machine wash cold', 'Do not bleach', 'Tumble dry low']
                }
            },
            {
                'id': 7,
                'name': 'Performance Zip-Up Hoodie',
                'price': 69.99,
                'category': 'Hoodies',
                'image': 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1515664069236-b80e4880dc49?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?w=500&h=500&fit=crop'
                ],
                'rating': 4.7,
                'reviews': 267,
                'description': 'Athletic zip-up hoodie designed for active lifestyles. Moisture-wicking fabric keeps you comfortable during workouts or casual wear.',
                'colors': ['Black', 'Charcoal', 'Navy', 'Red'],
                'sizes': ['M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Moisture-wicking fabric',
                    'Full-length zipper',
                    'Side pockets',
                    'Athletic fit',
                    'Quick-dry technology'
                ],
                'inStock': True,
                'materials': {
                    'shell': '100% Cotton',
                    'lining': 'Cotton blend',
                    'care': ['Machine wash cold', 'Do not bleach', 'Tumble dry low']
                }
            },
            {
                'id': 8,
                'name': 'Oversized Comfort Hoodie',
                'price': 64.99,
                'category': 'Hoodies',
                'image': 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe51?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1620799139834-6b8f844fbe51?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=500&h=500&fit=crop'
                ],
                'rating': 4.8,
                'reviews': 298,
                'description': 'Ultra-soft oversized hoodie for maximum comfort. Perfect for lounging or streetwear style. Features dropped shoulders and extra room.',
                'colors': ['Beige', 'Gray', 'Black', 'Lavender', 'Sage'],
                'sizes': ['S', 'M', 'L', 'XL'],
                'specifications': [
                    '85% Cotton, 15% Polyester',
                    'Brushed fleece interior',
                    'Oversized fit',
                    'Drop shoulder design',
                    'Heavyweight fabric'
                ],
                'inStock': True,
                'materials': {
                    'shell': 'Cotton blend',
                    'lining': 'Fleece',
                    'care': ['Machine wash cold', 'Tumble dry low', 'Do not iron']
                }
            },
            {
                'id': 9,
                'name': 'Tech Fleece Hoodie',
                'price': 79.99,
                'category': 'Hoodies',
                'image': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop'
                ],
                'rating': 4.9,
                'reviews': 341,
                'description': 'Premium tech fleece hoodie with modern styling. Lightweight yet warm, featuring innovative fabric technology for optimal comfort.',
                'colors': ['Black', 'Gray', 'Navy', 'Dark Green'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Tech fleece fabric',
                    'Lightweight insulation',
                    'Ergonomic seams',
                    'Zippered pockets',
                    'Modern slim fit'
                ],
                'inStock': True,
                'materials': {
                    'shell': 'Polyester blend',
                    'lining': 'Tech fleece',
                    'care': ['Machine wash cold', 'Hang dry', 'Do not bleach']
                }
            },
            {
                'id': 10,
                'name': 'Color Block Hoodie',
                'price': 54.99,
                'category': 'Hoodies',
                'image': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=500&h=500&fit=crop'
                ],
                'rating': 4.6,
                'reviews': 224,
                'description': 'Stylish color-blocked hoodie with bold contrast panels. Makes a statement while keeping you comfortable and warm.',
                'colors': ['Black/White', 'Navy/Gray', 'Green/Black', 'Red/Black'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    '80% Cotton, 20% Polyester',
                    'Color block design',
                    'Fleece lined',
                    'Adjustable hood',
                    'Front pouch pocket'
                ],
                'inStock': True,
                'materials': {
                    'shell': 'Cotton blend',
                    'lining': 'Fleece',
                    'care': ['Machine wash cold', 'Tumble dry low']
                }
            },

            # TRACK PANTS (5 items)
            {
                'id': 11,
                'name': 'Classic Track Pants',
                'price': 44.99,
                'category': 'Track Pants',
                'image': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1598032895397-b9e6c2b0e5c9?w=500&h=500&fit=crop'
                ],
                'rating': 4.7,
                'reviews': 289,
                'description': 'Comfortable track pants with elastic waistband and side stripes. Perfect for training, running, or casual wear.',
                'colors': ['Black', 'Navy', 'Gray', 'Olive'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    '100% Polyester',
                    'Elastic waistband with drawstring',
                    'Side stripe detail',
                    'Zippered side pockets',
                    'Tapered leg'
                ],
                'inStock': True
            },
            {
                'id': 12,
                'name': 'Jogger Track Pants',
                'price': 49.99,
                'category': 'Track Pants',
                'image': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&h=500&fit=crop'
                ],
                'rating': 4.8,
                'reviews': 356,
                'description': 'Modern jogger-style track pants with tapered fit and ribbed cuffs. Combines style with athletic functionality.',
                'colors': ['Black', 'Gray', 'Navy', 'Burgundy', 'Khaki'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Cotton-poly blend',
                    'Tapered jogger fit',
                    'Ribbed ankle cuffs',
                    'Deep side pockets',
                    'Adjustable drawstring'
                ],
                'inStock': True
            },
            {
                'id': 13,
                'name': 'Performance Track Pants',
                'price': 54.99,
                'category': 'Track Pants',
                'image': 'https://images.unsplash.com/photo-1598032895397-b9e6c2b0e5c9?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1598032895397-b9e6c2b0e5c9?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&h=500&fit=crop'
                ],
                'rating': 4.9,
                'reviews': 412,
                'description': 'High-performance track pants with moisture-wicking technology. Designed for serious athletes and active individuals.',
                'colors': ['Black', 'Navy', 'Charcoal', 'Royal Blue'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Moisture-wicking fabric',
                    'Quick-dry technology',
                    'Breathable mesh panels',
                    'Zippered leg vents',
                    'Reflective details'
                ],
                'inStock': True
            },
            {
                'id': 14,
                'name': 'Slim Fit Track Pants',
                'price': 47.99,
                'category': 'Track Pants',
                'image': 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=500&fit=crop'
                ],
                'rating': 4.6,
                'reviews': 278,
                'description': 'Sleek slim-fit track pants for a modern athletic look. Features streamlined design without sacrificing comfort.',
                'colors': ['Black', 'Navy', 'Gray', 'Dark Green'],
                'sizes': ['S', 'M', 'L', 'XL'],
                'specifications': [
                    '92% Polyester, 8% Spandex',
                    'Slim athletic fit',
                    'Four-way stretch',
                    'Zippered pockets',
                    'Ankle zippers'
                ],
                'inStock': True
            },
            {
                'id': 15,
                'name': 'Cargo Track Pants',
                'price': 52.99,
                'category': 'Track Pants',
                'image': 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1598032895397-b9e6c2b0e5c9?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&h=500&fit=crop'
                ],
                'rating': 4.7,
                'reviews': 245,
                'description': 'Utility-inspired track pants with multiple cargo pockets. Combines streetwear style with athletic comfort.',
                'colors': ['Black', 'Olive', 'Khaki', 'Gray'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    '100% Nylon',
                    'Multiple cargo pockets',
                    'Adjustable ankle straps',
                    'Water-resistant fabric',
                    'Reinforced knees'
                ],
                'inStock': True
            },

            # POLO SHIRTS (4 items)
            {
                'id': 16,
                'name': 'Classic Pique Polo',
                'price': 42.99,
                'category': 'Polo Shirts',
                'image': 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1626497764746-6dc36546d98d?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=500&h=500&fit=crop'
                ],
                'rating': 4.8,
                'reviews': 367,
                'description': 'Timeless pique polo shirt with classic styling. Perfect for business casual or weekend wear. Features traditional collar and button placket.',
                'colors': ['White', 'Black', 'Navy', 'Gray', 'Red', 'Green'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    '100% Cotton pique',
                    'Three-button placket',
                    'Ribbed collar and cuffs',
                    'Side vents',
                    'Pre-shrunk fabric'
                ],
                'inStock': True
            },
            {
                'id': 17,
                'name': 'Performance Golf Polo',
                'price': 49.99,
                'category': 'Polo Shirts',
                'image': 'https://images.unsplash.com/photo-1626497764746-6dc36546d98d?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1626497764746-6dc36546d98d?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=500&h=500&fit=crop'
                ],
                'rating': 4.9,
                'reviews': 423,
                'description': 'Technical polo designed for golf and active wear. Moisture-wicking fabric keeps you cool and dry on the course or at the gym.',
                'colors': ['White', 'Navy', 'Sky Blue', 'Coral', 'Lime'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Moisture-wicking polyester',
                    'UPF 50+ protection',
                    'Four-way stretch',
                    'Anti-odor technology',
                    'Athletic fit'
                ],
                'inStock': True
            },
            {
                'id': 18,
                'name': 'Striped Polo Shirt',
                'price': 44.99,
                'category': 'Polo Shirts',
                'image': 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1626497764746-6dc36546d98d?w=500&h=500&fit=crop'
                ],
                'rating': 4.7,
                'reviews': 312,
                'description': 'Stylish striped polo shirt that adds visual interest to your wardrobe. Features classic horizontal stripes and comfortable fit.',
                'colors': ['Navy/White', 'Gray/Black', 'Red/White', 'Green/Navy'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Cotton-poly blend',
                    'Yarn-dyed stripes',
                    'Ribbed collar',
                    'Two-button placket',
                    'Regular fit'
                ],
                'inStock': True
            },
            {
                'id': 19,
                'name': 'Premium Long Sleeve Polo',
                'price': 54.99,
                'category': 'Polo Shirts',
                'image': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1626497764746-6dc36546d98d?w=500&h=500&fit=crop'
                ],
                'rating': 4.8,
                'reviews': 267,
                'description': 'Elegant long-sleeve polo for cooler weather or professional settings. Refined styling with premium fabric quality.',
                'colors': ['Black', 'Navy', 'Charcoal', 'Burgundy'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    '100% Pima Cotton',
                    'Long sleeves',
                    'Mother-of-pearl buttons',
                    'Ribbed collar and cuffs',
                    'Slim fit'
                ],
                'inStock': True
            },

            # TRACK SUITS (4 items)
            {
                'id': 20,
                'name': 'Classic Athletic Tracksuit',
                'price': 89.99,
                'category': 'Track Suits',
                'image': 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop'
                ],
                'rating': 4.8,
                'reviews': 445,
                'description': 'Complete tracksuit set with matching jacket and pants. Features classic athletic styling with side stripes and comfortable fit.',
                'colors': ['Black', 'Navy', 'Gray', 'Royal Blue'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    '100% Polyester',
                    'Full zip jacket',
                    'Side stripe detail',
                    'Elastic waistband pants',
                    'Complete set'
                ],
                'inStock': True,
                'materials': {
                    'shell': 'Polyester',
                    'lining': 'Mesh lining',
                    'care': ['Machine wash cold', 'Tumble dry low', 'Do not bleach']
                }
            },
            {
                'id': 21,
                'name': 'Tech Fleece Tracksuit',
                'price': 119.99,
                'category': 'Track Suits',
                'image': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&h=500&fit=crop'
                ],
                'rating': 4.9,
                'reviews': 523,
                'description': 'Premium tech fleece tracksuit with modern design. Lightweight yet warm, perfect for training or casual wear.',
                'colors': ['Black', 'Charcoal', 'Navy', 'Olive'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Tech fleece fabric',
                    'Ergonomic seams',
                    'Zippered pockets',
                    'Tapered jogger pants',
                    'Premium construction'
                ],
                'inStock': True,
                'materials': {
                    'shell': 'Polyester tech fleece',
                    'lining': 'Soft fleece',
                    'care': ['Machine wash cold', 'Hang dry', 'Do not iron']
                }
            },
            {
                'id': 22,
                'name': 'Retro Style Tracksuit',
                'price': 94.99,
                'category': 'Track Suits',
                'image': 'https://images.unsplash.com/photo-1598032895397-b9e6c2b0e5c9?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1598032895397-b9e6c2b0e5c9?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop'
                ],
                'rating': 4.7,
                'reviews': 389,
                'description': 'Vintage-inspired tracksuit with bold color blocking. Brings back classic 90s athletic style with modern comfort.',
                'colors': ['Black/White', 'Navy/Red', 'Green/Black', 'Purple/White'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Cotton-poly blend',
                    'Color block design',
                    'Snap button jacket',
                    'Elastic cuff pants',
                    'Retro styling'
                ],
                'inStock': True,
                'materials': {
                    'shell': 'Cotton blend',
                    'lining': 'Mesh',
                    'care': ['Machine wash cold', 'Tumble dry low']
                }
            },
            {
                'id': 23,
                'name': 'Performance Training Tracksuit',
                'price': 109.99,
                'category': 'Track Suits',
                'image': 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop'
                ],
                'rating': 4.9,
                'reviews': 498,
                'description': 'High-performance tracksuit designed for serious athletes. Features moisture-wicking technology and breathable panels.',
                'colors': ['Black', 'Navy', 'Charcoal', 'Red'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Moisture-wicking fabric',
                    'Breathable mesh panels',
                    'Zippered ventilation',
                    'Reflective details',
                    'Athletic fit'
                ],
                'inStock': True,
                'materials': {
                    'shell': 'Performance polyester',
                    'lining': 'Mesh',
                    'care': ['Machine wash cold', 'Hang dry', 'Do not bleach']
                }
            },

            # WIND CHEATERS (5 items)
            {
                'id': 24,
                'name': 'Classic Windbreaker Jacket',
                'price': 64.99,
                'category': 'Wind Cheaters',
                'image': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=500&h=500&fit=crop'
                ],
                'rating': 4.7,
                'reviews': 356,
                'description': 'Lightweight windbreaker perfect for unpredictable weather. Water-resistant fabric keeps you dry in light rain.',
                'colors': ['Black', 'Navy', 'Red', 'Yellow', 'Gray'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    '100% Nylon',
                    'Water-resistant coating',
                    'Full-zip front',
                    'Adjustable hood',
                    'Packable design'
                ],
                'inStock': True
            },
            {
                'id': 25,
                'name': 'Hooded Windcheater',
                'price': 69.99,
                'category': 'Wind Cheaters',
                'image': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=500&h=500&fit=crop'
                ],
                'rating': 4.8,
                'reviews': 412,
                'description': 'Versatile hooded windcheater with adjustable features. Ideal for outdoor activities and everyday wear.',
                'colors': ['Black', 'Navy', 'Olive', 'Burgundy'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Windproof fabric',
                    'Adjustable hood',
                    'Elastic cuffs',
                    'Side zip pockets',
                    'Drawstring hem'
                ],
                'inStock': True
            },
            {
                'id': 26,
                'name': 'Color Block Windbreaker',
                'price': 72.99,
                'category': 'Wind Cheaters',
                'image': 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop'
                ],
                'rating': 4.6,
                'reviews': 298,
                'description': 'Bold color-blocked windbreaker that makes a statement. Combines style with weather protection.',
                'colors': ['Black/White/Red', 'Navy/Yellow/White', 'Green/Black/Gray'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Nylon taffeta',
                    'Color block panels',
                    'Water-repellent',
                    'Front zip pockets',
                    'Elastic waistband'
                ],
                'inStock': True
            },
            {
                'id': 27,
                'name': 'Performance Rain Jacket',
                'price': 79.99,
                'category': 'Wind Cheaters',
                'image': 'https://images.unsplash.com/photo-1544923408-75c5cef46f14?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1544923408-75c5cef46f14?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop'
                ],
                'rating': 4.9,
                'reviews': 487,
                'description': 'Advanced rain jacket with sealed seams and breathable fabric. Maximum protection from the elements without overheating.',
                'colors': ['Black', 'Navy', 'Charcoal', 'Forest Green'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Waterproof fabric',
                    'Sealed seams',
                    'Breathable membrane',
                    'Adjustable cuffs',
                    'Reflective accents'
                ],
                'inStock': True
            },
            {
                'id': 28,
                'name': 'Lightweight Packable Windbreaker',
                'price': 59.99,
                'category': 'Wind Cheaters',
                'image': 'https://images.unsplash.com/photo-1507034589631-9433cc6bc453?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1507034589631-9433cc6bc453?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop'
                ],
                'rating': 4.7,
                'reviews': 334,
                'description': 'Ultra-lightweight windbreaker that packs into its own pocket. Perfect for travel and unpredictable weather.',
                'colors': ['Black', 'Navy', 'Gray', 'Lime', 'Orange'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Ultra-light nylon',
                    'Packs into pocket',
                    'Water-resistant',
                    'Elastic hem and cuffs',
                    'Minimalist design'
                ],
                'inStock': True
            },

            # JERSEYS (5 items)
            {
                'id': 29,
                'name': 'Classic Sports Jersey',
                'price': 54.99,
                'category': 'Jerseys',
                'image': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1508792665056-445c4e26d1c8?w=500&h=500&fit=crop'
                ],
                'rating': 4.8,
                'reviews': 423,
                'description': 'Authentic-style sports jersey with breathable mesh fabric. Perfect for team sports or casual athletic wear.',
                'colors': ['Red', 'Blue', 'Green', 'Yellow', 'Black'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    '100% Polyester mesh',
                    'Breathable fabric',
                    'Athletic cut',
                    'Reinforced stitching',
                    'Moisture-wicking'
                ],
                'inStock': True
            },
            {
                'id': 30,
                'name': 'Performance Basketball Jersey',
                'price': 59.99,
                'category': 'Jerseys',
                'image': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1508792665056-445c4e26d1c8?w=500&h=500&fit=crop'
                ],
                'rating': 4.9,
                'reviews': 512,
                'description': 'Premium basketball jersey with superior ventilation. Designed for maximum performance on the court.',
                'colors': ['Black', 'White', 'Red', 'Blue', 'Purple'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Breathable mesh',
                    'Sleeveless design',
                    'Quick-dry fabric',
                    'Anti-microbial treatment',
                    'Professional fit'
                ],
                'inStock': True
            },
            {
                'id': 31,
                'name': 'Soccer Training Jersey',
                'price': 49.99,
                'category': 'Jerseys',
                'image': 'https://images.unsplash.com/photo-1508792665056-445c4e26d1c8?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1508792665056-445c4e26d1c8?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&h=500&fit=crop'
                ],
                'rating': 4.7,
                'reviews': 389,
                'description': 'Technical soccer jersey built for training and matches. Features ventilated zones and ergonomic fit.',
                'colors': ['Red', 'Blue', 'Green', 'Black', 'White'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Moisture-wicking polyester',
                    'Ventilated side panels',
                    'Crew neck design',
                    'Ergonomic fit',
                    'Lightweight construction'
                ],
                'inStock': True
            },
            {
                'id': 32,
                'name': 'Cycling Jersey',
                'price': 64.99,
                'category': 'Jerseys',
                'image': 'https://images.unsplash.com/photo-1530896432985-80a4a2c0e85d?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1530896432985-80a4a2c0e85d?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&h=500&fit=crop'
                ],
                'rating': 4.8,
                'reviews': 445,
                'description': 'Specialized cycling jersey with rear pockets and extended back. Aerodynamic design for serious cyclists.',
                'colors': ['Black', 'Red', 'Blue', 'Yellow', 'Green'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Technical cycling fabric',
                    'Three rear pockets',
                    'Full-length zipper',
                    'Silicone gripper hem',
                    'Reflective elements'
                ],
                'inStock': True
            },
            {
                'id': 33,
                'name': 'Running Performance Jersey',
                'price': 52.99,
                'category': 'Jerseys',
                'image': 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&h=500&fit=crop',
                'images': [
                    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&h=500&fit=crop'
                ],
                'rating': 4.9,
                'reviews': 478,
                'description': 'Lightweight running jersey with strategic ventilation. Designed to keep you cool during intense workouts.',
                'colors': ['Black', 'Navy', 'Neon Yellow', 'Orange', 'Gray'],
                'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
                'specifications': [
                    'Ultra-light fabric',
                    'Laser-cut ventilation',
                    'Seamless construction',
                    'Anti-chafe design',
                    'UPF 30 protection'
                ],
                'inStock': True
            },
        ]

        # Clear existing data (optional)
        self.stdout.write('Clearing existing data...')
        Product.objects.all().delete()
        Category.objects.all().delete()

        # Import categories
        categories = set(p['category'] for p in products_data)
        for cat_name in categories:
            Category.objects.get_or_create(name=cat_name)
            self.stdout.write(f'Created category: {cat_name}')

        # Import products
        for product_data in products_data:
            category = Category.objects.get(name=product_data['category'])
            
            # Generate random stock quantity between 50 and 200
            stock_quantity = random.randint(50, 200)
            
            # Create product with stock quantity
            product = Product.objects.create(
                name=product_data['name'],
                price=product_data['price'],
                category=category,
                description=product_data['description'],
                rating=product_data['rating'],
                reviews_count=product_data['reviews'],
                stock=stock_quantity,  # THIS IS THE CRITICAL FIX
                in_stock=product_data['inStock']
            )

            # Add images
            for idx, img_url in enumerate(product_data['images']):
                ProductImage.objects.create(
                    product=product,
                    image_url=img_url,
                    is_primary=(idx == 0),
                    order=idx
                )

            # Add colors
            for color in product_data['colors']:
                ProductColor.objects.create(
                    product=product,
                    color_name=color
                )

            # Add sizes
            for size in product_data['sizes']:
                ProductSize.objects.create(
                    product=product,
                    size_name=size
                )

            # Add specifications
            for idx, spec in enumerate(product_data['specifications']):
                ProductSpecification.objects.create(
                    product=product,
                    specification=spec,
                    order=idx
                )

            # Add materials if present
            if 'materials' in product_data:
                materials = product_data['materials']
                ProductMaterial.objects.create(
                    product=product,
                    shell=materials.get('shell'),
                    lining=materials.get('lining'),
                    care_instructions=materials.get('care', [])
                )

            self.stdout.write(self.style.SUCCESS(
                f'Created product: {product.name} (Stock: {stock_quantity})'
            ))

        self.stdout.write(self.style.SUCCESS('Successfully imported all products!'))