import express from 'express';
import { 
  validateShippingAddress, 
  getShippingRatesController, 
  createShipmentController, 
  shippoWebhook,
  calculateCheckoutRates 
} from '../controller/shippoController';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// Public routes (no auth required)
router.post('/webhook', shippoWebhook);
router.post('/calculate-rates', calculateCheckoutRates); // Public for guest checkout

// Protected routes (require authentication)
router.use(protect);

// Address validation
router.post('/validate-address', validateShippingAddress);

// Get shipping rates
router.post('/rates', getShippingRatesController);

// Create shipment
router.post('/create-shipment', createShipmentController);

export default router;
