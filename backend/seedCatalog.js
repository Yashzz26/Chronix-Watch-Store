/**
 * Idempotently seed the Chronix catalog.
 *
 * Usage:
 *   node seedCatalog.js
 *
 * Requires backend/serviceAccountKey.json in local development.
 */

require('dotenv').config();
const admin = require('firebase-admin');

let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch {
  console.error('serviceAccountKey.json not found in /backend');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();
const timestamp = admin.firestore.FieldValue.serverTimestamp;

const imageUrls = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1000&q=80',
];

const catalog = [
  ['Analog', [
    ['Meridian Classic', 12999, 'A refined everyday automatic watch with a brushed steel case, sapphire-style glass, and a balanced date window.', ['automatic', 'steel', 'everyday']],
    ['Atlas Field', 8999, 'A dependable field watch with luminous hands, a sand dial, and a comfortable canvas strap for daily adventures.', ['field', 'canvas', 'luminous']],
    ['Noir Chronograph', 16999, 'A sharp black chronograph with three sub-dials, a tachymeter bezel, and a premium leather strap.', ['chronograph', 'black', 'leather']],
    ['Harbor Blue', 10999, 'A versatile blue-dial timepiece with polished indices and water resistance for workdays and weekends.', ['blue', 'dress', 'water-resistant']],
    ['Heritage Date', 7499, 'A clean heritage-inspired watch with a warm ivory dial and a slim case made for effortless layering.', ['heritage', 'slim', 'ivory']],
    ['Summit GMT', 21999, 'A travel-ready GMT watch with a dual-time bezel, high-contrast markers, and a durable steel bracelet.', ['gmt', 'travel', 'steel']],
    ['Coastal Automatic', 15499, 'A dependable automatic watch with a teal dial, luminous hands, and a tapered stainless-steel bracelet.', ['automatic', 'teal', 'steel']],
    ['Metro Skeleton', 18999, 'A modern skeleton dial reveals the mechanical movement beneath a polished case and stitched leather strap.', ['skeleton', 'automatic', 'leather']],
    ['Ranger Solar', 6999, 'A practical solar-powered field watch with bold numerals, a nylon strap, and reliable everyday durability.', ['solar', 'field', 'nylon']],
    ['Studio Minimal', 5999, 'A slim minimalist watch with a soft grey dial, slim indices, and a comfortable mesh bracelet.', ['minimal', 'mesh', 'slim']],
  ]],
  ['Smart Watch', [
    ['Pulse One', 7999, 'A bright AMOLED smartwatch with activity tracking, sleep insights, call notifications, and multi-day battery life.', ['fitness', 'amoled', 'bluetooth']],
    ['Pulse Pro', 12999, 'A premium health-focused smartwatch with GPS, heart-rate trends, workout modes, and a lightweight aluminium case.', ['gps', 'health', 'aluminium']],
    ['Orbit Active', 9999, 'A sport-first smartwatch with route tracking, water resistance, guided workouts, and a vibrant touch display.', ['sport', 'gps', 'water-resistant']],
    ['Orbit Elite', 17999, 'An elegant connected watch combining wellness tracking, responsive notifications, and a stainless-steel finish.', ['wellness', 'premium', 'steel']],
    ['Track Mini', 5999, 'A compact activity tracker with step goals, sleep monitoring, and a comfortable all-day silicone band.', ['compact', 'tracker', 'silicone']],
    ['Voyager LTE', 23999, 'A connected travel companion with GPS, LTE-ready calling, emergency features, and a long-lasting battery.', ['lte', 'travel', 'gps']],
    ['Pulse Fit 2', 6499, 'A lightweight fitness smartwatch with blood-oxygen trends, guided breathing, and week-long battery life.', ['fitness', 'health', 'battery']],
    ['Orbit Square', 8499, 'A bright square smartwatch with notifications, music controls, activity rings, and interchangeable bands.', ['square', 'fitness', 'notifications']],
    ['Aero Sport GPS', 11499, 'A running-focused GPS watch with route history, pace alerts, water resistance, and recovery insights.', ['running', 'gps', 'sport']],
    ['Halo Classic', 14999, 'A refined smartwatch with a circular AMOLED display, sleep coaching, and a stainless-steel case.', ['amoled', 'sleep', 'steel']],
  ]],
  ['Luxury', [
    ['Regent Automatic', 249999, 'A handcrafted automatic timepiece with a sunray dial, applied indices, and a hand-finished leather strap.', ['automatic', 'hand-finished', 'leather']],
    ['Monarch Diver', 189999, 'A serious diver with a ceramic bezel, screw-down crown, luminous markers, and a 300-metre rating.', ['diver', 'ceramic', 'luminous']],
    ['Eclipse Moonphase', 329999, 'A formal moonphase watch with a textured dial, polished case, and an understated alligator-style strap.', ['moonphase', 'formal', 'limited']],
    ['Sovereign Chrono', 279999, 'A confident luxury chronograph built around a sculpted case, precise sub-dials, and a deployant clasp.', ['chronograph', 'luxury', 'steel']],
    ['Imperial Rose', 359999, 'A rose-gold inspired statement piece with a champagne dial, diamond-cut hands, and a refined profile.', ['rose-gold', 'statement', 'formal']],
    ['Crown Perpetual', 499999, 'A collector-focused perpetual calendar design with a deep navy dial and exceptional finishing throughout.', ['collector', 'calendar', 'navy']],
    ['Valence Tourbillon', 749999, 'A statement tourbillon design with a hand-finished movement, sapphire-style crystal, and rose-tone case.', ['tourbillon', 'collector', 'rose-gold']],
    ['Crescent Regent', 219999, 'A polished dress watch with a silver dial, applied Roman markers, and a hand-stitched leather strap.', ['dress', 'silver', 'leather']],
    ['Bastion Diver', 159999, 'A professional-style diver with a unidirectional bezel, screw-down crown, and luminous ceramic markers.', ['diver', 'ceramic', 'luminous']],
    ['Aurelius Reserve', 429999, 'A refined precious-tone timepiece with a textured champagne dial and a carefully balanced case profile.', ['formal', 'champagne', 'collector']],
  ]],
  ['Gifts for Him', [
    ['Executive Black', 11999, 'A versatile black watch presented in a gift-ready box, designed for office wear and evening occasions.', ['gift', 'black', 'office']],
    ['Trailmaster', 9499, 'A rugged outdoor watch with a textured strap and bold numerals for someone who is always on the move.', ['gift', 'outdoor', 'rugged']],
    ['Silverline', 13999, 'A polished silver watch with a clean dial and adjustable bracelet that transitions from meetings to dinners.', ['gift', 'silver', 'dress']],
    ['Rally Racer', 15999, 'A motorsport-inspired chronograph with red accents, a perforated strap, and a bold wrist presence.', ['gift', 'racing', 'chronograph']],
    ['Classic Gentleman', 10499, 'A timeless dress watch with a cream dial and slim brown strap for understated daily elegance.', ['gift', 'classic', 'leather']],
    ['Explorer Duo', 19999, 'A practical watch-and-strap gift set with a dependable field dial and two interchangeable straps.', ['gift', 'set', 'field']],
    ['Urban Pilot', 12999, 'A pilot-inspired chronograph with a high-contrast dial, stitched calfskin strap, and gift-ready presentation.', ['gift', 'pilot', 'chronograph']],
    ['Harbor Diver Set', 17999, 'A versatile diver-style watch bundled with an extra strap for weekend trips and everyday wear.', ['gift', 'diver', 'set']],
    ['Executive Blue', 14999, 'A deep blue dress watch with a polished bracelet and a clean date display for formal occasions.', ['gift', 'blue', 'office']],
    ['Carbon Chrono', 18999, 'A bold black chronograph with carbon-texture details, luminous markers, and a comfortable silicone strap.', ['gift', 'black', 'sport']],
  ]],
  ['Gifts for Her', [
    ['Luna Pearl', 11999, 'A delicate pearl-tone dial with polished indices and a slim bracelet designed for everyday elegance.', ['gift', 'pearl', 'slim']],
    ['Aurora Rose', 14999, 'A warm rose-tone watch with a soft blush dial and a lightweight case for comfortable all-day wear.', ['gift', 'rose', 'lightweight']],
    ['Petite Muse', 8999, 'A compact minimalist watch with a fine mesh bracelet and a clean dial that complements any outfit.', ['gift', 'petite', 'minimal']],
    ['Celeste Blue', 12999, 'A luminous blue dial and graceful case profile make this a distinctive watch for special occasions.', ['gift', 'blue', 'occasion']],
    ['Velvet Hour', 10999, 'A burgundy leather strap and polished gold-tone details bring a rich, expressive finish to this dress watch.', ['gift', 'burgundy', 'dress']],
    ['Bloom Set', 17999, 'A watch and bracelet pairing in a presentation box, created for meaningful celebrations and milestones.', ['gift', 'set', 'bracelet']],
    ['Serein Silver', 9999, 'A polished silver-tone watch with a mother-of-pearl inspired dial and a slim adjustable bracelet.', ['gift', 'silver', 'pearl']],
    ['Rosewater Petite', 7999, 'A petite rose-tone watch with a soft cream dial and a lightweight case for effortless daily styling.', ['gift', 'rose', 'petite']],
    ['Neroli Mesh', 7499, 'A clean ivory dial paired with a fine mesh bracelet, designed for understated everyday elegance.', ['gift', 'mesh', 'minimal']],
    ['Solstice Gold', 15999, 'A warm gold-tone watch with a sunray dial and a refined profile for celebrations and special evenings.', ['gift', 'gold', 'occasion']],
  ]],
  ['Limited Edition', [
    ['Chronix No. 01', 39999, 'The first Chronix numbered edition, featuring a signed caseback, smoked dial, and individually tracked production.', ['limited', 'numbered', 'smoked']],
    ['Midnight Atelier', 54999, 'A dark limited-run design with a textured dial, premium strap, and an engraved atelier mark.', ['limited', 'atelier', 'black']],
    ['Founders GMT', 69999, 'A collector GMT edition with a two-tone bezel and a caseback commemorating the Chronix launch series.', ['limited', 'gmt', 'collector']],
    ['Solaris 100', 29999, 'A numbered sunburst-dial edition with a bright accent hand and only 100 pieces produced worldwide.', ['limited', 'numbered', 'sunburst']],
    ['Obsidian Reserve', 89999, 'A low-volume blacked-out timepiece with a ceramic bezel and individually serialized caseback.', ['limited', 'ceramic', 'serialized']],
    ['Anniversary Gold', 119999, 'A celebratory gold-tone edition with a champagne dial, premium clasp, and commemorative presentation box.', ['limited', 'anniversary', 'gold']],
    ['Chronix No. 02', 44999, 'A numbered second edition with a midnight dial, signed caseback, and a limited production run.', ['limited', 'numbered', 'midnight']],
    ['Atelier Verde', 64999, 'A limited green-dial edition with a brushed case, engraved caseback, and a premium bracelet.', ['limited', 'green', 'engraved']],
    ['Foundry Chrono', 79999, 'A small-batch chronograph with copper accents, a smoked dial, and individually recorded serial numbers.', ['limited', 'chronograph', 'smoked']],
    ['Lunar Archive', 99999, 'A collector edition with a moonphase display, textured navy dial, and presentation case.', ['limited', 'moonphase', 'collector']],
  ]],
];

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const retailerLinks = (name) => {
  const query = encodeURIComponent(`${name} watch`);
  return {
    amazon: `https://www.amazon.in/s?k=${query}`,
    flipkart: `https://www.flipkart.com/search?q=${query}`,
  };
};

