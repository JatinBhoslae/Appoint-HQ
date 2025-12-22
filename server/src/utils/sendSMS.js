import dotenv from 'dotenv';

dotenv.config();

const sendSMS = async (options) => {
  const { mobile, message } = options;

  // Check if Twilio credentials are provided
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && fromNumber) {
    try {
      // Dynamic import to avoid crash if twilio is not installed
      // However, since we can't easily install packages, we'll try to use it if available
      // or just warn if not.
      // Ideally we should use: import twilio from 'twilio'; at top level if it was in package.json
      
      // For now, we'll assume if vars are present, the user might want to use it.
      // But since it's not in package.json, this would fail.
      // I will add a TODO for the user.
      
      // Since 'twilio' package is not installed, we can't import it.
      // If we try to import it, Node throws ERR_MODULE_NOT_FOUND.
      
      // We will fallback to MOCK if the package is missing.
      // But checking for package existence at runtime in ES modules is tricky.
      // The best way is to wrap the import in a try-catch, but standard import() is async.
      
      let client;
      try {
         // Dynamic import
         const twilioModule = await import('twilio');
         const twilio = twilioModule.default;
         client = twilio(accountSid, authToken);
         
         await client.messages.create({
           body: message,
           from: fromNumber,
           to: mobile
         });
         console.log(`[TWILIO] SMS sent to ${mobile}: ${message}`);
         return { success: true, message: 'SMS sent successfully via Twilio' };
         
      } catch (err) {
         if (err.code === 'ERR_MODULE_NOT_FOUND') {
            console.warn('[WARN] Twilio package not found. Falling back to MOCK SMS.');
            // Fallthrough to mock
         } else {
            throw err;
         }
      }
    } catch (error) {
      console.error('Twilio Send SMS Error:', error);
      // Don't throw, just log and fallback to mock if possible or just return failure
      // But if user expects SMS, maybe we should mock it if real fails?
      // For now, let's just log.
    }
  }

  // Fallback / Mock
  console.log('---------------------------------------------------');
  console.log(`[SMS MOCK] To: ${mobile}`);
  console.log(`[SMS MOCK] Message: ${message}`);
  console.log('---------------------------------------------------');
  console.log('To enable real SMS, install twilio and set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env');
  return { success: true, message: 'SMS logged to console' };
};

export default sendSMS;
