import { UserProfileView } from './UserProfileView';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  const params: { locale: string; username: string }[] = [];
  routing.locales.forEach((locale) => {
    params.push({ locale, username: 'player' });
  });
  return params;
}

export default async function UserPublicProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { username } = await params;
  return <UserProfileView username={username} />;
}
