interface SendGridMailOptions {
  to: string | string[];
  from: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, unknown>;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  fallback?: boolean;
}

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const DEFAULT_FROM_EMAIL = process.env.DEFAULT_FROM_EMAIL || "noreply@pegasusdreamscapes.com";
const COMPANY_NAME = "Pegasus Dreamscapes Corp";

function isConfigured(): boolean {
  return Boolean(SENDGRID_API_KEY);
}

async function sendWithSendGrid(options: SendGridMailOptions): Promise<EmailResult> {
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: Array.isArray(options.to) 
              ? options.to.map(email => ({ email }))
              : [{ email: options.to }],
            dynamic_template_data: options.dynamicTemplateData,
          },
        ],
        from: { email: options.from, name: COMPANY_NAME },
        subject: options.subject,
        content: options.html 
          ? [{ type: "text/html", value: options.html }]
          : options.text 
            ? [{ type: "text/plain", value: options.text }]
            : undefined,
        template_id: options.templateId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SendGrid error:", errorText);
      return {
        success: false,
        error: `SendGrid API error: ${response.status}`,
      };
    }

    const messageId = response.headers.get("x-message-id") || undefined;
    return { success: true, messageId };
  } catch (error) {
    console.error("SendGrid request failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function logEmailFallback(options: SendGridMailOptions): EmailResult {
  console.log("=".repeat(60));
  console.log("EMAIL NOTIFICATION (SendGrid not configured)");
  console.log("=".repeat(60));
  console.log(`To: ${Array.isArray(options.to) ? options.to.join(", ") : options.to}`);
  console.log(`From: ${options.from}`);
  console.log(`Subject: ${options.subject}`);
  if (options.text) {
    console.log(`Body (text):\n${options.text}`);
  }
  if (options.html) {
    console.log(`Body (HTML - truncated):\n${options.html.substring(0, 500)}...`);
  }
  console.log("=".repeat(60));
  
  return { success: true, fallback: true };
}

export async function sendEmail(options: Omit<SendGridMailOptions, 'from'> & { from?: string }): Promise<EmailResult> {
  const emailOptions: SendGridMailOptions = {
    ...options,
    from: options.from || DEFAULT_FROM_EMAIL,
  };

  if (isConfigured()) {
    return sendWithSendGrid(emailOptions);
  } else {
    return logEmailFallback(emailOptions);
  }
}

export async function sendSellerLeadNotification(lead: {
  name: string;
  email: string;
  phone: string;
  address: string;
  propertyType: string;
  condition: string;
  timeline: string;
  notes?: string;
}): Promise<EmailResult> {
  const staffEmail = process.env.STAFF_NOTIFICATION_EMAIL || "leads@pegasusdreamscapes.com";
  
  const html = `
    <h2>New Seller Lead Received</h2>
    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.name}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><a href="tel:${lead.phone}">${lead.phone}</a></td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Property Address</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.address}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Property Type</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.propertyType}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Condition</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.condition}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Timeline</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.timeline}</td></tr>
      ${lead.notes ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Notes</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.notes}</td></tr>` : ''}
    </table>
    <p style="margin-top: 20px; color: #666;">This lead was submitted through the Pegasus Dreamscapes website.</p>
  `;

  return sendEmail({
    to: staffEmail,
    subject: `New Seller Lead: ${lead.address}`,
    html,
  });
}

export async function sendDealSubmissionNotification(deal: {
  propertyAddress: string;
  city: string;
  state: string;
  contractPrice: number;
  assignmentFee: number;
  arv?: number;
  submittedBy: string;
}): Promise<EmailResult> {
  const staffEmail = process.env.STAFF_NOTIFICATION_EMAIL || "deals@pegasusdreamscapes.com";
  
  const html = `
    <h2>New Wholesale Deal Submitted</h2>
    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Property</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${deal.propertyAddress}, ${deal.city}, ${deal.state}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Contract Price</strong></td><td style="padding: 8px; border: 1px solid #ddd;">$${deal.contractPrice.toLocaleString()}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Assignment Fee</strong></td><td style="padding: 8px; border: 1px solid #ddd;">$${deal.assignmentFee.toLocaleString()}</td></tr>
      ${deal.arv ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>ARV</strong></td><td style="padding: 8px; border: 1px solid #ddd;">$${deal.arv.toLocaleString()}</td></tr>` : ''}
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Submitted By</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${deal.submittedBy}</td></tr>
    </table>
    <p style="margin-top: 20px;">
      <a href="${process.env.SITE_URL || 'https://pegasusdreamscapes.com'}/marketplace/admin" style="display: inline-block; padding: 10px 20px; background: #c77b30; color: white; text-decoration: none; border-radius: 4px;">View in Admin Dashboard</a>
    </p>
  `;

  return sendEmail({
    to: staffEmail,
    subject: `New Deal: ${deal.propertyAddress}, ${deal.city} - $${deal.contractPrice.toLocaleString()}`,
    html,
  });
}

export async function sendInvestorLeadNotification(lead: {
  name: string;
  email: string;
  phone: string;
  investmentRange: string;
  strategy: string;
  notes?: string;
}): Promise<EmailResult> {
  const staffEmail = process.env.STAFF_NOTIFICATION_EMAIL || "investors@pegasusdreamscapes.com";
  
  const html = `
    <h2>New Investor Lead Received</h2>
    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.name}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><a href="tel:${lead.phone}">${lead.phone}</a></td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Investment Range</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.investmentRange}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Strategy</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.strategy}</td></tr>
      ${lead.notes ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Notes</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.notes}</td></tr>` : ''}
    </table>
    <p style="margin-top: 20px; color: #666;">This lead was submitted through the Pegasus Dreamscapes website.</p>
  `;

  return sendEmail({
    to: staffEmail,
    subject: `New Investor Lead: ${lead.name}`,
    html,
  });
}

export async function sendBuyerLeadNotification(lead: {
  name: string;
  email: string;
  phone: string;
  buyerType: string;
  priceRange: string;
  locations?: string[];
  notes?: string;
}): Promise<EmailResult> {
  const staffEmail = process.env.STAFF_NOTIFICATION_EMAIL || "buyers@pegasusdreamscapes.com";
  
  const html = `
    <h2>New Buyer Lead Received</h2>
    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.name}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><a href="tel:${lead.phone}">${lead.phone}</a></td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Buyer Type</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.buyerType}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Price Range</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.priceRange}</td></tr>
      ${lead.locations ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Target Locations</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.locations.join(", ")}</td></tr>` : ''}
      ${lead.notes ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Notes</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.notes}</td></tr>` : ''}
    </table>
    <p style="margin-top: 20px; color: #666;">This lead was submitted through the Pegasus Dreamscapes website.</p>
  `;

  return sendEmail({
    to: staffEmail,
    subject: `New Buyer Lead: ${lead.name} - ${lead.buyerType}`,
    html,
  });
}

export async function sendWelcomeEmail(user: {
  email: string;
  name: string;
  role: string;
}): Promise<EmailResult> {
  const roleDescriptions: Record<string, string> = {
    investor: "access our exclusive investment opportunities and capital raising projects",
    wholesaler: "list and market your wholesale deals to our network of buyers",
    pegasus_wholesaler: "access premium wholesaling features and priority deal placement",
    dreamscaper: "manage projects and collaborate with our investment community",
    pegasus_dreamscaper: "access premium project management and community features",
    buyer_retail: "browse our curated selection of renovated properties",
    buyer_investment: "discover investment-grade properties and wholesale deals",
    admin: "manage the platform, users, and content",
  };

  const roleDescription = roleDescriptions[user.role] || "access our real estate marketplace";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #c77b30 0%, #a65c1a 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Pegasus Dreamscapes</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Where Designed Profits Are Crafted</p>
      </div>
      
      <div style="padding: 40px 20px; background: #f8f8f6;">
        <h2 style="color: #1a1a1a; margin-top: 0;">Hello, ${user.name}!</h2>
        <p style="color: #555; line-height: 1.6;">
          Thank you for joining Pegasus Dreamscapes. Your account has been created successfully, and you're now ready to ${roleDescription}.
        </p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.SITE_URL || 'https://pegasusdreamscapes.com'}/marketplace" 
             style="display: inline-block; padding: 15px 30px; background: #c77b30; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Go to Your Dashboard
          </a>
        </div>
        
        <p style="color: #555; line-height: 1.6;">
          If you have any questions, our team is here to help. Simply reply to this email or visit our contact page.
        </p>
        
        <p style="color: #555; margin-top: 30px;">
          Best regards,<br>
          <strong>The Pegasus Dreamscapes Team</strong>
        </p>
      </div>
      
      <div style="padding: 20px; text-align: center; background: #1a1a1a; color: #888; font-size: 12px;">
        <p style="margin: 0;">Pegasus Dreamscapes Corp &copy; ${new Date().getFullYear()}</p>
        <p style="margin: 5px 0 0;">Transforming distressed homes into thriving communities</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Welcome to Pegasus Dreamscapes, ${user.name}!`,
    html,
  });
}

