"use client";

import { ImagePlus } from "lucide-react";
import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

interface ImageWithFallbackProps extends ImageProps {
  src: string;
  alt: string;
  fallbackUrls?: string[];
}

export function ImageWithFallback({
  src,
  alt,
  fallbackUrls = [],
  ...props
}: ImageWithFallbackProps) {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Create array of all possible sources
  const allSources = [src, ...fallbackUrls, "/placeholder.svg"].filter(Boolean);
  const currentSrc = allSources[currentSrcIndex] || "/placeholder.svg";

  useEffect(() => {
    // Reset states when src changes
    setCurrentSrcIndex(0);
    setIsLoading(true);
    setError(false);
  }, [src]);

  const handleError = () => {
    console.warn(`Failed to load image: ${currentSrc}`);

    // Try next fallback URL
    if (currentSrcIndex < allSources.length - 1) {
      setCurrentSrcIndex((prev) => prev + 1);
      setIsLoading(true);
      setError(false);
    } else {
      // All sources failed
      setError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    if (currentSrcIndex > 0) {
      console.log(
        `Image loaded successfully using fallback ${currentSrcIndex}: ${currentSrc}`,
      );
    }
  };

  return (
    <div className="relative h-full w-full">
      {isLoading && !error && (
        <div className="bg-muted absolute inset-0 animate-pulse" />
      )}
      {error ? (
        <div className="bg-muted absolute inset-0 flex items-center justify-center">
          <ImagePlus className="text-muted-foreground h-8 w-8" />
        </div>
      ) : (
        <Image
          src={currentSrc}
          alt={alt}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
      )}
    </div>
  );
}
