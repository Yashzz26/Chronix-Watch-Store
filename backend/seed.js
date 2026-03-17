require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const products = [
  {
    name: 'Galaxy Watch 6',
    price: 21999,
    category: 'Smart Watch',
    description: 'A stylish and powerful smartwatch with advanced health tracking, a larger screen, and improved performance.',
    imageGallery: [
      'https://m.media-amazon.com/images/I/61fDRIfPQEL.jpg',
      'https://m.media-amazon.com/images/I/61fDRIfPQEL.jpg',
    ],
    stock: 50,
    isOnDeal: false,
    dealPrice: null,
    dealEndsAt: null,
    tags: ['samsung', 'smartwatch', 'health'],
  },
  {
    name: 'Seiko 5 Sports',
    price: 25500,
    category: 'Analog',
    description: 'A reliable and iconic automatic watch, perfect for everyday wear and adventure.',
    imageGallery: [
      'https://m.media-amazon.com/images/I/71L5l2A4DPL._AC_UY1000_.jpg',
    ],
    stock: 30,
    isOnDeal: false,
    dealPrice: null,
    dealEndsAt: null,
    tags: ['seiko', 'automatic', 'analog'],
  },
  {
    name: 'G-Shock GA2100',
    price: 8995,
    category: 'Analog',
    description: 'Legendary toughness in a slim, modern octagonal case. Water-resistant up to 200 meters.',
    imageGallery: [
      'https://m.media-amazon.com/images/I/61-pC3-A8BL._AC_UY1000_.jpg',
    ],
    stock: 100,
    isOnDeal: true,
    dealPrice: 598,
    dealEndsAt: null,
    tags: ['casio', 'gshock', 'tough'],
  },
  {
    name: 'Tudor Black Bay',
    price: 350000,
    category: 'Luxury',
    description: 'A vintage-inspired diver watch with modern craftsmanship and a timeless design.',
    imageGallery: [
      'https://content.thewosgroup.com/productimage/17771235/17771235_1.jpg',
    ],
    stock: 5,
    isOnDeal: false,
    dealPrice: null,
    dealEndsAt: null,
    tags: ['tudor', 'luxury', 'diver'],
  },
  {
    name: 'Apple Watch Ultra',
    price: 89900,
    category: 'Smart Watch',
    description: 'The most rugged and capable Apple Watch ever. Designed for exploration and endurance.',
    imageGallery: [
      'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MQF03_VW_34FR+watch-49-titanium-ultra_VW_34FR_WF_CO+watch-face-49-alpine-ultra_VW_34FR_WF_CO_GEO_IN?wid=752&hei=720&bgc=fafafa&trim=1',
    ],
    stock: 20,
    isOnDeal: false,
    dealPrice: null,
    dealEndsAt: null,
    tags: ['apple', 'smartwatch', 'rugged'],
  },
  {
    name: 'Rolex Submariner',
    price: 1250000,
    category: 'Luxury',
    description: 'The archetype of the diver\'s watch. Unwavering reliability and timeless design.',
    imageGallery: [
      'https://content.rolex.com/v7/dam/new-watches/2023/m126610lv-0002/m126610lv-0002_portrait.jpg',
    ],
    stock: 3,
    isOnDeal: false,
    dealPrice: null,
    dealEndsAt: null,
    tags: ['rolex', 'luxury', 'diver', 'iconic'],
  },
];

const seed = async () => {
  console.log('🌱 Seeding Firestore products...');
  for (const product of products) {
    const ref = await db.collection('products').add({
      ...product,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ Seeded: ${product.name} → ${ref.id}`);
  }
  console.log('✨ Seeding complete!');
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
