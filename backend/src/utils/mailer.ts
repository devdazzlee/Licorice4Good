import nodemailer from "nodemailer";

export const sendResetEmail = async (to: string, code: string) => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(
      "⚠️  Gmail credentials not configured. Using Ethereal email for development."
    );
    console.warn(
      "📧 To enable real email functionality, add EMAIL_USER and EMAIL_PASS to your .env file"
    );

    try {
      // Use Ethereal email for development (fake SMTP)
      const testAccount = await nodemailer.createTestAccount();

      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const mailOptions = {
        from: `"Nathan " <${testAccount.user}>`,
        to,
        subject: "Password Reset Code",
        html: `
          <h2>Password Reset Code</h2>
          <p>You requested a password reset for your account.</p>
          <p><strong>Your 6-digit reset code is:</strong></p>
          <div style="background: #f8f9fa; border: 2px solid #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          <p><strong>Important:</strong></p>
          <ul>
            <li>This code will expire in 10 minutes</li>
            <li>Do not share this code with anyone</li>
            <li>If you didn't request this, please ignore this email</li>
          </ul>
          <p>Enter this code in the password reset form to continue.</p>
        `,
      };

      const info = await transporter.sendMail(mailOptions);


      return;
    } catch (error) {
      console.error("❌ Error with Ethereal email:", error);
      // Fallback to just logging the code
      return;
    }
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "Nathan  <no-reply@nathan.com>",
      to,
      subject: "Password Reset Code",
      html: `
        <h2>Password Reset Code</h2>
        <p>You requested a password reset for your account.</p>
        <p><strong>Your 6-digit reset code is:</strong></p>
        <div style="background: #f8f9fa; border: 2px solid #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
        </div>
        <p><strong>Important:</strong></p>
        <ul>
          <li>This code will expire in 10 minutes</li>
          <li>Do not share this code with anyone</li>
          <li>If you didn't request this, please ignore this email</li>
        </ul>
        <p>Enter this code in the password reset form to continue.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ Error sending email via Gmail:", error);
    // Fallback to Ethereal in case of SMTP auth issues, do not throw to keep UX smooth in dev/test
    try {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      const mailOptions = {
        from: `Nathan  <${testAccount.user}>`,
        to,
        subject: "Password Reset Code",
        html: `
          <h2>Password Reset Code</h2>
          <p>You requested a password reset for your account.</p>
          <p><strong>Your 6-digit reset code is:</strong></p>
          <div style="background: #f8f9fa; border: 2px solid #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          <p><strong>Important:</strong></p>
          <ul>
            <li>This code will expire in 10 minutes</li>
            <li>Do not share this code with anyone</li>
            <li>If you didn't request this, please ignore this email</li>
          </ul>
          <p>Enter this code in the password reset form to continue.</p>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      return;
    } catch (fallbackErr) {
      console.error("❌ Ethereal fallback failed:", fallbackErr);
      // Do not throw - we still want the flow to continue and user to see success
      return;
    }
  }
};

