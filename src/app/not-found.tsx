import Link from "next/link";
import { Camera, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-md space-y-8 text-center">
        {/* Camera icon with film frame */}
        <div className="relative mx-auto mb-6 h-32 w-32">
          <div className="absolute inset-0 rotate-6 rounded-lg border-4 border-foreground/20"></div>
          <div className="absolute inset-0 -rotate-6 rounded-lg border-4 border-foreground/40"></div>
          <div className="relative flex h-full w-full items-center justify-center rounded-lg border-2 border-foreground/60 bg-background">
            <Camera className="h-16 w-16" />
          </div>
        </div>

        {/* 404 message */}
        <h1 className="text-5xl font-bold tracking-tight">404</h1>
        <h2 className="text-2xl font-medium text-foreground/80">
          Page Not Found
        </h2>

        <p className="mt-4">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Gallery
            </Link>
          </Button>
        </div>
      </div>

      {/* Background decoration - subtle grid pattern */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[length:24px_24px]"></div>
    </div>
  );
}
