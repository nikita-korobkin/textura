export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-dvh items-start justify-center px-4 pt-[25vh]">
      {children}
    </main>
  );
}
