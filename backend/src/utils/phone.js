/**
 * Normalizes a phone number to E.164 format (e.g., +91XXXXXXXXXX)
 * @param {string|number} phone - Raw phone number input
 * @returns {string} - Formatted phone number starting with +
 */
const normalizePhone = (phone) => {
  if (!phone) return '';
  // Remove all non-numeric characters except +
  const cleaned = phone.toString().replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+')) return cleaned;
  
  // Default to India (+91) if 10 digits and no prefix
  if (cleaned.length === 10) return `+91${cleaned}`;
  
  // If no prefix, assume + prefix
  if (!cleaned.startsWith('+') && !cleaned.startsWith('0')) return `+${cleaned}`;
  
  return cleaned;
};

/**
 * Strips the + prefix from a phone number for APIs that don't want it
 * @param {string} phone - Normalized phone number
 * @returns {string} - Phone number without +
 */
const stripPlus = (phone) => (phone || '').toString().replace(/^\+/, '');

module.exports = {
  normalizePhone,
  stripPlus
};
