const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const twilio = require("twilio");

const TWILIO_ACCOUNT_SID = defineSecret("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = defineSecret("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = defineSecret("TWILIO_PHONE_NUMBER");

exports.sendTestSafetyPlanSms = onCall(
  {
    secrets: [
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER,
    ],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to send a test alert."
      );
    }

    const { to, parentName, childName } = request.data;

    if (!to || !parentName || !childName) {
      throw new HttpsError(
        "invalid-argument",
        "Missing trusted contact phone number, parent name, or child name."
      );
    }

    const client = twilio(
      TWILIO_ACCOUNT_SID.value(),
      TWILIO_AUTH_TOKEN.value()
    );

    const message = await client.messages.create({
      body: `TEST Check My Child Alert.

${parentName} has not completed today's check-in.

This could mean ${childName} may need your help.

Please try to contact ${parentName} first. If you cannot reach them, follow the emergency plan they have shared with you.

This is a TEST alert. No emergency services have been contacted.`,
      from: TWILIO_PHONE_NUMBER.value(),
      to,
    });

    return {
      success: true,
      messageSid: message.sid,
    };
  }
);