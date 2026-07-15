const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const twilio = require("twilio");
const { DateTime } = require("luxon");

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
    const londonNow = DateTime.now().setZone("Europe/London");
    const todayKey = londonNow.toISODate();

    const plansSnapshot = await db
      .collection("safetyPlans")
      .where("escalationEnabled", "==", true)
      .get();

    if (plansSnapshot.empty) {
      console.log("No enabled Safety Plans found.");
      return;
    }

    const client = twilio(
      TWILIO_ACCOUNT_SID.value(),
      TWILIO_AUTH_TOKEN.value()
    );

    for (const planDoc of plansSnapshot.docs) {
      const plan = planDoc.data();

      // Ignore old duplicate Safety Plan documents.
      // The current Safety Plan document ID should match the user's UID.
      if (!plan.userId || planDoc.id !== plan.userId) {
        continue;
      }

      if (!plan.checkInTime) {
        console.log(`No check-in time saved for ${plan.userId}`);
        continue;
      }

      if (plan.lastEscalationDate === todayKey) {
        continue;
      }

      const timeParts = plan.checkInTime.split(":");
      const hour = Number(timeParts[0]);
      const minute = Number(timeParts[1]);

      if (
        !Number.isInteger(hour) ||
        !Number.isInteger(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      ) {
        console.error(
          `Invalid check-in time for ${plan.userId}: ${plan.checkInTime}`
        );
        continue;
      }

      const dailyCheckInTime = londonNow.startOf("day").set({
        hour,
        minute,
        second: 0,
        millisecond: 0,
      });

      const emergencyDueTime = dailyCheckInTime.plus({
        hours: 8,
      });

      if (londonNow < emergencyDueTime) {
        continue;
      }

      // Check whether this user has completed a check-in today.
      const checkInsSnapshot = await db
        .collection("checkIns")
        .where("userId", "==", plan.userId)
        .get();

      const startOfTodayMs = londonNow
        .startOf("day")
        .toUTC()
        .toMillis();

      const endOfTodayMs = londonNow
        .endOf("day")
        .toUTC()
        .toMillis();

      const checkedInToday = checkInsSnapshot.docs.some(
        (checkInDoc) => {
          const checkedInAt =
            checkInDoc.data().checkedInAt;

          if (!checkedInAt?.toMillis) {
            return false;
          }

          const checkedInAtMs = checkedInAt.toMillis();

          return (
            checkedInAtMs >= startOfTodayMs &&
            checkedInAtMs <= endOfTodayMs
          );
        }
      );

      if (checkedInToday) {
        console.log(
          `No escalation needed: ${plan.userId} checked in today.`
        );
        continue;
      }

      const firstChild = plan.children?.[0];
      const savedContactPhone =
        plan.contactPhone?.trim();

      if (
        !plan.parentName ||
        !plan.contactName ||
        !firstChild?.name ||
        !savedContactPhone
      ) {
        console.error(
          `Required Safety Plan information is missing for ${plan.userId}`
        );
        continue;
      }

      const trustedContactNumber =
        savedContactPhone.startsWith("0")
          ? `+44${savedContactPhone.slice(1)}`
          : savedContactPhone;

      // Claim this escalation so overlapping scheduler runs
      // do not both send the same SMS.
      const claimed = await db.runTransaction(
        async (transaction) => {
          const latestSnapshot =
            await transaction.get(planDoc.ref);

          if (!latestSnapshot.exists) {
            return false;
          }

          const latestPlan = latestSnapshot.data();

          if (
            latestPlan.lastEscalationDate === todayKey
          ) {
            return false;
          }

          const processingStartedMs = Date.parse(
            latestPlan.escalationProcessingAt || ""
          );

          const processingLockIsActive =
            latestPlan.escalationProcessingDate ===
              todayKey &&
            Number.isFinite(processingStartedMs) &&
            Date.now() - processingStartedMs <
              10 * 60 * 1000;

          if (processingLockIsActive) {
            return false;
          }

          transaction.update(planDoc.ref, {
            escalationProcessingDate: todayKey,
            escalationProcessingAt:
              new Date().toISOString(),
          });

          return true;
        }
      );

      if (!claimed) {
        continue;
      }

      try {
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
          lastEscalationDate: todayKey,
          lastEscalationAt:
            new Date().toISOString(),
          lastEscalationMessageSid: message.sid,
          escalationProcessingDate: null,
          escalationProcessingAt: null,
          escalationError: null,
        });

        console.log(
          `Automatic escalation sent for ${plan.userId}`
        );
      } catch (error) {
        await planDoc.ref.update({
          escalationProcessingDate: null,
          escalationProcessingAt: null,
          escalationError: error.message,
          escalationErrorAt:
            new Date().toISOString(),
        });

        console.error(
          `Automatic escalation failed for ${plan.userId}:`,
          error
        );
      }
    }
  }
);