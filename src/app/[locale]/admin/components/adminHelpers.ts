import { Pitch } from '@/types';

export function createDefaultPitchData(
  adminEmail: string,
  managerName?: string,
  adminPhone?: string
): Pitch {
  const defaultPitchId = `pitch_${Date.now()}`;
  return {
    id: defaultPitchId,
    name: 'ملعب أبطال العبور (El Obour Champions Arena)',
    locationName: 'مدينة العبور - الحي التاسع',
    mapLink: 'https://maps.google.com',
    imagePreviewUrl: '/pitch_preview.jpg',
    pricePerHour: 350,
    recipient: '01012345678',
    managerName: managerName || 'مدير الملعب',
    adminEmail,
    adminPhone: adminPhone || '01012345678',
    createdAt: Date.now(),
    capacity: '5v5',
    surfaceType: 'نجيل صناعي ممتاز',
    hasFloodlights: true,
    hasParking: true,
    hasCafeteria: true,
    rating: 4.9,
    reviewsCount: 142,
    city: 'obour',
  };
}
