import { db } from '@/lib/firebase/config';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { z } from 'zod';

export const priorityAccessSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name is too short').max(64).optional(),
  phone: z.string().max(20).optional(),
  tier: z.enum(['pro', 'vip']),
  cycle: z.enum(['monthly', 'annual', 'quarterly']).default('monthly'),
});

export type PriorityAccessInput = z.infer<typeof priorityAccessSchema>;

export interface PriorityAccessEntry extends PriorityAccessInput {
  id?: string;
  createdAt: number;
  source: string;
  status: 'pending' | 'notified';
}

/**
 * Saves a user to the Priority Access / Waitlist for instant card checkout.
 */
export async function joinPriorityAccess(
  input: PriorityAccessInput
): Promise<{ success: boolean; message: string; alreadyJoined?: boolean }> {
  const validated = priorityAccessSchema.parse(input);

  try {
    // Check if email already joined
    const q = query(
      collection(db, 'priority_access'),
      where('email', '==', validated.email.toLowerCase().trim()),
      where('tier', '==', validated.tier)
    );
    const existing = await getDocs(q);

    if (!existing.empty) {
      return {
        success: true,
        alreadyJoined: true,
        message: 'Already on priority access list',
      };
    }

    await addDoc(collection(db, 'priority_access'), {
      email: validated.email.toLowerCase().trim(),
      name: validated.name || '',
      phone: validated.phone || '',
      tier: validated.tier,
      cycle: validated.cycle,
      status: 'pending',
      createdAt: Date.now(),
      source: 'web_pricing_page',
    });

    return {
      success: true,
      message: 'Successfully joined priority access',
    };
  } catch (error) {
    console.warn('Firestore priority access save error, using local fallback:', error);
    // Local fallback for offline mode
    const cached = JSON.parse(localStorage.getItem('egfootball5_priority_waitlist') || '[]');
    cached.push({ ...validated, createdAt: Date.now() });
    localStorage.setItem('egfootball5_priority_waitlist', JSON.stringify(cached));

    return {
      success: true,
      message: 'Joined priority access (offline mode)',
    };
  }
}