const catalogSize = catalog.reduce((total, [, products]) => total + products.length, 0);
if (catalogSize !== 60) {
  throw new Error(`Catalog must contain exactly 60 products; found ${catalogSize}`);
}

async function seedCatalog() {
  let created = 0;
  let updated = 0;

  for (const [category, products] of catalog) {
    for (const [index, [name, price, description, tags]] of products.entries()) {
      const id = `chronix-${slugify(name)}`;
      const ref = db.collection('products').doc(id);
      const existing = await ref.get();
      const data = {
        name,
        slug: id,
        price,
        category,
        description,
        imageGallery: [imageUrls[index % imageUrls.length]],
        tags: [...tags, 'chronix'],
        retailerLinks: retailerLinks(name),
        stock: existing.exists ? (existing.data().stock ?? 25) : 25,
        isOnDeal: index === 0,
        dealPrice: index === 0 ? Math.round(price * 0.9) : null,
        dealEndsAt: null,
        updatedAt: timestamp(),
      };

      if (!existing.exists) {
        data.createdAt = timestamp();
        created += 1;
      } else {
        updated += 1;
      }

      await ref.set(data, { merge: true });
    }
  }

  console.log(`Catalog complete: ${created} created, ${updated} preserved/updated.`);
}

seedCatalog()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Catalog seeding failed:', error);
    process.exit(1);
  });
