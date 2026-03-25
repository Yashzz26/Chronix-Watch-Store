// Placeholder image for all expanded products
const placeholderImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop';

const categoryNames = [
  'Analog', 
  'Smart Watch', 
  'Luxury', 
  'Gifts for Him', 
  'Gifts for Her', 
  'Limited Edition'
];

export const products = [];

// Seed logic to match the request of 20 products per category
categoryNames.forEach((cat, catIdx) => {
  for (let i = 1; i <= 20; i++) {
    const id = catIdx * 20 + i;
    products.push({
      id,
      name: `${cat} Series ${String.fromCharCode(64 + i)} ${2024 + i}`,
      price: 5000 + (id * 1000) % 50000,
      category: cat,
      description: `An exquisite timepiece from our ${cat} collection. Crafted with precision and designed for the modern connoisseur. Features a durable build and timeless aesthetic.`,
      imageGallery: [
        placeholderImg,
        placeholderImg,
        placeholderImg,
        placeholderImg
      ],
      tags: [cat.toLowerCase().replace(' ', ''), 'timepiece', 'chronix'],
      stock: 10 + (id % 40),
      isOnDeal: i === 1, // Make first of each category a deal
      dealPrice: i === 1 ? (4000 + (id * 1000) % 50000) : null
    });
  }
});

export const getDealProduct = () => products.find(p => p.isOnDeal) || products[0] || null;
export const getProductById = (id) => products.find(p => p.id === Number(id)) || null;
export const categories = ['All', ...categoryNames];

