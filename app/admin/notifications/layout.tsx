import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications - Admin ADS',
  description: 'Gérez les notifications de votre plateforme e-commerce ADS',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
