import { Request, Response } from 'express';
import { validateAddress, getShippingRates, createShipment, handleWebhookEvent } from '../services/shippoService';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// Validate shipping address
export const validateShippingAddress = async (req: Request, res: Response) => {
  try {
    const address = req.body;
    
    if (!address.name || !address.street1 || !address.city || !address.state || !address.zip || !address.country) {
      return res.status(400).json({ 
        error: 'Missing required address fields',
        required: ['name', 'street1', 'city', 'state', 'zip', 'country']
      });
    }

    const result = await validateAddress(address);
    
    res.json({
      isValid: result.isValid,
      validatedAddress: result.validatedAddress,
      suggestions: result.suggestions,
      message: result.isValid ? 'Address validated successfully' : 'Address validation completed with suggestions'
    });
  } catch (error) {
    console.error('Address validation error:', error);
    res.status(500).json({ error: 'Failed to validate address' });
  }
};

// Get shipping rates
export const getShippingRatesController = async (req: Request, res: Response) => {
  try {
    const { address, parcels } = req.body;
    
    if (!address || !parcels || !Array.isArray(parcels)) {
      return res.status(400).json({ 
        error: 'Address and parcels are required',
        required: ['address', 'parcels']
      });
    }

    const rates = await getShippingRates(address, parcels);
    
    res.json({ rates });
  } catch (error) {
    console.error('Shipping rates error:', error);
    res.status(500).json({ error: 'Failed to get shipping rates' });
  }
};

// Calculate shipping rates for checkout (before payment)
export const calculateCheckoutRates = async (req: Request, res: Response) => {
  try {
    const { shippingAddress, orderItems } = req.body;
    
    if (!shippingAddress || !orderItems || !Array.isArray(orderItems)) {
      return res.status(400).json({ 
        error: 'Shipping address and order items are required',
        required: ['shippingAddress', 'orderItems']
      });
    }

    console.log('📦 Calculating checkout shipping rates for:', {
      address: shippingAddress,
      itemsCount: orderItems.length,
    });

    // Calculate total weight and dimensions based on items
    let totalWeight = 0;
    let totalItems = 0;
    
    for (const item of orderItems) {
      if (!item.productId && item.flavorIds && item.flavorIds.length > 0) {
        // Custom pack - count flavors
        totalItems += item.quantity * item.flavorIds.length;
        totalWeight += item.quantity * item.flavorIds.length * 0.25; // 0.25 lbs per flavor
      } else if (item.productId) {
        // Regular product - fetch from database
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });
        totalItems += item.quantity;
        totalWeight += item.quantity * 0.5; // Estimate 0.5 lbs per regular product
      }
    }

    // Create parcel based on total items (simplified)
    const parcels = [{
      length: String(Math.ceil(totalItems / 3) * 4 + 2), // Estimate length
      width: "8",
      height: "6",
      distanceUnit: "in" as "in",
      weight: String(totalWeight || 1), // Minimum 1 lb
      massUnit: "lb" as "lb"
    }];

    console.log('📦 Calculated parcels:', parcels);

    // Get shipping rates from Shippo
    const rates = await getShippingRates(shippingAddress, parcels);
    
    // Format rates for frontend
    const formattedRates = rates.map((rate: any) => ({
      objectId: rate.objectId,
      carrier: rate.carrier,
      serviceName: rate.serviceName,
      amount: rate.amount,
      estimatedDays: rate.estimatedDays,
      currency: rate.currency,
    }));

    console.log('✅ Shipping rates calculated:', formattedRates);

    res.json({ 
      rates: formattedRates,
      parcels 
    });
  } catch (error) {
    console.error('Checkout rates calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate shipping rates' });
  }
};

// Create shipment
export const createShipmentController = async (req: Request, res: Response) => {
  try {
    const { orderId, address, parcels, selectedRateId, rateData } = req.body;
    
    if (!orderId || !address || !parcels || !selectedRateId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['orderId', 'address', 'parcels', 'selectedRateId']
      });
    }

    const shipment = await createShipment(
      { orderId, toAddress: address, parcels }, 
      selectedRateId,
      rateData // Optional: { carrier, amount, serviceName }
    );
    
    res.json(shipment);
  } catch (error) {
    console.error('Shipment creation error:', error);
    res.status(500).json({ error: 'Failed to create shipment' });
  }
};

// Shippo webhook handler
export const shippoWebhook = async (req: Request, res: Response) => {
  try {
    console.log('📦 Shippo webhook received:', {
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString(),
    });

    const { event, data } = req.body;
    
    if (!event || !data) {
      return res.status(400).json({ error: 'Missing event or data' });
    }

    await handleWebhookEvent(event, data);
    
    res.json({ received: true });
  } catch (error) {
    console.error('Shippo webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