export async function sendOfferNotification(offer: {
  recipientEmail: string;
  recipientName: string;
  dealTitle: string;
  dealAddress: string;
  offerAmount: number;
  offerType: 'new' | 'counter' | 'accepted' | 'declined';
  offererName?: string;
  notes?: string;
}): Promise<EmailResult> {
  const typeMessages = {
    new: { subject: 'New Offer Received', action: 'has submitted an offer', color: '#3b82f6' },
    counter: { subject: 'Counter-Offer Received', action: 'has submitted a counter-offer', color: '#f59e0b' },
    accepted: { subject: 'Offer Accepted', action: 'Your offer has been accepted', color: '#22c55e' },
    declined: { subject: 'Offer Declined', action: 'Your offer was declined', color: '#ef4444' },
  };

  const msg = typeMessages[offer.offerType];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #c77b30 0%, #a65c1a 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Pegasus Dreamscapes</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px;">Deal Update Notification</p>
      </div>
      
      <div style="padding: 30px 20px; background: #f8f8f6;">
        <h2 style="color: #1a1a1a; margin-top: 0; border-left: 4px solid ${msg.color}; padding-left: 12px;">${msg.subject}</h2>
        
        <p style="color: #555; line-height: 1.6;">
          Hello ${offer.recipientName},<br><br>
          ${offer.offerType === 'accepted' || offer.offerType === 'declined' 
            ? msg.action 
            : `${offer.offererName || 'An investor'} ${msg.action}`} on the following property:
        </p>
        
        <div style="background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px; font-weight: bold; color: #1a1a1a;">${offer.dealTitle}</p>
          <p style="margin: 0 0 12px; color: #666; font-size: 14px;">${offer.dealAddress}</p>
          <p style="margin: 0; font-size: 24px; color: #c77b30; font-weight: bold;">$${offer.offerAmount.toLocaleString()}</p>
        </div>
        
        ${offer.notes ? `<p style="color: #555; background: #f0f0f0; padding: 12px; border-radius: 4px; font-style: italic;">"${offer.notes}"</p>` : ''}
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${process.env.SITE_URL || 'https://pegasusdreamscapes.com'}/marketflow" 
             style="display: inline-block; padding: 14px 28px; background: #c77b30; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
            View Deal in MarketFlow
          </a>
        </div>
      </div>
      
      <div style="padding: 20px; text-align: center; background: #1a1a1a; color: #888; font-size: 12px;">
        <p style="margin: 0;">Pegasus Dreamscapes Corp &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: offer.recipientEmail,
    subject: `${msg.subject}: ${offer.dealTitle}`,
    html,
  });
}

