export default function DictionaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex-1 overflow-y-auto">{children}</div>;
}
