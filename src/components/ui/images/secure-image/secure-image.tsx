"use client";

import { useSecureImage } from "@/hooks/use-secure-image";
import { ImagePlus } from "lucide-react";
import Image, { type ImageProps } from "next/image";

interface SecureImageProps extends Omit<ImageProps, "src"> {
  fileId: string;
  alt: string;
}

export function SecureImage({ fileId, alt, ...props }: SecureImageProps) {
  const { dataUrl, isLoading, error } = useSecureImage(fileId);

  if (isLoading) {
    return (
      <div className="relative h-full w-full">
        <div className="bg-muted absolute inset-0 animate-pulse" />
      </div>
    );
  }

  if (error || !dataUrl) {
    return (
      <div className="relative h-full w-full">
        <div className="bg-muted absolute inset-0 flex items-center justify-center">
          <ImagePlus className="text-muted-foreground h-12 w-12" />
        </div>
      </div>
    );
  }

  return (
    <Image
      src={dataUrl}
      alt={alt}
      {...props}
    />
  );
}