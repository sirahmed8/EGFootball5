import { doc, getDoc, runTransaction, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from './firebase/config';
import { User as AppUser } from '@/types';

export interface UsernameValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates username string format (3-20 characters, alphanumeric & underscores only).
 */
export function validateUsernameFormat(username: string): UsernameValidationResult {
  const clean = username.trim();
  if (!clean) {
    return { valid: false, error: 'Username is required' };
  }
  if (clean.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  if (clean.length > 20) {
    return { valid: false, error: 'Username must not exceed 20 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
    return { valid: false, error: 'Only letters, numbers, and underscores are allowed' };
  }
  return { valid: true };
}

/**
 * Normalizes username to lowercase for Firestore index queries.
 */
export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase().replace(/^@/, '');
}

/**
 * Checks whether a given username is available in Firestore.
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const normalized = normalizeUsername(username);
  const valResult = validateUsernameFormat(normalized);
  if (!valResult.valid) return false;

  try {
    const docRef = doc(db, 'usernames', normalized);
    const snap = await getDoc(docRef);
    return !snap.exists();
  } catch (err) {
    console.error('Error checking username availability:', err);
    return false;
  }
}

/**
 * Generates smart username suggestions from name or email.
 */
export function generateSuggestedUsernames(name: string, email?: string): string[] {
  const suggestions: string[] = [];
  const baseName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (baseName.length >= 3) {
    const cleanBase = baseName.slice(0, 15);
    suggestions.push(cleanBase);
    suggestions.push(`${cleanBase}_${Math.floor(10 + Math.random() * 90)}`);
    suggestions.push(`${cleanBase}7`);
  }

  if (email && email.includes('@')) {
    const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (emailPrefix.length >= 3 && !suggestions.includes(emailPrefix)) {
      suggestions.push(emailPrefix.slice(0, 16));
    }
  }

  if (suggestions.length === 0) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    suggestions.push(`player_${randomNum}`);
  }

  return Array.from(new Set(suggestions)).slice(0, 3);
}

/**
 * Atomically claims a unique username for a user.
 */
export async function claimUsername(uid: string, rawUsername: string): Promise<{ success: boolean; username: string }> {
  const formatted = rawUsername.trim().replace(/^@/, '');
  const validation = validateUsernameFormat(formatted);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid username');
  }

  const usernameLower = normalizeUsername(formatted);
  const usernameRef = doc(db, 'usernames', usernameLower);
  const userRef = doc(db, 'users', uid);

  await runTransaction(db, async (transaction) => {
    // 1. Read existing user document
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error('User profile not found');
    }

    const currentData = userSnap.data();
    const oldUsernameLower = currentData?.usernameLower;

    // 2. Read target username document
    const usernameSnap = await transaction.get(usernameRef);
    if (usernameSnap.exists() && usernameSnap.data()?.uid !== uid) {
      throw new Error('ERROR_USERNAME_TAKEN');
    }

    // 3. Delete old username doc if user is changing handle
    if (oldUsernameLower && oldUsernameLower !== usernameLower) {
      const oldDocRef = doc(db, 'usernames', oldUsernameLower);
      transaction.delete(oldDocRef);
    }

    // 4. Reserve new username doc
    transaction.set(usernameRef, {
      uid,
      username: formatted,
      claimedAt: Date.now(),
    });

    // 5. Update user profile
    transaction.update(userRef, {
      username: formatted,
      usernameLower,
      updatedAt: Date.now(),
    });
  });

  return { success: true, username: formatted };
}

/**
 * Searches users by username or name.
 */
export async function searchUsers(searchTerm: string): Promise<AppUser[]> {
  const queryStr = searchTerm.trim().toLowerCase().replace(/^@/, '');
  if (!queryStr) return [];

  try {
    const usersRef = collection(db, 'users');
    const qByUsername = query(
      usersRef,
      where('usernameLower', '>=', queryStr),
      where('usernameLower', '<=', queryStr + '\uf8ff'),
      limit(10)
    );

    const snap = await getDocs(qByUsername);
    const results: AppUser[] = [];
    snap.forEach((doc) => {
      results.push(doc.data() as AppUser);
    });

    return results;
  } catch (err) {
    console.error('Error searching users:', err);
    return [];
  }
}

/**
 * Fetches a user document by their exact handle.
 */
export async function getUserByUsername(username: string): Promise<AppUser | null> {
  const normalized = normalizeUsername(username);
  if (!normalized) return null;

  try {
    const usernameSnap = await getDoc(doc(db, 'usernames', normalized));
    if (!usernameSnap.exists()) return null;

    const uid = usernameSnap.data()?.uid;
    if (!uid) return null;

    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) return null;

    return userSnap.data() as AppUser;
  } catch (err) {
    console.error('Error fetching user by username:', err);
    return null;
  }
}
