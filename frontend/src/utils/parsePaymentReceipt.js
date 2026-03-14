/**
 * parsePaymentReceipt
 * -------------------
 * Parses the plain-text receipt/notification shared from Indian payment
 * apps (GPay, PhonePe, Paytm, BHIM) or bank SMS debit alerts and returns
 * a partial transaction object ready to pre-fill the form.
 *
 * Returns: { amount, merchant, description, paymentMethod }
 * Any field that cannot be parsed is returned as '' (empty string).
 */

// ── Amount extraction ──────────────────────────────────────────────────────
// Handles: ₹100, Rs.100, INR 100, Rs 1,000.50, ₹1,23,456.00
const AMOUNT_RE = /(?:₹|Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i;

function extractAmount(text) {
  const match = text.match(AMOUNT_RE);
  if (!match) return '';
  // Remove commas from Indian number format (1,23,456 → 123456)
  const raw = match[1].replace(/,/g, '');
  const num = parseFloat(raw);
  return Number.isFinite(num) && num > 0 ? String(num) : '';
}

// ── Merchant / payee extraction ────────────────────────────────────────────
// Covers the common sentence patterns from each payment app
const MERCHANT_PATTERNS = [
  // GPay: "Paid to Sharma Snacks" / "paid to shop@upi"
  /paid\s+to\s+([A-Za-z0-9 &'.@-]+?)(?:\s+(?:via|using|on|\.)|$)/i,
  // PhonePe / BHIM: "Payment to Reliance Mart"
  /payment\s+(?:of\s+[₹Rs.INR\d,. ]+\s+)?to\s+([A-Za-z0-9 &'.@-]+?)(?:\s+(?:via|using|successful|was|\.)|$)/i,
  // Paytm: "You've paid … to Merchant Name"
  /you'?ve?\s+paid\s+[₹Rs.INR\d,. ]+\s+to\s+([A-Za-z0-9 &'.@-]+?)(?:\s+(?:via|using|successful|\.)|$)/i,
  // Bank SMS: "transferred to VPA shop@paytm" / "to M/s Zomato"
  /(?:transferred|debited)\s+to\s+(?:VPA\s+|M\/s\s+)?([A-Za-z0-9 &'.@-]+?)(?:\s+(?:Ref|towards|for|via|\.)|$)/i,
  // Generic "to <Name>" fallback
  /\bto\s+([A-Z][A-Za-z0-9 &'.]{2,30}?)(?:\s+(?:via|using|for|Ref|\.)|$)/,
];

function extractMerchant(text) {
  for (const re of MERCHANT_PATTERNS) {
    const m = text.match(re);
    if (m) {
      const name = m[1].trim().replace(/\s+/g, ' ');
      // Reject if it looks like a UPI VPA (contains @)
      // Keep UPI IDs only as a last-resort description hint
      if (name.length >= 2) return name;
    }
  }
  return '';
}

// ── Category keyword guesser ───────────────────────────────────────────────
// Maps keywords in the merchant/description to common category names.
// The Transactions page will try to match these against real category names
// fetched from the API.
const CATEGORY_HINTS = [
  { keywords: ['swiggy', 'zomato', 'food', 'dining', 'restaurant', 'cafe', 'snack', 'samosa', 'dhaba', 'hotel', 'eat', 'pizza', 'burger', 'tea', 'chai'], category: 'Food & Dining' },
  { keywords: ['ola', 'uber', 'rapido', 'meru', 'metro', 'bus', 'train', 'irctc', 'railway', 'fuel', 'petrol', 'diesel', 'cab', 'auto', 'rickshaw', 'shuttle', 'flight', 'indigo', 'air india', 'spicejet'], category: 'Transportation' },
  { keywords: ['netflix', 'amazon prime', 'hotstar', 'spotify', 'jio', 'airtel', 'bsnl', 'vi ', 'vodafone', 'idea', 'electricity', 'wifi', 'broadband', 'bill', 'recharge', 'dth', 'tata sky', 'dish tv'], category: 'Bills & Utilities' },
  { keywords: ['amazon', 'flipkart', 'myntra', 'meesho', 'nykaa', 'shopping', 'mart', 'store', 'supermarket', 'reliance', 'dmart', 'big bazaar', 'grocer'], category: 'Shopping' },
  { keywords: ['apollo', 'medplus', 'pharmacy', 'chemist', 'hospital', 'clinic', 'doctor', 'medicine', 'health', 'lab', 'diagnostic'], category: 'Health & Medical' },
  { keywords: ['book', 'course', 'udemy', 'coursera', 'school', 'college', 'tuition', 'fees', 'education', 'library'], category: 'Education' },
  { keywords: ['movie', 'cinema', 'pvr', 'inox', 'bookmyshow', 'game', 'sport', 'entertainment', 'event', 'concert', 'gym', 'fitness'], category: 'Entertainment' },
  { keywords: ['salary', 'payroll', 'income', 'bonus', 'dividend', 'interest', 'credit'], category: 'Income' },
];

function guessCategoryName(merchant, descriptionText) {
  const haystack = `${merchant} ${descriptionText}`.toLowerCase();
  for (const { keywords, category } of CATEGORY_HINTS) {
    if (keywords.some(kw => haystack.includes(kw))) return category;
  }
  return '';
}

// ── Payment method detection ───────────────────────────────────────────────
function detectPaymentMethod(text) {
  const t = text.toLowerCase();
  if (/\bupi\b/.test(t)) return 'upi';
  if (/\bcard\b|\bdebit\b|\bcredit\b/.test(t)) return 'card';
  if (/\bnetbanking\b|\bneft\b|\brtgs\b|\bimps\b|\bbank transfer\b/.test(t)) return 'bank_transfer';
  if (/\bcash\b/.test(t)) return 'cash';
  // Most shared receipts are UPI
  return 'upi';
}

// ── Main export ────────────────────────────────────────────────────────────
export function parsePaymentReceipt(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { amount: '', merchant: '', description: '', paymentMethod: 'upi', categoryHint: '' };
  }

  // Normalise whitespace
  const text = rawText.replace(/\s+/g, ' ').trim();

  const amount        = extractAmount(text);
  const merchant      = extractMerchant(text);
  const paymentMethod = detectPaymentMethod(text);
  const categoryHint  = guessCategoryName(merchant, text);

  // Build a human-readable description from merchant + note if present
  const noteMatch = text.match(/(?:note|tn|remarks?)\s*[=:]\s*([^&\n]+)/i);
  const note = noteMatch ? noteMatch[1].trim() : '';
  const description = merchant || note || '';

  return { amount, merchant, description, paymentMethod, categoryHint };
}
