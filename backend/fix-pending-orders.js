#!/usr/bin/env node

/**
 * Script to fix orders stuck in pending payment status
 * Run this after fixing the webhook configuration
 */

const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function fixPendingOrders() {
  try {
    console.log('🔍 Finding orders with pending payment status...');
    
    // Find orders that are confirmed but have pending payment status
    const pendingOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'pending',
        status: 'confirmed'
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    console.log(`📊 Found ${pendingOrders.length} orders with pending payment status`);

    if (pendingOrders.length === 0) {
      console.log('✅ No orders need fixing!');
      return;
    }

    // Update payment status to paid for confirmed orders
    const updateResult = await prisma.order.updateMany({
      where: {
        paymentStatus: 'pending',
        status: 'confirmed'
      },
      data: {
        paymentStatus: 'paid'
      }
    });

    console.log(`✅ Updated ${updateResult.count} orders from pending to paid payment status`);
    
    // Show details of updated orders
    console.log('\n📋 Updated Orders:');
    pendingOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order.id} - ${order.user.email} - $${order.total}`);
    });

  } catch (error) {
    console.error('❌ Error fixing pending orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixPendingOrders();