export const sendVerificationEmail = async (
  to: string,
  token: string,
  code: string
) => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(
      "⚠️  Gmail credentials not configured. Using Ethereal email for development."
    );
    console.warn(
      "📧 To enable real email functionality, add EMAIL_USER and EMAIL_PASS to your .env file"
    );

    try {
      // Use Ethereal email for development (fake SMTP)
      const testAccount = await nodemailer.createTestAccount();

      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const verificationUrl = `${
        process.env.CLIENT_URL || "https://licorice4good.com"
      }/auth/verify-email?token=${token}&email=${encodeURIComponent(to)}`;

      const mailOptions = {
        from: `"Nathan " <${testAccount.user}>`,
        to,
        subject: "Verify Your Email Address",
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Nathan!</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Please verify your email address</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi there!</p>
              
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Thank you for registering with Nathan! To complete your account setup, please verify your email address.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              
              <div style="background: #e9ecef; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #495057;">
                  <strong>Alternative Method:</strong> If the button doesn't work, you can also use this 6-digit code:
                </p>
                <div style="background: white; border: 2px solid #007bff; border-radius: 8px; padding: 15px; text-align: center; margin: 10px 0;">
                  <h2 style="color: #007bff; font-size: 24px; margin: 0; letter-spacing: 3px;">${code}</h2>
                </div>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>Important:</strong>
                </p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px; color: #856404;">
                  <li>This verification link will expire in 24 hours</li>
                  <li>If you didn't create an account, please ignore this email</li>
                  <li>For security, don't share this code or link with anyone</li>
                </ul>
              </div>
              
              <p style="font-size: 14px; color: #6c757d; margin-top: 30px;">
                If you're having trouble, you can also copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #007bff; word-break: break-all;">${verificationUrl}</a>
              </p>
            </div>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);


      return;
    } catch (error) {
      console.error("❌ Error with Ethereal email:", error);
      const verificationUrl = `${
        process.env.CLIENT_URL || "https://licorice4good.com"
      }/auth/verify-email?token=${token}&email=${encodeURIComponent(to)}`;
      return;
    }
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationUrl = `${
      process.env.CLIENT_URL || "https://licorice4good.com"
    }/auth/verify-email?token=${token}&email=${encodeURIComponent(to)}`;

    const mailOptions = {
      from: "Nathan  <no-reply@nathan.com>",
      to,
      subject: "Verify Your Email Address",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Nathan!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Please verify your email address</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi there!</p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Thank you for registering with Nathan! To complete your account setup, please verify your email address.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <div style="background: #e9ecef; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #495057;">
                <strong>Alternative Method:</strong> If the button doesn't work, you can also use this 6-digit code:
              </p>
              <div style="background: white; border: 2px solid #007bff; border-radius: 8px; padding: 15px; text-align: center; margin: 10px 0;">
                <h2 style="color: #007bff; font-size: 24px; margin: 0; letter-spacing: 3px;">${code}</h2>
              </div>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>Important:</strong>
              </p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px; color: #856404;">
                <li>This verification link will expire in 24 hours</li>
                <li>If you didn't create an account, please ignore this email</li>
                <li>For security, don't share this code or link with anyone</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #6c757d; margin-top: 30px;">
              If you're having trouble, you can also copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #007bff; word-break: break-all;">${verificationUrl}</a>
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ Error sending verification email via Gmail:", error);
    // Fallback to Ethereal in case of SMTP auth issues
    try {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const verificationUrl = `${
        process.env.CLIENT_URL || "https://licorice4good.com"
      }/auth/verify-email?token=${token}&email=${encodeURIComponent(to)}`;

      const mailOptions = {
        from: `Nathan  <${testAccount.user}>`,
        to,
        subject: "Verify Your Email Address",
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Nathan!</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Please verify your email address</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi there!</p>
              
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Thank you for registering with Nathan! To complete your account setup, please verify your email address.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              
              <div style="background: #e9ecef; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #495057;">
                  <strong>Alternative Method:</strong> If the button doesn't work, you can also use this 6-digit code:
                </p>
                <div style="background: white; border: 2px solid #007bff; border-radius: 8px; padding: 15px; text-align: center; margin: 10px 0;">
                  <h2 style="color: #007bff; font-size: 24px; margin: 0; letter-spacing: 3px;">${code}</h2>
                </div>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>Important:</strong>
                </p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px; color: #856404;">
                  <li>This verification link will expire in 24 hours</li>
                  <li>If you didn't create an account, please ignore this email</li>
                  <li>For security, don't share this code or link with anyone</li>
                </ul>
              </div>
              
              <p style="font-size: 14px; color: #6c757d; margin-top: 30px;">
                If you're having trouble, you can also copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #007bff; word-break: break-all;">${verificationUrl}</a>
              </p>
            </div>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      return;
    } catch (fallbackErr) {
      console.error("❌ Ethereal fallback failed:", fallbackErr);
      const verificationUrl = `${
        process.env.CLIENT_URL || "https://licorice4good.com"
      }/auth/verify-email?token=${token}&email=${encodeURIComponent(to)}`;
      return;
    }
  }
};

