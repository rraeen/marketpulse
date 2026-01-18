export default function RootLoading() {
  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="h-1 w-full bg-transparent">
        <div className="h-full w-1/3 bg-foreground/80 animate-pulse" />
      </div>
    </div>
  );
}
