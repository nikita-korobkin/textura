export default function DictionaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-svh max-w-2xl px-4 py-26">{children}</div>
  );
}