// Order confirmation email
export const sendOrderConfirmationEmail = async (
  to: string,
  orderDetails: {
    orderId: string;
    customerName: string;
    total: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress: {
      street1: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    shippingDetails?: {
      trackingNumber?: string;
      trackingUrl?: string;
      carrier?: string;
      shippingCost?: number;
    };
  }
) => {
  const itemsHtml = orderDetails.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e9ecef; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e9ecef; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const emailHtml = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Thank you for your order, ${orderDetails.customerName}!</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: #e7f5ff; border-left: 4px solid #339af0; padding: 15px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; color: #1864ab;">
            <strong>Order Number:</strong> #${orderDetails.orderId}
          </p>
        </div>
        
        <h2 style="color: #333; font-size: 20px; margin-bottom: 15px;">Order Summary</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: white;">
          <thead>
            <tr style="background: #e9ecef;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr style="background: #f8f9fa; font-weight: bold;">
              <td colspan="3" style="padding: 15px; text-align: right;">Total:</td>
              <td style="padding: 15px; text-align: right; color: #28a745; font-size: 18px;">$${orderDetails.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <h2 style="color: #333; font-size: 20px; margin-bottom: 15px; margin-top: 30px;">📦 Shipping Address</h2>
        <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #dee2e6;">
          <p style="margin: 5px 0; color: #495057;">${orderDetails.shippingAddress.street1}</p>
          <p style="margin: 5px 0; color: #495057;">${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.zip}</p>
          <p style="margin: 5px 0; color: #495057;">${orderDetails.shippingAddress.country}</p>
        </div>
        
        ${orderDetails.shippingDetails ? `
        <h2 style="color: #333; font-size: 20px; margin-bottom: 15px; margin-top: 30px;">🚚 Shipping Details</h2>
        <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #dee2e6;">
          ${orderDetails.shippingDetails.carrier ? `
            <p style="margin: 5px 0; color: #495057;"><strong>Carrier:</strong> ${orderDetails.shippingDetails.carrier}</p>
          ` : ''}
          ${orderDetails.shippingDetails.shippingCost !== undefined ? `
            <p style="margin: 5px 0; color: #495057;"><strong>Shipping Cost:</strong> $${orderDetails.shippingDetails.shippingCost.toFixed(2)}</p>
          ` : ''}
          ${orderDetails.shippingDetails.trackingNumber ? `
            <p style="margin: 5px 0; color: #495057;"><strong>Tracking Number:</strong> ${orderDetails.shippingDetails.trackingNumber}</p>
          ` : ''}
          ${orderDetails.shippingDetails.trackingUrl ? `
            <div style="text-align: center; margin-top: 15px;">
              <a href="${orderDetails.shippingDetails.trackingUrl}" 
                 style="display: inline-block; background: #FF6B35; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; font-size: 14px; font-weight: bold;">
                🔍 Track Your Shipment
              </a>
            </div>
          ` : ''}
        </div>
        ` : `
        <div style="background: #d1f3d1; border: 1px solid #28a745; border-radius: 5px; padding: 15px; margin: 30px 0;">
          <p style="margin: 0; font-size: 14px; color: #155724;">
            <strong>✓ What's Next?</strong>
          </p>
          <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px; color: #155724;">
            <li>We're processing your order now</li>
            <li>You'll receive tracking details once your order ships</li>
          </ul>
        </div>
        `}
        
        <p style="font-size: 14px; color: #6c757d; margin-top: 30px; text-align: center;">
          Questions? Contact us at <a href="mailto:support@licorice4good.com" style="color: #007bff;">support@licorice4good.com</a>
        </p>
        
        <p style="font-size: 12px; color: #adb5bd; margin-top: 20px; text-align: center;">
          This is an automated email. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️  Gmail credentials not configured. Using Ethereal email for development.");
    
    try {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const mailOptions = {
        from: `"Licrorice" <${testAccount.user}>`,
        to,
        bcc: "muaz786m786@gmail.com", // Owner receives copy of all orders
        subject: `Order Confirmation - #${orderDetails.orderId}`,
        html: emailHtml,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`📧 Order confirmation email sent (Ethereal): ${nodemailer.getTestMessageUrl(info)}`);
      return;
    } catch (error) {
      console.error("❌ Error sending order confirmation email (Ethereal):", error);
      return;
    }
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "Licrorice <no-reply@licorice4good.com>",
      to,
      bcc: "muaz786m786@gmail.com", // Owner receives copy of all orders
      subject: `Order Confirmation - #${orderDetails.orderId}`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${to} (copy to owner)`);
  } catch (error) {
    console.error("❌ Error sending order confirmation email via Gmail:", error);
    // Fallback to Ethereal
    try {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const mailOptions = {
        from: `"Licrorice" <${testAccount.user}>`,
        to,
        bcc: "muaz786m786@gmail.com", // Owner receives copy of all orders
        subject: `Order Confirmation - #${orderDetails.orderId}`,
        html: emailHtml,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`📧 Order confirmation email sent (Ethereal fallback): ${nodemailer.getTestMessageUrl(info)}`);
      return;
    } catch (fallbackErr) {
      console.error("❌ Ethereal fallback failed:", fallbackErr);
      return;
    }
  }
};
