import { useState, useEffect } from "react";
import { api } from "@/trpc/react";

export function useSecureImage(fileId: string | null) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    isLoading: queryLoading,
    error: queryError,
  } = api.event.getSecureImageUrl.useQuery(fileId!, {
    enabled: !!fileId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    setIsLoading(queryLoading);

    if (data?.dataUrl) {
      setDataUrl(data.dataUrl);
      setError(null);
    } else if (queryError) {
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
