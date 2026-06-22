import { Logo } from '@/components/logo';
import { SearchBox } from '@/components/searchbox';

export default function Home() {
  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-3">
      <Logo />
      <SearchBox />
    </div>
  );
}
