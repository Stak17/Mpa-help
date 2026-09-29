import { PlanType, SubscriptionItem } from '@/types';
import { PLANS } from '@/config/plans';

export type PaymentMethod = 'momo_mtn' | 'airtel_money' | 'card';

export interface PaymentInitiationParams {
  userId: string;
  userEmail: string;
  phoneNumber?: string;
  plan: PlanType;
  method: PaymentMethod;
  amountUGX: number;
}

export interface PaymentInitiationResult {
  transactionId: string;
  paymentReference: string;
  status: 'pending' | 'requires_action' | 'failed' | 'completed';
  providerMessage: string;
  ussdPromptInfo?: string;
  instructions: string;
}

export interface IPaymentService {
  initiatePayment(params: PaymentInitiationParams): Promise<PaymentInitiationResult>;
  verifyPayment(transactionId: string): Promise<{ success: boolean; status: string; message: string }>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
}

/**
 * Concrete payment service abstraction.
 * Ready for MTN MoMo Open API, Airtel Money Africa, or Flutterwave / Pesapal.
 */
class PaymentServiceImpl implements IPaymentService {
  async initiatePayment(params: PaymentInitiationParams): Promise<PaymentInitiationResult> {
    const txId = 'mpa_' + Math.random().toString(36).substring(2, 10);
    const ref = 'UGX_' + params.amountUGX + '_' + Date.now();

    if (params.method === 'momo_mtn') {
      return {
        transactionId: txId,
        paymentReference: ref,
        status: 'pending',
        providerMessage: 'Prompt sent to MTN number',
        ussdPromptInfo: `A prompt of UGX ${params.amountUGX.toLocaleString()} has been sent to ${params.phoneNumber || 'your MTN MoMo number'}. Dial *165# to approve if no popup appears.`,
        instructions: 'Please enter your Mobile Money PIN on your phone to complete your Mpa Help subscription.',
      };
    }

    if (params.method === 'airtel_money') {
      return {
        transactionId: txId,
        paymentReference: ref,
        status: 'pending',
        providerMessage: 'Prompt sent to Airtel number',
        ussdPromptInfo: `A prompt of UGX ${params.amountUGX.toLocaleString()} has been sent to ${params.phoneNumber || 'your Airtel Money phone'}. Dial *185# to approve if no popup appears.`,
        instructions: 'Please approve the transaction on your handset using your Airtel Money PIN.',
      };
    }

    return {
      transactionId: txId,
      paymentReference: ref,
      status: 'pending',
      providerMessage: 'Redirecting to secure card checkout',
      instructions: 'Card authorization is in sandbox verification mode.',
    };
  }

  async verifyPayment(transactionId: string): Promise<{ success: boolean; status: string; message: string }> {
    // In production, this polls or calls webhook endpoint: /api/payments/webhook
    // For test sandbox verification:
    return {
      success: true,
      status: 'active',
      message: 'Payment verified successfully. Welcome to Mpa Plus/Business!',
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    console.log('Cancelling subscription via gateway:', subscriptionId);
    return true;
  }
}

export const PaymentService: IPaymentService = new PaymentServiceImpl();
