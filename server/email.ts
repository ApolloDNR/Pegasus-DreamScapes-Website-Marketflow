interface SendGridAttachment {
  filename: string;
  content: string; // base64
  type?: string;
  disposition?: "attachment" | "inline";
}

interface SendGridMailOptions {
  to: string | string[];
  from: string;
  replyTo?: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, unknown>;
  attachments?: SendGridAttachment[];
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  fallback?: boolean;
}

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const DEFAULT_FROM_EMAIL = process.env.DEFAULT_FROM_EMAIL || "noreply@pegasusdreamscapes.com";
const COMPANY_NAME = "Pegasus DreamScapes Corp";

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
        reply_to: options.replyTo ? { email: options.replyTo } : undefined,
        subject: options.subject,
        content: options.html 
          ? [{ type: "text/html", value: options.html }]
          : options.text 
            ? [{ type: "text/plain", value: options.text }]
            : undefined,
        template_id: options.templateId,
        attachments: options.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          type: a.type ?? "application/octet-stream",
          disposition: a.disposition ?? "attachment",
        })),
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
    <p style="margin-top: 20px; color: #666;">This lead was submitted through the Pegasus DreamScapes website.</p>
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
    <p style="margin-top: 20px; color: #666;">This lead was submitted through the Pegasus DreamScapes website.</p>
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
    <p style="margin-top: 20px; color: #666;">This lead was submitted through the Pegasus DreamScapes website.</p>
  `;

  return sendEmail({
    to: staffEmail,
    subject: `New Buyer Lead: ${lead.name} - ${lead.buyerType}`,
    html,
  });
}

export async function sendVendorLeadNotification(lead: {
  name: string;
  email: string;
  phone: string;
  company?: string;
  trade?: string;
  license?: string;
  serviceArea?: string;
  notes?: string;
}): Promise<EmailResult> {
  const staffEmail = process.env.STAFF_NOTIFICATION_EMAIL || "apollo@pegasusdreamscapes.com";

  const html = `
    <h2>New Vendor Network Application</h2>
    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.name}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><a href="tel:${lead.phone}">${lead.phone}</a></td></tr>
      ${lead.company ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Company</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.company}</td></tr>` : ''}
      ${lead.trade ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Trade</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.trade}</td></tr>` : ''}
      ${lead.license ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>License</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.license}</td></tr>` : ''}
      ${lead.serviceArea ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Service Area</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.serviceArea}</td></tr>` : ''}
      ${lead.notes ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Notes</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.notes}</td></tr>` : ''}
    </table>
    <p style="margin-top: 20px;">
      <a href="${process.env.SITE_URL || 'https://pegasusdreamscapes.com'}/admin/vendors" style="display: inline-block; padding: 10px 20px; background: #c77b30; color: white; text-decoration: none; border-radius: 4px;">Review in Vendor HQ</a>
    </p>
    <p style="margin-top: 20px; color: #666;">This application was submitted through the Pegasus Vendor Network intake.</p>
  `;

  return sendEmail({
    to: staffEmail,
    subject: `New Vendor Application: ${lead.name}${lead.trade ? ` (${lead.trade})` : ''}`,
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
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Pegasus DreamScapes</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Where Designed Profits Are Crafted</p>
      </div>
      
      <div style="padding: 40px 20px; background: #f8f8f6;">
        <h2 style="color: #1a1a1a; margin-top: 0;">Hello, ${user.name}!</h2>
        <p style="color: #555; line-height: 1.6;">
          Thank you for joining Pegasus DreamScapes. Your account has been created successfully, and you're now ready to ${roleDescription}.
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
          <strong>The Pegasus DreamScapes Team</strong>
        </p>
      </div>
      
      <div style="padding: 20px; text-align: center; background: #1a1a1a; color: #888; font-size: 12px;">
        <p style="margin: 0;">Pegasus DreamScapes Corp &copy; ${new Date().getFullYear()}</p>
        <p style="margin: 5px 0 0;">Transforming distressed homes into thriving communities</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Welcome to Pegasus DreamScapes, ${user.name}!`,
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
        <h1 style="color: white; margin: 0; font-size: 24px;">Pegasus DreamScapes</h1>
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
        <p style="margin: 0;">Pegasus DreamScapes Corp &copy; ${new Date().getFullYear()}</p>
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
        <h1 style="color: white; margin: 0; font-size: 24px;">Pegasus DreamScapes</h1>
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
        <p style="margin: 0;">Pegasus DreamScapes Corp &copy; ${new Date().getFullYear()}</p>
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
        <h1 style="color: white; margin: 0; font-size: 24px;">Pegasus DreamScapes</h1>
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
        <p style="margin: 0;">Pegasus DreamScapes Corp &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: update.recipientEmail,
    subject: `Deal Update: ${update.dealTitle}`,
    html,
  });
}

export async function sendSavedAnalysisPDFEmail(params: {
  recipientName: string;
  recipientEmail: string;
  senderName?: string;
  senderEmail?: string;
  analysisName: string;
  calculatorLabel: string;
  propertyAddress?: string | null;
  primaryMetric?: string | null;
  primaryValue?: string | null;
  note?: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
}): Promise<EmailResult> {
  const safeNote = (params.note ?? "").trim();
  const fromLine = params.senderName
    ? `${params.senderName}${params.senderEmail ? ` (${params.senderEmail})` : ""}`
    : "a Pegasus DreamScapes user";
  const subjectFrom = params.senderName ? ` from ${params.senderName}` : "";
  const subject = `Strategy Analysis: ${params.analysisName}${subjectFrom}`;

  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const noteHtml = safeNote
    ? `<div style="background:#f6efe4;border-left:4px solid #c77a3a;padding:14px 18px;margin:20px 0;color:#1e2328;line-height:1.55;white-space:pre-wrap;">${escapeHtml(safeNote)}</div>`
    : "";

  const metaRow = (label: string, value?: string | null) =>
    value
      ? `<tr><td style="padding:6px 0;color:#5b6470;font-size:13px;">${escapeHtml(label)}</td><td style="padding:6px 0 6px 16px;color:#0d1b2d;font-weight:600;font-size:13px;">${escapeHtml(value)}</td></tr>`
      : "";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background:#ffffff;">
      <div style="background:#0d1b2d;padding:28px 24px;text-align:center;">
        <h1 style="color:#f6efe4;margin:0;font-size:22px;letter-spacing:0.04em;">Pegasus DreamScapes</h1>
        <p style="color:#c77a3a;margin:6px 0 0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;">Strategy Analysis Attached</p>
      </div>

      <div style="padding:32px 28px;background:#f6efe4;color:#1e2328;">
        <p style="margin:0 0 14px;font-size:15px;line-height:1.55;">Hello ${escapeHtml(params.recipientName)},</p>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.55;">
          ${escapeHtml(fromLine)} has shared a property strategy analysis with you. The full branded PDF is attached to this email.
        </p>

        <div style="background:#ffffff;border:1px solid #e6dccd;border-radius:6px;padding:18px 20px;margin:18px 0;">
          <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#c77a3a;font-weight:600;">${escapeHtml(params.calculatorLabel)}</p>
          <p style="margin:0 0 14px;font-size:18px;font-weight:600;color:#0d1b2d;">${escapeHtml(params.analysisName)}</p>
          <table style="width:100%;border-collapse:collapse;">
            ${metaRow("Property", params.propertyAddress ?? undefined)}
            ${params.primaryMetric && params.primaryValue ? metaRow(params.primaryMetric, params.primaryValue) : ""}
          </table>
        </div>

        ${noteHtml}

        <p style="margin:20px 0 0;font-size:12px;color:#5b6470;line-height:1.5;font-style:italic;">
          Illustrative math only. Not investment advice and not an offer of guaranteed returns or principal protection.
        </p>
      </div>

      <div style="padding:18px;text-align:center;background:#0d1b2d;color:#a8b0bc;font-size:11px;">
        <p style="margin:0;">Pegasus DreamScapes Corp &copy; ${new Date().getFullYear()}</p>
        <p style="margin:6px 0 0;">Where others see impossible, we see a path.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: params.recipientEmail,
    replyTo: params.senderEmail,
    subject,
    html,
    attachments: [
      {
        filename: params.pdfFilename,
        content: params.pdfBuffer.toString("base64"),
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
  });
}

// ============================================================================
// STRATEGY LAB — Submit-to-Pegasus + Blueprint order notifications (Task #85)
// ============================================================================

function escapeEmailHtml(s: string | null | undefined): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendPegasusSubmissionNotification(payload: {
  submissionId: number;
  propertyAnalysisId: number;
  address: string;
  topLane: string | null;
  topLaneVerdict: string | null;
  submitterName: string | null;
  submitterEmail: string | null;
  submitterPhone: string | null;
  submitterRole: string | null;
  notes: string | null;
  slaDueAt: Date;
  pdfBuffer?: Buffer | null;
}): Promise<EmailResult> {
  const staffEmail = process.env.STAFF_NOTIFICATION_EMAIL || "apollo@pegasusdreamscapes.com";
  const siteUrl = process.env.SITE_URL || "https://pegasusdreamscapes.com";
  const sla = payload.slaDueAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  const html = `
    <h2 style="font-family: Georgia, serif; color: #0D1B2D;">New Strategy Lab Submission</h2>
    <p style="color:#555;">Submission #${payload.submissionId}. Review SLA: <strong>${sla}</strong> (48 business hours).</p>
    <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
      <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Property</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeEmailHtml(payload.address)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Recommended lane</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeEmailHtml(payload.topLane ?? "(none)")} — ${escapeEmailHtml(payload.topLaneVerdict ?? "")}</td></tr>
      ${payload.submitterName ? `<tr><td style="padding:8px;border:1px solid #ddd;"><strong>Submitter</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeEmailHtml(payload.submitterName)}</td></tr>` : ""}
      ${payload.submitterEmail ? `<tr><td style="padding:8px;border:1px solid #ddd;"><strong>Email</strong></td><td style="padding:8px;border:1px solid #ddd;"><a href="mailto:${encodeURIComponent(payload.submitterEmail)}">${escapeEmailHtml(payload.submitterEmail)}</a></td></tr>` : ""}
      ${payload.submitterPhone ? `<tr><td style="padding:8px;border:1px solid #ddd;"><strong>Phone</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeEmailHtml(payload.submitterPhone)}</td></tr>` : ""}
      ${payload.submitterRole ? `<tr><td style="padding:8px;border:1px solid #ddd;"><strong>Role</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeEmailHtml(payload.submitterRole)}</td></tr>` : ""}
      ${payload.notes ? `<tr><td style="padding:8px;border:1px solid #ddd;"><strong>Notes</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeEmailHtml(payload.notes).replace(/\n/g, "<br>")}</td></tr>` : ""}
    </table>
    <p style="margin-top: 20px;">
      <a href="${siteUrl}/admin/strategy-lab" style="display:inline-block;padding:10px 20px;background:#C77A3A;color:#fff;text-decoration:none;border-radius:4px;">Open Admin · Strategy Lab</a>
    </p>
    <p style="color:#666;font-size:12px;margin-top:24px;">If this submission is not reviewed by the SLA, it will be flagged as escalated for priority review.</p>
  `;

  const attachments = payload.pdfBuffer
    ? [{
        content: payload.pdfBuffer.toString("base64"),
        filename: `strategy-snapshot-${payload.propertyAnalysisId}.pdf`,
        type: "application/pdf",
        disposition: "attachment" as const,
      }]
    : undefined;

  return sendEmail({
    to: staffEmail,
    subject: `Strategy Lab Submission #${payload.submissionId} · ${payload.address}`
      .replace(/[\r\n]+/g, " ")
      .slice(0, 200),
    html,
    attachments,
  });
}

