export const products = [
  {
    id: 1,
    name: 'Classic Cotton T-Shirt',
    price: 29.99,
    category: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=500&fit=crop'
    ],
    rating: 4.8,
    reviews: 234,
    description: 'Premium quality cotton t-shirt perfect for everyday wear. Soft, breathable fabric with a comfortable fit that lasts all day long.',
    colors: ['Black', 'White', 'Navy', 'Gray'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    specifications: [
      '100% Premium Cotton',
      'Pre-shrunk fabric',
      'Tagless comfort',
      'Machine washable',
      'Reinforced stitching'
    ],
    inStock: true
  },
  {
    id: 2,
    name: 'Premium Graphic T-Shirt',
    price: 34.99,
    category: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1503341338985-b702b2a4f2a7?w=500&h=500&fit=crop'
    ],
    rating: 4.6,
    reviews: 178,
    description: 'Express yourself with our eye-catching graphic t-shirt. Features unique designs printed on high-quality fabric for lasting style.',
    colors: ['Black', 'White', 'Charcoal', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specifications: [
      '100% Combed Cotton',
      'Screen-printed graphics',
      'Crew neck design',
      'Durable print quality',
      'Breathable fabric'
    ],
    inStock: true
  },
  {
    id: 3,
    name: 'Essential Pullover Hoodie',
    price: 59.99,
    category: 'Hoodies',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=500&h=500&fit=crop'
    ],
    rating: 4.9,
    reviews: 312,
    description: 'Cozy pullover hoodie with a relaxed fit. Perfect for layering or wearing on its own. Features a spacious kangaroo pocket and adjustable drawstring hood.',
    colors: ['Black', 'Gray', 'Navy', 'Burgundy', 'Olive'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specifications: [
      '80% Cotton, 20% Polyester',
      'Fleece-lined interior',
      'Kangaroo front pocket',
      'Adjustable drawstring hood',
      'Ribbed cuffs and hem'
    ],
    inStock: true,
    materials: {
      shell: '100% Cotton',
      lining: 'Cotton blend',
      care: ['Machine wash cold', 'Do not bleach', 'Tumble dry low']
    }
  },
  {
    id: 4,
    name: 'Performance Zip-Up Hoodie',
    price: 69.99,
    category: 'Hoodies',
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1515664069236-b80e4880dc49?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?w=500&h=500&fit=crop'
    ],
    rating: 4.7,
    reviews: 267,
    description: 'Athletic zip-up hoodie designed for active lifestyles. Moisture-wicking fabric keeps you comfortable during workouts or casual wear.',
    colors: ['Black', 'Charcoal', 'Navy', 'Red'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    specifications: [
      'Moisture-wicking fabric',
      'Full-length zipper',
      'Side pockets',
      'Athletic fit',
      'Quick-dry technology'
    ],
    inStock: true
    ,
    materials: {
      shell: '100% Cotton',
      lining: 'Cotton blend',
      care: ['Machine wash cold', 'Do not bleach', 'Tumble dry low']
    }
  },
  {
    id: 5,
    name: 'Athletic Track Pants',
    price: 49.99,
    category: 'Track Pants',
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop'
    ],
    rating: 4.6,
    reviews: 198,
    description: 'Comfortable track pants with tapered fit. Perfect for training, running, or relaxing. Features elastic waistband with drawstring and zippered pockets.',
    colors: ['Black', 'Navy', 'Gray', 'Charcoal'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specifications: [
      'Polyester blend fabric',
      'Elastic waistband with drawstring',
      'Zippered side pockets',
      'Tapered leg design',
      'Moisture-wicking'
    ],
    inStock: true,
    materials: {
      shell: '100% Cotton',
      lining: 'Cotton blend',
      care: ['Machine wash cold', 'Do not bleach', 'Tumble dry low']
    }
  },
  {
    id: 6,
    name: 'Premium Jogger Track Pants',
    price: 54.99,
    category: 'Track Pants',
    image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1555217851-6141535bd771?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=500&fit=crop'
    ],
    rating: 4.8,
    reviews: 221,
    description: 'Modern jogger-style track pants with ribbed ankle cuffs. Combines athletic performance with street-style aesthetics for versatile wear.',
    colors: ['Black', 'Navy', 'Olive', 'Burgundy'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specifications: [
      'French terry fabric',
      'Elastic waist with drawcord',
      'Side pockets',
      'Ribbed ankle cuffs',
      'Slim jogger fit'
    ],
    inStock: true,
    materials: {
      shell: '100% Cotton',
      lining: 'Cotton blend',
      care: ['Machine wash cold', 'Do not bleach', 'Tumble dry low']
    }
  },
  {
    id: 7,
    name: 'Classic Polo Shirt',
    price: 44.99,
    category: 'Polo Shirts',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=500&h=500&fit=crop'
    ],
    rating: 4.7,
    reviews: 289,
    description: 'Timeless polo shirt crafted from premium pique cotton. Features a classic three-button placket and ribbed collar for a refined casual look.',
    colors: ['White', 'Black', 'Navy', 'Red', 'Green'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specifications: [
      '100% Pique Cotton',
      'Three-button placket',
      'Ribbed collar and cuffs',
      'Side vents',
      'Tailored fit'
    ],
    inStock: true,
    materials: {
      shell: '100% Cotton',
      lining: 'Cotton blend',
      care: ['Machine wash cold', 'Do not bleach', 'Tumble dry low']
    }
  },
  {
    id: 8,
    name: 'Performance Polo Shirt',
    price: 49.99,
    category: 'Polo Shirts',
    image: 'https://images.unsplash.com/photo-1618354691792-d1d42acfd860?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1618354691792-d1d42acfd860?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=500&h=500&fit=crop'
    ],
    rating: 4.8,
    reviews: 243,
    description: 'Athletic polo shirt with moisture-wicking technology. Ideal for golf, tennis, or active casual wear. Stays fresh and comfortable all day.',
    colors: ['Navy', 'White', 'Sky Blue', 'Charcoal'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specifications: [
      'Moisture-wicking polyester',
      'UV protection',
      'Anti-odor technology',
      'Four-way stretch',
      'Athletic fit'
    ],
    inStock: true,
    materials: {
      shell: '100% Cotton',
      lining: 'Cotton blend',
      care: ['Machine wash cold', 'Do not bleach', 'Tumble dry low']
    }
  },
  {
    id: 9,
    name: 'Complete Track Suit Set',
    price: 89.99,
    category: 'Track Suits',
    image: 'https://images.unsplash.com/photo-1614251055880-2c1e9b8cb797?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1614251055880-2c1e9b8cb797?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1622519407650-3df9883f76ce?w=500&h=500&fit=crop'
    ],
    rating: 4.9,
    reviews: 356,
    description: 'Coordinated track suit set including jacket and pants. Perfect for training, warm-ups, or casual athletic wear. Features matching design elements.',
    colors: ['Black', 'Navy', 'Gray', 'Royal Blue'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    specifications: [
      'Polyester tricot fabric',
      'Full-zip jacket',
      'Elastic waist pants',
      'Side stripe detail',
      'Matching set'
    ],
    inStock: true,
    materials: {
      shell: '100% Cotton',
      lining: 'Cotton blend',
      care: ['Machine wash cold', 'Do not bleach', 'Tumble dry low']
    }
  },
  {
    id: 10,
    name: 'Premium Athletic Track Suit',
    price: 109.99,
    category: 'Track Suits',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1578932750355-5eb30ece2303?w=500&h=500&fit=crop'
    ],
    rating: 4.8,
    reviews: 298,
    description: 'High-performance track suit with advanced moisture management. Designed for serious athletes who demand comfort and functionality.',
    colors: ['Black', 'Charcoal', 'Navy'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    specifications: [
      'Performance fabric blend',
      'Moisture-wicking technology',
      'Zippered pockets',
      'Reflective details',
      'Ergonomic design'
    ],
    inStock: true,
    materials: {
      shell: '100% Cotton',
      lining: 'Cotton blend',
      care: ['Machine wash cold', 'Do not bleach', 'Tumble dry low']
    }
  },
  {
    id: 11,
    name: 'Lightweight Wind Cheater Jacket',
    price: 74.99,
    category: 'Wind Cheaters',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500&h=500&fit=crop'
    ],
    rating: 4.7,
    reviews: 276,
    description: 'Windproof and water-resistant jacket perfect for outdoor activities. Packs easily into its own pocket for convenient storage.',
    colors: ['Black', 'Navy', 'Red', 'Green'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specifications: [
      'Windproof nylon shell',
      'Water-resistant coating',
      'Adjustable hood',
      'Packable design',
      'Zippered pockets'
    ],
    inStock: true,
    materials: {
      shell: '100% Cotton',
      lining: 'Cotton blend',
      care: ['Machine wash cold', 'Do not bleach', 'Tumble dry low']
    }
  },
  {
    id: 12,
    name: 'All-Weather Wind Cheater',
    price: 84.99,
    category: 'Wind Cheaters',
    image: 'https://images.unsplash.com/photo-1548126032-079b29c6a031?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1548126032-079b29c6a031?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1525450824786-227cbef70703?w=500&h=500&fit=crop'
    ],
    rating: 4.8,
    reviews: 312,
    description: 'Durable wind cheater with enhanced weather protection. Features sealed seams and breathable fabric for maximum comfort in changing conditions.',
    colors: ['Black', 'Charcoal', 'Navy', 'Olive'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    specifications: [
      'Breathable waterproof fabric',
      'Sealed seams',
      'Adjustable cuffs',
      'Ventilation panels',
      'Reflective strips'
    ],
    inStock: true,
    materials: {
      shell: '100% Cotton',
      lining: 'Cotton blend',
      care: ['Machine wash cold', 'Do not bleach', 'Tumble dry low']
    }
  },
  {
    id: 13,
    name: 'Classic Sports Jersey',
    price: 64.99,
    category: 'Jerseys',
    image: 'https://images.unsplash.com/photo-1590508140256-4b3be6d0048d?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1590508140256-4b3be6d0048d?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1614251055880-2c1e9b8cb797?w=500&h=500&fit=crop'
    ],
    rating: 4.6,
    reviews: 187,
    description: 'Breathable sports jersey designed for peak performance. Lightweight mesh fabric provides excellent ventilation during intense activity.',
    colors: ['Red', 'Blue', 'White', 'Black'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specifications: [
      'Moisture-wicking mesh',
      'Athletic cut',
      'Reinforced seams',
      'Quick-dry fabric',
      'Lightweight design'
    ],
    inStock: true,
    materials: {
      shell: '100% Cotton',
      lining: 'Cotton blend',
      care: ['Machine wash cold', 'Do not bleach', 'Tumble dry low']
    }
  },
  {
    id: 14,
    name: 'Premium Performance Jersey',
    price: 74.99,
    category: 'Jerseys',
    image: 'https://images.unsplash.com/photo-1611939611356-22e3c3b5e341?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1611939611356-22e3c3b5e341?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&h=500&fit=crop'
    ],
    rating: 4.9,
    reviews: 341,
    description: 'Professional-grade jersey with advanced cooling technology. Engineered for athletes who demand the best in performance wear.',
    colors: ['Black', 'Navy', 'Royal Blue', 'Red'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specifications: [
      'Advanced cooling fabric',
      'Compression fit',
      'Anti-chafe flatlock seams',
      'UV protection',
      'Odor-resistant treatment'
    ],
    inStock: true,
    materials: {
      shell: '100% Cotton',
      lining: 'Cotton blend',
      care: ['Machine wash cold', 'Do not bleach', 'Tumble dry low']
    }
  },
  {
    id: 15,
    name: 'V-Neck Cotton T-Shirt',
    price: 27.99,
    category: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1598032895397-b9377daeca61?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1598032895397-b9377daeca61?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=500&h=500&fit=crop'
    ],
    rating: 4.5,
    reviews: 156,
    description: 'Sleek v-neck t-shirt with a modern silhouette. Made from soft, breathable cotton for comfortable all-day wear.',
    colors: ['White', 'Black', 'Gray', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specifications: [
      '100% Ring-spun Cotton',
      'V-neck design',
      'Slim fit',
      'Double-needle stitching',
      'Pre-washed fabric'
    ],
    inStock: true,
    materials: {
      shell: '100% Cotton',
      lining: 'Cotton blend',
      care: ['Machine wash cold', 'Do not bleach', 'Tumble dry low']
    }
  }
];

export const PRODUCTS = products;
export const CATEGORIES = [
  'All',
  'T-Shirts',
  'Hoodies',
  'Track Pants',
  'Polo Shirts',
  'Track Suits',
  'Wind Cheaters',
  'Jerseys'
];