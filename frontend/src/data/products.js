export const categories = ['All', 'Analog', 'Smart Watch', 'Luxury'];

export const products = [
  {
    id: 1,
    name: 'Seiko 5 Sports',
    category: 'Analog',
    price: 25500,
    description: 'A reliable and iconic automatic watch, perfect for everyday wear and adventure. Features a durable stainless steel case and Japanese automatic movement.',
    imageGallery: [
      '/assets/watch3.png',
      '/assets/watch3.png',
      '/assets/watch3.png'
    ],
    stock: 30,
    isOnDeal: false,
    dealPrice: null,
  },
  {
    id: 2,
    name: 'G-Shock GA2100',
    category: 'Analog',
    price: 9900,
    description: 'Legendary toughness in a slim, modern octagonal case. Water-resistant up to 200 meters. The carbon core guard structure provides unmatched impact resistance.',
    imageGallery: [
      '/assets/watch1.png',
      '/assets/watch1.png',
      '/assets/watch1.png'
    ],
    stock: 50,
    isOnDeal: true,
    dealPrice: 8500,
  },
  {
    id: 3,
    name: 'Apple Watch Ultra',
    category: 'Smart Watch',
    price: 82900,
    description: 'The most rugged and capable Apple Watch ever. Built for exploration, adventure, and endurance athletes who push beyond limits.',
    imageGallery: [
      '/assets/watch2.png',
      '/assets/watch2.png',
      '/assets/watch2.png'
    ],
    stock: 8,
    isOnDeal: false,
    dealPrice: null,
  },
  {
    id: 4,
    name: 'Rolex Submariner',
    category: 'Luxury',
    price: 950000,
    description: 'The archetype of the diver\'s watch, a true icon. Unwavering reliability, timeless design, and a legacy that defines what a luxury sports watch should be.',
    imageGallery: [
      '/assets/watch1.png',
      '/assets/watch2.png'
    ],
    stock: 3,
    isOnDeal: false,
    dealPrice: null,
  },
  {
    id: 5,
    name: 'Tissot PRX',
    category: 'Luxury',
    price: 65000,
    description: 'An evocative and slim design that makes it an uncompromising essential for all design enthusiasts. The PRX Powermatic 80 is a tribute to the 1978 original.',
    imageGallery: [
      '/assets/watch3.png',
      '/assets/watch1.png'
    ],
    stock: 15,
    isOnDeal: false,
    dealPrice: null,
  },
  {
    id: 6,
    name: 'Fossil Gen 6',
    category: 'Smart Watch',
    price: 24995,
    description: 'Our fastest charging smartwatch yet. The Gen 6 features the Snapdragon Wear 4100+ platform for improved performance and heart rate tracking.',
    imageGallery: [
      '/assets/watch2.png',
      '/assets/watch3.png'
    ],
    stock: 20,
    isOnDeal: true,
    dealPrice: 18995,
  }
];

export const getDealProduct = () => products.find(p => p.dealPrice) || null;
export const getProductById = (id) => products.find(p => p.id === Number(id)) || null;

export const searchProducts = (query) => {
  if (!query) return [];
  const q = query.toLowerCase();
  return products.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.category.toLowerCase().includes(q)
  );
};
