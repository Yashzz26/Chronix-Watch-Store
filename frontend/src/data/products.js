// Core Categories for the Chronix Brand
export const categoryNames = [
  'Analog', 
  'Smart Watch', 
  'Luxury', 
  'Gifts for Him', 
  'Gifts for Her', 
  'Limited Edition'
];

export const categories = ['All', ...categoryNames];

// Legacy mock data removed. All products are now managed in Firestore.
export const products = []; 

export const getDealProduct = (dbProducts) => dbProducts.find(p => p.isOnDeal) || dbProducts[0] || null;
export const getProductById = (dbProducts, id) => dbProducts.find(p => p.id === String(id)) || null;
