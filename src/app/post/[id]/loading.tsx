import { Container } from "@/components/ui/container";

export default function PostLoading() {
  return (
    <div className="flex-1 py-12 md:py-16">
      <Container>
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-6 w-28 bg-muted rounded mb-4" />
          <div className="h-10 w-3/4 bg-muted rounded mb-4" />
          <div className="h-4 w-40 bg-muted rounded mb-8" />
          <div className="w-full aspect-[16/9] bg-muted rounded-lg mb-8" />
          <div className="space-y-4">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-11/12 bg-muted rounded" />
            <div className="h-4 w-10/12 bg-muted rounded" />
            <div className="h-4 w-9/12 bg-muted rounded" />
          </div>
        </div>
      </Container>
    </div>
  );
}
