/**
 * Bulk Payment Status Fix Script
 * 
 * This script fixes orders that are stuck in "pending" payment status
 * by checking with Stripe and updating their status accordingly.
 * 
 * Run with: node src/scripts/fix-payment-status.js
 */

const { PrismaClient } = require('../generated/prisma');
const Stripe = require('stripe');

const prisma = new PrismaClient();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20'
});

async function fixPaymentStatus() {
  console.log('🔧 Starting payment status fix...');
  
  try {
    // Get all orders with pending payment status
    const pendingOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'pending'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${pendingOrders.length} orders with pending payment status`);

    if (pendingOrders.length === 0) {
      console.log('✅ No pending orders found. All good!');
      return;
    }

    let fixedCount = 0;
    let failedCount = 0;
    let noSessionCount = 0;

    // Process each pending order
    for (const order of pendingOrders) {
      console.log(`\n🔍 Checking order ${order.id}...`);
      
      try {
        // Search for checkout sessions with this order ID
        const sessions = await stripe.checkout.sessions.list({
          limit: 50, // Get more sessions to find older ones
        });

        const orderSession = sessions.data.find(
          (session) => session.metadata?.orderId === order.id
        );

        if (!orderSession) {
          console.log(`❌ No Stripe session found for order ${order.id}`);
          
          // If order is older than 24 hours and no session found, mark as failed
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          if (order.createdAt < oneDayAgo) {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: 'failed',
                updatedAt: new Date(),
              },
            });
            console.log(`🔄 Marked order ${order.id} as failed (no session found, older than 24h)`);
            failedCount++;
          } else {
            console.log(`⏳ Order ${order.id} is recent, keeping as pending`);
            noSessionCount++;
          }
          continue;
        }

        console.log(`📋 Found session ${orderSession.id} for order ${order.id}`);
        console.log(`   Payment status: ${orderSession.payment_status}`);
        console.log(`   Session created: ${new Date(orderSession.created * 1000).toISOString()}`);

        // Update order based on session payment status
        if (orderSession.payment_status === 'paid') {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'paid',
              status: 'confirmed',
              updatedAt: new Date(),
            },
          });
          console.log(`✅ Updated order ${order.id} to paid`);
          fixedCount++;
        } else if (orderSession.payment_status === 'unpaid') {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'failed',
              updatedAt: new Date(),
            },
          });
          console.log(`❌ Updated order ${order.id} to failed`);
          failedCount++;
        } else {
          console.log(`⏳ Order ${order.id} session status: ${orderSession.payment_status} - keeping pending`);
        }

      } catch (error) {
        console.error(`❌ Error processing order ${order.id}:`, error.message);
        noSessionCount++;
      }
    }

    console.log('\n📈 Summary:');
    console.log(`✅ Fixed orders: ${fixedCount}`);
    console.log(`❌ Failed orders: ${failedCount}`);
    console.log(`⏳ Still pending: ${noSessionCount}`);
    console.log(`📊 Total processed: ${pendingOrders.length}`);

    // Get updated counts
    const updatedPendingCount = await prisma.order.count({
      where: { paymentStatus: 'pending' }
    });
    
    const paidCount = await prisma.order.count({
      where: { paymentStatus: 'paid' }
    });
    
    const totalFailedCount = await prisma.order.count({
      where: { paymentStatus: 'failed' }
    });

    console.log('\n📊 Current order status counts:');
    console.log(`💰 Paid: ${paidCount}`);
    console.log(`❌ Failed: ${totalFailedCount}`);
    console.log(`⏳ Pending: ${updatedPendingCount}`);

  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixPaymentStatus()
  .then(() => {
    console.log('\n🎉 Payment status fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
