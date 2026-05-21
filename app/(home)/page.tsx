import { Logo } from '@/components/logo';
import { Omnibox } from '@/components/omnibox';

export default function Home() {
  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-3">
      <Logo />
      <Omnibox />
    </div>
  );
}
