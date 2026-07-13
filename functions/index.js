const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const twilio = require("twilio");

const TWILIO_ACCOUNT_SID = defineSecret("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = defineSecret("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = defineSecret("TWILIO_PHONE_NUMBER");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();

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

    const {
  to,
  parentName,
  childName,
  trustedContactName,
  emergencyPlan,
} = request.data;

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

Hi ${trustedContactName},

${parentName} has not completed today's check-in.

This could mean ${parentName} and ${childName} need your help.

Please try to contact ${parentName} first. If you cannot reach them, please go and check on ${parentName} and ${childName} as soon as possible.

Emergency Plan:
${emergencyPlan || 'No emergency instructions provided.'}

No emergency services have been contacted.

You are receiving this alert because you have been chosen as the trusted contact in ${parentName}'s Check My Child Safety Plan.

This is a TEST alert.`,
  from: TWILIO_PHONE_NUMBER.value(),
  to,
});

    return {
      success: true,
      messageSid: message.sid,
    };
  }
);
exports.sendEmergencySafetyPlanSms = onCall(
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
        "You must be logged in to trigger an emergency alert."
      );
    }

    const {
      to,
      parentName,
      childName,
      trustedContactName,
      emergencyPlan,
    } = request.data;

    if (
      !to ||
      !parentName ||
      !childName ||
      !trustedContactName
    ) {
      throw new HttpsError(
        "invalid-argument",
        "The trusted contact, parent, child, or phone number is missing."
      );
    }

    const client = twilio(
      TWILIO_ACCOUNT_SID.value(),
      TWILIO_AUTH_TOKEN.value()
    );

    const message = await client.messages.create({
      body: `Check My Child Alert.

Hi ${trustedContactName},

${parentName} has not completed today's check-in.

This could mean ${parentName} and ${childName} need your help.

Please try to contact ${parentName} first. If you cannot reach them, please go and check on ${parentName} and ${childName} as soon as possible.

Emergency Plan:
${emergencyPlan || "No emergency instructions provided."}

No emergency services have been contacted.

You are receiving this alert because you have been chosen as the trusted contact in ${parentName}'s Check My Child Safety Plan.`,
      from: TWILIO_PHONE_NUMBER.value(),
      to,
    });

    return {
      success: true,
      messageSid: message.sid,
    };
  }
);
exports.processAutomaticEscalations = onSchedule(
  {
    schedule: "* * * * *",
    timeZone: "Europe/London",
    secrets: [
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER,
    ],
  },
  async () => {
    const now = Date.now();

    const plansSnapshot = await db
      .collection("safetyPlans")
      .where("escalationEnabled", "==", true)
      .get();

    if (plansSnapshot.empty) {
      console.log("No enabled escalation tests.");
      return;
    }

    const client = twilio(
      TWILIO_ACCOUNT_SID.value(),
      TWILIO_AUTH_TOKEN.value()
    );

    for (const planDoc of plansSnapshot.docs) {
      const plan = planDoc.data();

      if (
        !plan.testEscalationDueAtMs ||
        plan.testEscalationDueAtMs > now ||
        plan.testEscalationSent === true
      ) {
        continue;
      }

      const checkInsSnapshot = await db
        .collection("checkIns")
        .where("userId", "==", plan.userId)
        .get();

      const checkedInAfterTestStarted =
        checkInsSnapshot.docs.some((checkInDoc) => {
          const checkedInAt = checkInDoc.data().checkedInAt;

          return (
            checkedInAt?.toMillis &&
            checkedInAt.toMillis() >= plan.testEscalationStartedAtMs
          );
        });

      if (checkedInAfterTestStarted) {
        await planDoc.ref.update({
          escalationEnabled: false,
          testEscalationCancelled: true,
          testEscalationCancelledAt: new Date().toISOString(),
        });

        console.log(`Escalation cancelled for ${plan.userId}`);
        continue;
      }

      const firstChild = plan.children?.[0];
      const savedContactPhone = plan.contactPhone?.trim();

      if (!firstChild || !savedContactPhone) {
        console.error(`Missing Safety Plan data for ${plan.userId}`);
        continue;
      }

      const trustedContactNumber = savedContactPhone.startsWith("0")
        ? `+44${savedContactPhone.slice(1)}`
        : savedContactPhone;

      try {
        await planDoc.ref.update({
          testEscalationSent: true,
          escalationProcessingAt: new Date().toISOString(),
        });

        const message = await client.messages.create({
          body: `Check My Child Alert.

Hi ${plan.contactName},

${plan.parentName} has not completed today's check-in.

This could mean ${plan.parentName} and ${firstChild.name} need your help.

Please try to contact ${plan.parentName} first. If you cannot reach them, please go and check on ${plan.parentName} and ${firstChild.name} as soon as possible.

Emergency Plan:
${firstChild.notes || "No emergency instructions provided."}

No emergency services have been contacted.

You are receiving this alert because you have been chosen as the trusted contact in ${plan.parentName}'s Check My Child Safety Plan.`,
          from: TWILIO_PHONE_NUMBER.value(),
          to: trustedContactNumber,
        });

        await planDoc.ref.update({
          escalationEnabled: false,
          testEscalationSent: true,
          testEscalationSentAt: new Date().toISOString(),
          testEscalationMessageSid: message.sid,
        });

        console.log(`Automatic escalation sent for ${plan.userId}`);
      } catch (error) {
        await planDoc.ref.update({
          testEscalationSent: false,
          escalationError: error.message,
          escalationErrorAt: new Date().toISOString(),
        });

        console.error(
          `Automatic escalation failed for ${plan.userId}:`,
          error
        );
      }
    }
  }
);