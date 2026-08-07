import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Helper: generate blocks for a given start slot and duration
function getBlocks(startSlot: number, durationHours: number): number[] {
  const numBlocks = durationHours * 2;
  return Array.from({ length: numBlocks }, (_, i) => startSlot + (i * 0.5));
}

export const lockSlot = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }

  const { pitchId, date, startSlot, durationHours, totalAmount, depositAmount, bookingType, numPeople, discountAmount = 0 } = data;
  const uid = context.auth.uid;

  if (startSlot < 0 || startSlot >= 24 || durationHours <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid slot time.');
  }

  const bookingId = require('crypto').randomUUID();
  const scheduleRef = db.collection('day_schedules').doc(`${pitchId}_${date}`);
  const userRef = db.collection('users').doc(uid);
  const pitchRef = db.collection('pitches').doc(pitchId);

  const blocks = getBlocks(startSlot, durationHours);
  const endSlot = blocks[blocks.length - 1];

  try {
    await db.runTransaction(async (transaction) => {
      // 1. Check blacklist
      const userDoc = await transaction.get(userRef);
      if (userDoc.exists && userDoc.data()?.isBlacklisted) {
        throw new functions.https.HttpsError('permission-denied', 'User is blacklisted.');
      }
      const userData = userDoc.data();

      // 2. Fetch Pitch
      const pitchDoc = await transaction.get(pitchRef);
      if (!pitchDoc.exists) throw new functions.https.HttpsError('not-found', 'Pitch not found.');
      const pitchName = pitchDoc.data()?.name || '';

      const scheduleSnap = await transaction.get(scheduleRef);
      let bookedSlots: any = {};
      if (scheduleSnap.exists) {
        bookedSlots = scheduleSnap.data()?.slots || {};
      }

      const now = Date.now();
      
      // Memory cleanup for expired slots
      for (const key in bookedSlots) {
        const slot = bookedSlots[key];
        if (slot.status === 'locked_temporary' && slot.lockedUntil && slot.lockedUntil < now) {
          delete bookedSlots[key];
        }
      }

      // Check Availability
      for (const block of blocks) {
        if (bookedSlots[block.toString()]) {
          throw new functions.https.HttpsError('failed-precondition', 'Slot is taken.');
        }
      }

      // Anti-Gap Logic
      const beforeSlot = startSlot - 0.5;
      if (beforeSlot >= 0 && !bookedSlots[beforeSlot.toString()]) {
        const twoBeforeSlot = startSlot - 1.0;
        if (beforeSlot === 0 || bookedSlots[twoBeforeSlot.toString()]) {
          throw new functions.https.HttpsError('failed-precondition', 'Cannot leave a 30-min gap before booking.');
        }
      }

      const afterSlot = endSlot + 0.5;
      if (afterSlot < 24 && !bookedSlots[afterSlot.toString()]) {
        const twoAfterSlot = endSlot + 1.0;
        if (afterSlot === 23.5 || bookedSlots[twoAfterSlot.toString()]) {
          throw new functions.https.HttpsError('failed-precondition', 'Cannot leave a 30-min gap after booking.');
        }
      }

      // Create Booking object
      const newBookingRef = db.collection('bookings').doc(bookingId);
      const bookingDoc = {
        id: bookingId,
        userId: uid,
        userName: userData?.name || 'Unknown',
        userPhone: userData?.phone || '',
        pitchId,
        pitchName,
        date,
        timeSlot: startSlot,
        duration: durationHours,
        totalAmount,
        depositAmount,
        discountAmount,
        status: 'locked_temporary',
        bookingType,
        numPeople,
        lockedUntil: now + 10 * 60 * 1000,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      transaction.set(newBookingRef, bookingDoc);

      // Lock slots
      for (const block of blocks) {
        bookedSlots[block.toString()] = {
          bookingId,
          status: 'locked_temporary',
          lockedUntil: now + 10 * 60 * 1000,
          userId: uid
        };
      }
      transaction.set(scheduleRef, { slots: bookedSlots }, { merge: true });
    });
    return { bookingId };
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', error.message || 'Booking failed');
  }
});

// 2. Verify Match Result (Callable)
export const verifyMatchResult = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be logged in to verify matches."
    );
  }

  const { matchId, teamAScore, teamBScore, mvpUid, varHighlightId } = data;
  const callerUid = context.auth.uid;

  if (!matchId || typeof teamAScore !== 'number' || typeof teamBScore !== 'number') {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required match fields."
    );
  }

  const callerRef = db.collection("users").doc(callerUid);
  const matchRef = db.collection("bookings").doc(matchId);

  try {
    await db.runTransaction(async (transaction) => {
      // 1. Validate caller is admin/owner
      const callerDoc = await transaction.get(callerRef);
      const callerRole = callerDoc.data()?.role;
      if (callerRole !== "admin" && callerRole !== "owner") {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Only admins or owners can verify match results."
        );
      }

      // 2. Check match exists and is not already verified
      const matchDoc = await transaction.get(matchRef);
      if (!matchDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Match not found.");
      }
      if (matchDoc.data()?.matchResult?.isVerified) {
        throw new functions.https.HttpsError("failed-precondition", "Match is already verified.");
      }

      const joinedPlayers = matchDoc.data()?.joinedPlayers || [];

      // 3. Mark match as verified
      transaction.update(matchRef, {
        matchResult: {
          teamAScore,
          teamBScore,
          mvpUid: mvpUid || null,
          varHighlightId: varHighlightId || null,
          isVerified: true,
        },
        status: "completed"
      });

      // 4. Update stats for joined players
      for (const player of joinedPlayers) {
        if (!player.uid) continue;
        const userRef = db.collection("users").doc(player.uid);
        
        let ratingInc = 3; // +3 for playing
        let mvpBadgesInc = 0;

        if (player.uid === mvpUid) {
          ratingInc = 10; // +10 for MVP
          mvpBadgesInc = 1;
        }

        const updateData: any = {
          matchesPlayed: admin.firestore.FieldValue.increment(1),
          rating: admin.firestore.FieldValue.increment(ratingInc),
        };

        if (mvpBadgesInc > 0) {
          updateData.mvpBadges = admin.firestore.FieldValue.increment(mvpBadgesInc);
        }

        transaction.update(userRef, updateData);
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Match verification failed:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", error.message);
  }
});
