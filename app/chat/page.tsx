import type { Metadata } from 'next';

import { Chat } from '@/components/chat';

export const metadata: Metadata = {
  title: 'Chat',
};

export default function ChatPage() {
  return <Chat />;
}
