export class WhatsAppService {
  private get token() {
    return process.env.WHATSAPP_ACCESS_TOKEN;
  }

  private get phoneNumberId() {
    return process.env.WHATSAPP_PHONE_NUMBER_ID;
  }

  private get templateName() {
    return process.env.WHATSAPP_OTP_TEMPLATE_NAME;
  }

  private isConfigured() {
    return !!this.token && !!this.phoneNumberId && !!this.templateName;
  }

  async sendOtp(phone: string, otp: string): Promise<{ success: boolean; error?: any }> {
    if (!this.isConfigured()) {
      console.warn('WhatsApp API not configured. Skipping WhatsApp OTP.');
      // Fallback for development if keys aren't set
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV OTP] Would have sent ${otp} to ${phone} via WhatsApp`);
        return { success: true };
      }
      return { success: false, error: 'WhatsApp keys are not configured on the server.' };
    }

    try {
      // Clean phone number: remove all non-digits, ensure it doesn't have leading + or 00
      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.startsWith('00')) cleanPhone = cleanPhone.substring(2);

      const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
      
      let lastError: any = null;

      // Try different English language codes since users often pick one randomly
      const languageCodes = ['en_US', 'en', 'en_GB'];

      for (const lang of languageCodes) {
        const payload = {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'template',
          template: {
            name: this.templateName,
            language: { code: lang },
            components: [
              {
                type: 'body',
                parameters: [{ type: 'text', text: otp }],
              },
              {
                type: 'button',
                sub_type: 'url',
                index: '0',
                parameters: [{ type: 'text', text: otp }],
              },
            ],
          },
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          return { success: true };
        }

        lastError = data?.error?.message;

        // If the error is about a missing component, try without the button component
        if (lastError && lastError.includes('component')) {
          console.warn(`Retrying ${lang} without button component...`);
          const fallbackPayload = {
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'template',
            template: {
              name: this.templateName,
              language: { code: lang },
              components: [
                {
                  type: 'body',
                  parameters: [{ type: 'text', text: otp }]
                }
              ]
            }
          };

          const fallbackResponse = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(fallbackPayload),
          });

          const fallbackData = await fallbackResponse.json();
          if (fallbackResponse.ok) {
            return { success: true };
          }
          lastError = fallbackData?.error?.message;
        }

        // If it's a translation/language error, the loop will continue to try the next language code.
        // If it's something else (like invalid number), we should probably break out early, but looping 3 times is harmless.
        if (lastError && !lastError.includes('translation')) {
          break; // Not a language issue, stop trying
        }
      }

      console.error('WhatsApp API Error:', lastError);
      return { success: false, error: lastError || 'WhatsApp API failed' };
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error);
      return { success: false, error: error.message || String(error) };
    }
  }
}

export const whatsappService = new WhatsAppService();