export async function sendMessageNotification(message: {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  messagePreview: string;
  dealTitle?: string;
}): Promise<EmailResult> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #c77b30 0%, #a65c1a 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Pegasus Dreamscapes</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px;">New Message</p>
      </div>
      
      <div style="padding: 30px 20px; background: #f8f8f6;">
        <h2 style="color: #1a1a1a; margin-top: 0;">New Message from ${message.senderName}</h2>
        
        <p style="color: #555; line-height: 1.6;">
          Hello ${message.recipientName},<br><br>
          You have received a new message${message.dealTitle ? ` regarding "${message.dealTitle}"` : ''}:
        </p>
        
        <div style="background: white; border-left: 4px solid #c77b30; padding: 15px 20px; margin: 20px 0;">
          <p style="margin: 0; color: #333; font-style: italic;">"${message.messagePreview.substring(0, 200)}${message.messagePreview.length > 200 ? '...' : ''}"</p>
        </div>
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${process.env.SITE_URL || 'https://pegasusdreamscapes.com'}/marketflow/messages" 
             style="display: inline-block; padding: 14px 28px; background: #c77b30; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Reply to Message
          </a>
        </div>
      </div>
      
      <div style="padding: 20px; text-align: center; background: #1a1a1a; color: #888; font-size: 12px;">
        <p style="margin: 0;">Pegasus Dreamscapes Corp &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: message.recipientEmail,
    subject: `New message from ${message.senderName}${message.dealTitle ? ` about ${message.dealTitle}` : ''}`,
    html,
  });
}

export async function sendDealUpdateNotification(update: {
  recipientEmail: string;
  recipientName: string;
  dealTitle: string;
  updateType: 'status_change' | 'price_change' | 'new_documents';
  oldValue?: string;
  newValue?: string;
  message?: string;
}): Promise<EmailResult> {
  const updateMessages = {
    status_change: `The status of "${update.dealTitle}" has changed`,
    price_change: `The price of "${update.dealTitle}" has been updated`,
    new_documents: `New documents have been added to "${update.dealTitle}"`,
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #c77b30 0%, #a65c1a 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Pegasus Dreamscapes</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px;">Deal Update</p>
      </div>
      
      <div style="padding: 30px 20px; background: #f8f8f6;">
        <h2 style="color: #1a1a1a; margin-top: 0;">Deal Update</h2>
        
        <p style="color: #555; line-height: 1.6;">
          Hello ${update.recipientName},<br><br>
          ${updateMessages[update.updateType]}${update.oldValue && update.newValue ? ` from "${update.oldValue}" to "${update.newValue}"` : ''}.
        </p>
        
        ${update.message ? `<p style="color: #555; background: #f0f0f0; padding: 12px; border-radius: 4px;">${update.message}</p>` : ''}
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${process.env.SITE_URL || 'https://pegasusdreamscapes.com'}/marketflow" 
             style="display: inline-block; padding: 14px 28px; background: #c77b30; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
            View Deal Details
          </a>
        </div>
      </div>
      
      <div style="padding: 20px; text-align: center; background: #1a1a1a; color: #888; font-size: 12px;">
        <p style="margin: 0;">Pegasus Dreamscapes Corp &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: update.recipientEmail,
    subject: `Deal Update: ${update.dealTitle}`,
    html,
  });
}

export const emailService = {
  sendEmail,
  sendSellerLeadNotification,
  sendDealSubmissionNotification,
  sendInvestorLeadNotification,
  sendBuyerLeadNotification,
  sendWelcomeEmail,
  sendOfferNotification,
  sendMessageNotification,
  sendDealUpdateNotification,
  isConfigured,
};

export default emailService;
