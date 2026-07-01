export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-center px-4 pt-[25vh]">
      {children}
    </div>
  );
}
