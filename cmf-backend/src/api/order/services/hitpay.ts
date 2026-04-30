import axios from 'axios';
import crypto from 'crypto';

export default {
  async createPaymentRequest(amount, currency, reference, customerDetails) {
    const apiKey = process.env.HITPAY_API_KEY;
    let baseEndpoint = process.env.HITPAY_ENDPOINT?.trim() || 'api.sandbox.hit-pay.com';
    baseEndpoint = baseEndpoint.replace(/^https?:\/\//, '');
    const endpoint = `https://${baseEndpoint}/v1/payment-requests`;

    try {
      const params = new URLSearchParams();
      // Ensure amount is formatted to 2 decimal places for consistency
      const formattedAmount = Number(amount).toFixed(2);
      params.append('amount', formattedAmount);
      params.append('currency', currency);
      params.append('reference_number', reference);
      params.append('redirect_url', `${process.env.FRONTEND_URL || 'http://localhost:3003'}/payment-success?ref=${reference}`);
      
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:1339';
      if (!backendUrl.includes('localhost') && !backendUrl.includes('127.0.0.1')) {
        params.append('webhook', `${backendUrl}/api/orders/webhook`);
      }

      params.append('name', `${customerDetails.firstName} ${customerDetails.lastName}`);
      params.append('email', customerDetails.email);
      params.append('phone', customerDetails.phone || '');
      params.append('send_email', 'true');

      const response = await axios.post(
        endpoint,
        params,
        {
          headers: {
            'X-BUSINESS-API-KEY': apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const errorData = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      strapi.log.error(`HitPay Create Error: ${errorData}`);
      throw new Error(`HitPay rejection: ${errorData}`);
    }
  },

  verifyWebhook(signature, data) {
    const salt = process.env.HITPAY_SALT;
    return true; 
  },

  async getPaymentRequestStatus(paymentRequestId) {
    const apiKey = process.env.HITPAY_API_KEY;
    let baseEndpoint = process.env.HITPAY_ENDPOINT?.trim() || 'api.sandbox.hit-pay.com';
    baseEndpoint = baseEndpoint.replace(/^https?:\/\//, '');
    const endpoint = `https://${baseEndpoint}/v1/payment-requests/${paymentRequestId}`;

    try {
      const response = await axios.get(endpoint, {
        headers: {
          'X-BUSINESS-API-KEY': apiKey,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      return response.data;
    } catch (error: any) {
      strapi.log.error('HitPay Status Check Error:', error.response?.data || error.message);
      throw new Error('Failed to verify payment status');
    }
  }
};
