/**
 * Strip all HTML tags and trim whitespace from user input.
 * Prevents stored XSS in case rendering logic changes later.
 */
export const sanitizeText = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')   // strip HTML tags
    .replace(/[<>]/g, '')       // strip any remaining angle brackets
    .trim()
    .slice(0, 1000);            // hard cap at 1000 chars
};

export const sanitizeName = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/[<>&"']/g, '')
    .trim()
    .slice(0, 100);
};
