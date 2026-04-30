import { factories } from '@strapi/strapi';
import PDFDocument from 'pdfkit';

export default factories.createCoreService('api::order.order', ({ strapi }) => ({
  async generateTicketPDF(attendeeId) {
    const attendee: any = await strapi.db.query('api::attendee.attendee').findOne({
      where: { documentId: attendeeId },
      populate: ['event', 'order']
    });

    if (!attendee) throw new Error('Attendee not found');
    const event = attendee.event;

    // Create a new PDF document
    const doc = new PDFDocument({ 
      margin: 0, 
      size: 'A4',
      info: {
        Title: `Ticket - ${attendee.referenceCode}`,
        Author: 'CMF Global'
      }
    });

    // Formatting dates
    const dateObj = new Date(event.startDateTime);
    const dateStr = dateObj.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const timeStr = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });

    // Layout Constants
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const cardWidth = 400;
    const cardHeight = 600;
    const cardX = (pageWidth - cardWidth) / 2;
    const cardY = (pageHeight - cardHeight) / 2;

    // --- DRAWING ---
    
    // Background
    doc.rect(0, 0, pageWidth, pageHeight).fill('#F8F9FA');

    // Card Shadow (Subtle)
    doc.roundedRect(cardX + 5, cardY + 5, cardWidth, cardHeight, 30).fill('#E2E8F0');

    // Main Card
    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 30).fill('#FFFFFF');

    // Header Area
    doc.path(`M ${cardX + 30} ${cardY} L ${cardX + cardWidth - 30} ${cardY} Q ${cardX + cardWidth} ${cardY} ${cardX + cardWidth} ${cardY + 30} L ${cardX + cardWidth} ${cardY + 120} L ${cardX} ${cardY + 120} L ${cardX} ${cardY + 30} Q ${cardX} ${cardY} ${cardX + 30} ${cardY} Z`)
       .fill('#1a1a1a');

    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1339';

    // 1. Fetch Global Logo
    let logoPath = null;
    try {
      const globalSetting = await strapi.documents('api::global-setting.global-setting').findFirst({
        populate: ['logo']
      });
      if (globalSetting?.logo?.url) {
        // We need to download or hit the local path for the logo
        const logoUrl = `${strapiUrl}${globalSetting.logo.url}`;
        const axios = require('axios');
        const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
        logoPath = Buffer.from(response.data);
      }
    } catch (err) {
      console.log('PDF Logo Fetch Warning:', err.message);
    }

    // Header Logo & Branding
    if (logoPath) {
      doc.image(logoPath, cardX + (cardWidth - 50) / 2, cardY + 35, { width: 50 });
    } else {
      doc.fillColor('#FFFFFF')
         .fontSize(22)
         .font('Helvetica-Bold')
         .text('CMF GLOBAL', cardX, cardY + 45, { align: 'center', width: cardWidth, characterSpacing: 4 });
    }
    
    doc.fillColor('#E63946')
       .fontSize(8)
       .text('OFFICIAL EVENT INVITATION', cardX, cardY + 75, { align: 'center', width: cardWidth, characterSpacing: 2 });

    // Reference Section
    doc.fillColor('#999999')
       .fontSize(9)
       .text('YOUR TICKET REFERENCE', cardX, cardY + 160, { align: 'center', width: cardWidth });
    
    doc.fillColor('#1a1a1a')
       .fontSize(32)
       .text(attendee.referenceCode, cardX, cardY + 180, { align: 'center', width: cardWidth });

    // Event Box (Beige Container)
    const boxY = cardY + 240;
    const boxRadius = 30;
    
    // Create a clipping group for the beige box
    doc.save();
    doc.roundedRect(cardX + 40, boxY, cardWidth - 80, 145, boxRadius).clip();
    
    // Fill the beige background
    doc.rect(cardX + 40, boxY, cardWidth - 80, 145).fill('#FDF2F2');
    
    // Event Title
    doc.fillColor('#1a1a1a')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text(event.title, cardX + 60, boxY + 25, { width: cardWidth - 120, align: 'center' });
    
    // Combined Red Badge (Location + Date) - Automatically clipped at corners!
    const badgeHeight = 50;
    const badgeY = boxY + 145 - badgeHeight; // Align to bottom
    
    doc.fillColor('#E63946')
       .rect(cardX + 40, badgeY, cardWidth - 80, badgeHeight).fill();
    
    doc.fillColor('#FFFFFF')
       .fontSize(8)
       .font('Helvetica-Bold')
       .text(event.location.toUpperCase(), cardX + 60, badgeY + 12, { align: 'center', width: cardWidth - 120, characterSpacing: 1 });
    
    doc.fillColor('#FFFFFF')
       .fontSize(9)
       .font('Helvetica')
       .text(`${dateStr} @ ${timeStr}`, cardX + 60, badgeY + 28, { align: 'center', width: cardWidth - 120 });

    // Restore path so we don't clip subsequent items
    doc.restore();

    // Attendee Details
    const detailsY = cardY + 400;
    
    doc.fillColor('#999999')
       .fontSize(8)
       .text('PASS HOLDER', cardX + 50, detailsY);
    doc.fillColor('#1a1a1a')
       .fontSize(14)
       .text(`${attendee.firstName} ${attendee.lastName}`, cardX + 50, detailsY + 15);

    doc.fillColor('#999999')
       .fontSize(8)
       .text('COMPANY', cardX + 50, detailsY + 50);
    doc.fillColor('#1a1a1a')
       .fontSize(14)
       .text(attendee.companyName || 'N/A', cardX + 50, detailsY + 65);

    // Perforation line
    doc.moveTo(cardX, cardY + 530)
       .lineTo(cardX + cardWidth, cardY + 530)
       .dash(5, { space: 5 })
       .strokeColor('#EEEEEE')
       .stroke();

    // Footer
    doc.undash()
       .fillColor('#BBBBBB')
       .fontSize(8)
       .text('PLEASE PRESENT THIS DIGITAL PASS AT THE ENTRANCE', cardX, cardY + 560, { align: 'center', width: cardWidth });

    doc.end();
    return doc;
  },

  async generateInvoicePDF(order: any) {
    const PDFDocument = require('pdfkit');
    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1339';
    
    // 1. Fetch Logo first
    let logoBuf = null;
    try {
      const global = await strapi.documents('api::global-setting.global-setting').findFirst({ populate: ['logo'] });
      if (global?.logo?.url) {
        const axios = require('axios');
        const resp = await axios.get(`${strapiUrl}${global.logo.url}`, { responseType: 'arraybuffer' });
        logoBuf = Buffer.from(resp.data);
      }
    } catch (e) { console.log('Invoice Logo Error:', e.message); }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        info: {
          Title: `Invoice - ${order.refNo}`,
          Author: 'CMF Global'
        }
      });

      const buffers: any[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // --- COLORS & STYLING ---
      const primaryColor = '#E63946'; // CMF Red
      const lightGray = '#F1F4F8';

      // --- HEADER ---
      if (logoBuf) {
        doc.image(logoBuf, 50, 45, { width: 60 });
      } else {
        doc.fillColor(primaryColor)
           .fontSize(24)
           .font('Helvetica-Bold')
           .text('CMF GLOBAL', 50, 50);
      }
      
      // Branding text removed per user request

      doc.fillColor(primaryColor)
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('TAX INVOICE / RECEIPT', 300, 50, { align: 'right' });

      doc.fontSize(10)
         .fillColor('#333333')
         .font('Helvetica-Bold')
         .text(`REF: ${order.refNo}`, 300, 75, { align: 'right' });

      doc.moveDown(2);
      doc.moveTo(50, 110).lineTo(550, 110).strokeColor('#EEEEEE').stroke();

      // --- INFO SECTION ---
      doc.moveDown(2);
      const startY = 130;

      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(11).text('FROM:', 50, startY);
      doc.fillColor('#000000').font('Helvetica').fontSize(10);
      doc.text('CMF Global Resources', 50, startY + 20);
      doc.text('UNIT E2-1-13 JALAN 1/152', 50, startY + 35);
      doc.text('TAMAN OUG PARKLANE', 50, startY + 50);
      doc.text('58200 KUALA LUMPUR W.P. KUALA LUMPUR', 50, startY + 65);
      doc.text('Email: general@cmfglobalcentre.com', 50, startY + 80);

      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(11).text('BILL TO:', 300, startY);
      doc.fillColor('#000000').font('Helvetica').fontSize(10);
      doc.text(`${order.buyerFirstName} ${order.buyerLastName}`, 300, startY + 20);
      if (order.buyerCompanyName) doc.text(order.buyerCompanyName, 300, startY + 35);
      
      const address = typeof order.buyerBillingAddress === 'string' 
        ? order.buyerBillingAddress 
        : `${order.buyerBillingAddress?.address || ''}, ${order.buyerBillingAddress?.city || ''}, ${order.buyerBillingAddress?.country || ''}`;
      
      doc.text(address, 300, startY + 50, { width: 250 });

      // --- TABLE ---
      doc.moveDown(4);
      const tableTop = 270;
      doc.rect(50, tableTop, 500, 25).fill(lightGray);
      
      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10);
      doc.text('DESCRIPTION', 60, tableTop + 7);
      doc.text('UNIT PRICE', 350, tableTop + 7, { width: 90, align: 'right' });
      doc.text('TOTAL', 450, tableTop + 7, { width: 90, align: 'right' });

      doc.font('Helvetica').fillColor('#000000').fontSize(11);
      const description = order.membership_type?.name || order.event?.title || (order.type === 'membership' ? 'CMF Membership Subscription' : 'Event Ticket Purchase');
      
      doc.text(description, 60, tableTop + 40, { width: 280 });
      doc.text(`${order.currency} ${order.amountPaid?.toFixed(2)}`, 350, tableTop + 40, { width: 90, align: 'right' });
      doc.text(`${order.currency} ${order.amountPaid?.toFixed(2)}`, 450, tableTop + 40, { width: 90, align: 'right' });

      // --- TOTALS ---
      const totalTop = tableTop + 100;
      doc.font('Helvetica-Bold').text('SUBTOTAL:', 350, totalTop, { width: 90, align: 'right' });
      doc.font('Helvetica').text(`${order.currency} ${order.amountPaid?.toFixed(2)}`, 450, totalTop, { width: 90, align: 'right' });

      doc.rect(340, totalTop + 45, 210, 40).fill(primaryColor);
      doc.fillColor('#FFFFFF').fontSize(14).font('Helvetica-Bold');
      doc.text('GRAND TOTAL:', 350, totalTop + 58);
      doc.text(`${order.currency} ${order.amountPaid?.toFixed(2)}`, 450, totalTop + 58, { width: 90, align: 'right' });

      doc.moveDown(10);
      doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold').text('PAYMENT DETAILS', 50, doc.y);
      doc.font('Helvetica').fontSize(9);
      doc.text(`Status: ${order.orderStatus?.toUpperCase()}`, 50, doc.y + 5);
      doc.text(`Payment ID: ${order.paymentRequestId || 'N/A'}`, 50, doc.y + 5);
      doc.text(`Payment Date: ${new Date(order.updatedAt).toLocaleDateString()}`, 50, doc.y + 5);

      doc.fillColor('#999999').fontSize(8).moveDown(2);
      doc.text('This is a computer-generated tax invoice. No signature is required.', 50, doc.y);

      doc.end();
    });
  },
}));
