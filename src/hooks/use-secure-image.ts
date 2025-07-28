import { useState, useEffect } from "react";
import { api } from "@/trpc/react";

export function useSecureImage(fileId: string | null) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("useSecureImage called with fileId:", fileId);

  const {
    data,
    isLoading: queryLoading,
    error: queryError,
  } = api.event.getSecureImageUrl.useQuery(fileId!, {
    enabled: !!fileId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  useEffect(() => {
    console.log("useSecureImage effect:", {
      fileId,
      queryLoading,
      data: !!data,
      queryError: !!queryError,
    });

    setIsLoading(queryLoading);

    if (data?.dataUrl) {
      console.log(
        "Got data URL for fileId:",
        fileId,
        "length:",
        data.dataUrl.length,
      );
      setDataUrl(data.dataUrl);
      setError(null);
    } else if (queryError) {
      console.error("Query error for fileId:", fileId, queryError.message);
      setError(queryError.message);
      setDataUrl(null);
    }
  }, [data, queryError, queryLoading, fileId]);

  return {
    dataUrl,
    isLoading,
    error,
    fileName: data?.fileName,
    mimeType: data?.mimeType,
  };
}
