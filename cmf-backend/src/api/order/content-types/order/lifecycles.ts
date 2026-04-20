export default {
  async afterCreate(event) {
    const { result } = event;
    await updateReceiptUrl(result);
  },

  async afterUpdate(event) {
    const { result } = event;
    await updateReceiptUrl(result);
  },
};

async function updateReceiptUrl(order) {
  if (order.orderStatus === 'paid' && !order.receiptUrl) {
    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1339';
    const appSecret = process.env.APP_KEYS ? process.env.APP_KEYS.split(',')[0] : 'cmf-secret';
    const crypto = require('crypto');
    const signature = crypto.createHmac('sha256', appSecret).update(order.documentId).digest('hex');
    
    const receiptUrl = `${strapiUrl}/api/orders/${order.documentId}/invoice?s=${signature}`;
    
    await strapi.documents('api::order.order').update({
      documentId: order.documentId,
      data: { receiptUrl },
      status: 'published'
    });
    
    console.log(`📑 [RECEIPT] Generated Secure URL for ${order.refNo}`);
  }
}