export async function sendBlueprintOrderNotification(payload: {
  orderId: number;
  tier: string;
  tierTitle: string;
  priceCents: number;
  paymentMethod: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  propertyAnalysisId: number | null;
  notes: string | null;
  pdfBuffer?: Buffer | null;
}): Promise<EmailResult> {
  const staffEmail = process.env.STAFF_NOTIFICATION_EMAIL || "apollo@pegasusdreamscapes.com";
  const siteUrl = process.env.SITE_URL || "https://pegasusdreamscapes.com";
  const price = `$${(payload.priceCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const html = `
    <h2 style="font-family: Georgia, serif; color: #0D1B2D;">New Blueprint Order</h2>
    <p style="color:#555;">Order #${payload.orderId}. Payment method: <strong>${payload.paymentMethod}</strong>.</p>
    <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
      <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Tier</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeEmailHtml(payload.tierTitle)} (${escapeEmailHtml(payload.tier)})</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Price</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeEmailHtml(price)}</td></tr>
      ${payload.contactName ? `<tr><td style="padding:8px;border:1px solid #ddd;"><strong>Contact</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeEmailHtml(payload.contactName)}</td></tr>` : ""}
      ${payload.contactEmail ? `<tr><td style="padding:8px;border:1px solid #ddd;"><strong>Email</strong></td><td style="padding:8px;border:1px solid #ddd;"><a href="mailto:${encodeURIComponent(payload.contactEmail)}">${escapeEmailHtml(payload.contactEmail)}</a></td></tr>` : ""}
      ${payload.contactPhone ? `<tr><td style="padding:8px;border:1px solid #ddd;"><strong>Phone</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeEmailHtml(payload.contactPhone)}</td></tr>` : ""}
      ${payload.propertyAnalysisId ? `<tr><td style="padding:8px;border:1px solid #ddd;"><strong>Linked snapshot</strong></td><td style="padding:8px;border:1px solid #ddd;">Property analysis #${payload.propertyAnalysisId}</td></tr>` : ""}
      ${payload.notes ? `<tr><td style="padding:8px;border:1px solid #ddd;"><strong>Notes</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeEmailHtml(payload.notes).replace(/\n/g, "<br>")}</td></tr>` : ""}
    </table>
    ${payload.paymentMethod === "invoice" ? `<p style="color:#0D1B2D;margin-top:16px;"><strong>Action required:</strong> send the invoice to the contact above.</p>` : ""}
    <p style="margin-top:20px;">
      <a href="${siteUrl}/admin/strategy-lab" style="display:inline-block;padding:10px 20px;background:#C77A3A;color:#fff;text-decoration:none;border-radius:4px;">Open Admin · Strategy Lab</a>
    </p>
  `;
  const attachments = payload.pdfBuffer
    ? [{
        content: payload.pdfBuffer.toString("base64"),
        filename: `strategy-snapshot-${payload.propertyAnalysisId ?? payload.orderId}.pdf`,
        type: "application/pdf",
        disposition: "attachment" as const,
      }]
    : undefined;
  return sendEmail({
    to: staffEmail,
    subject: `Blueprint Order #${payload.orderId} · ${payload.tierTitle} · ${price}`
      .replace(/[\r\n]+/g, " ")
      .slice(0, 200),
    html,
    attachments,
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
  sendSavedAnalysisPDFEmail,
  isConfigured,
};

export default emailService;
