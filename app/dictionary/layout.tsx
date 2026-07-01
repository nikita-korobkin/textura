export default function DictionaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="overflow-y-auto">{children}</div>;
}
