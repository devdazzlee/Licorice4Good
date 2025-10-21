// Send test email to muaz786m786@gmail.com
require('dotenv').config();

async function sendTestEmail() {
  const testEmail = 'muaz786m786@gmail.com';
  
  console.log('🧪 Sending test order confirmation email\n');
  console.log('📧 To:', testEmail);
  console.log('⏳ Please wait...\n');
  
  try {
    const { sendOrderConfirmationEmail } = require('./dist/utils/mailer');
    
    await sendOrderConfirmationEmail(testEmail, {
      orderId: 'TEST-' + Date.now(),
      customerName: 'Ahmed',
      total: 27.00,
      items: [
        {
          name: 'Custom Licorice 3-Pack',
          quantity: 1,
          price: 27.00
        }
      ],
      shippingAddress: {
        street1: '123 Main Street',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
        country: 'US'
      }
    });
    
    console.log('✅ SUCCESS! Test email sent to:', testEmail);
    console.log('\n📬 Please check:');
    console.log('  1. Inbox: muaz786m786@gmail.com');
    console.log('  2. Spam/Junk folder');
    console.log('  3. Promotions tab (if using Gmail)');
    console.log('\n💡 If you received it, the email system is working perfectly!');
    
  } catch (error) {
    console.error('\n❌ Error sending email:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

sendTestEmail();




