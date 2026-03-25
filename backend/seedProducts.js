const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const placeholderImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop';

const categoryNames = [
  'Analog', 
  'Smart Watch', 
  'Luxury', 
  'Gifts for Him', 
  'Gifts for Her', 
  'Limited Edition'
];

async function seedProducts() {
  console.log('Clearing existing products...');
  const existing = await db.collection('products').get();
  const batch = db.batch();
  existing.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  console.log('Seeding 120 products...');
  for (const cat of categoryNames) {
    for (let i = 1; i <= 20; i++) {
        const product = {
            name: `${cat} Series ${String.fromCharCode(64 + i)} ${2024 + i}`,
            price: 5000 + (Math.floor(Math.random() * 50) * 1000),
            category: cat,
            description: `An exquisite timepiece from our ${cat} collection. Crafted with precision and designed for the modern connoisseur. Features a durable build and timeless aesthetic.`,
            imageGallery: [
              placeholderImg,
              placeholderImg,
              placeholderImg,
              placeholderImg
            ],
            tags: [cat.toLowerCase().replace(' ', ''), 'timepiece', 'chronix'],
            stock: Math.floor(Math.random() * 90) + 10,
            isOnDeal: i === 1,
            dealPrice: i === 1 ? 4500 : null,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          };
          await db.collection('products').add(product);
    }
    console.log(`Seeded ${cat} category.`);
  }
  console.log('Seeding complete!');
  process.exit();
}

seedProducts().catch(console.error);
