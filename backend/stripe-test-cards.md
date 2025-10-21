# Stripe Test Card Numbers

## ✅ VALID Test Cards (for sk_test_ keys)

### Visa
- **4242 4242 4242 4242** - Success
- **4000 0000 0000 0002** - Declined (generic decline)
- **4000 0000 0000 9995** - Declined (insufficient funds)

### Mastercard
- **5555 5555 5555 4444** - Success
- **2223 0031 2200 3222** - Success

### American Express
- **3782 822463 10005** - Success

### Discover
- **6011 1111 1111 1117** - Success

## ❌ INVALID Test Cards (will cause "live mode" error)

These cards should NOT be used with test keys:
- Any real credit card numbers
- Any cards starting with different patterns

## Test Card Details

All test cards use:
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3-4 digit number (e.g., 123)
- **ZIP**: Any valid ZIP code (e.g., 12345)

## Common Error Messages

1. **"Your request was in live mode, but used a known test card"**
   - Cause: Using test card with live Stripe key (sk_live_)
   - Solution: Use sk_test_ key or real card numbers

2. **"Your card was declined"**
   - Cause: Using declined test card (4000 0000 0000 0002)
   - Solution: Use success test card (4242 4242 4242 4242)

3. **"Your card has insufficient funds"**
   - Cause: Using insufficient funds test card (4000 0000 0000 9995)
   - Solution: Use success test card (4242 4242 4242 4242)



