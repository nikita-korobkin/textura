export default function DictionaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="h-dvh overflow-y-auto">{children}</main>;
}
