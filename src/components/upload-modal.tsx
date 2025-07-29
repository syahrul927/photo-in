"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { getSession } from "next-auth/react";
import { CURRENT_WORKSPACE } from "@/lib/workspace-utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onUploadComplete?: () => void;
}

interface SelectedFile {
  file: File;
  preview: string;
  id: string;
}

interface ChunkProgress {
  chunkIndex: number;
  totalChunks: number;
  filesInChunk: number;
  status: "pending" | "uploading" | "completed" | "error";
  toastId?: string | number;
  retryCount: number;
}

export function UploadModal({
  isOpen,
  onClose,
  eventId,
  onUploadComplete,
}: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    totalFiles: number;
    completedFiles: number;
    currentChunk: number;
    totalChunks: number;
  }>({ totalFiles: 0, completedFiles: 0, currentChunk: 0, totalChunks: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chunking configuration
  const MAX_SIZE_PER_CHUNK = 3 * 1024 * 1024; // 3MB per chunk (primary constraint)
  const MAX_FILES_PER_CHUNK = 50; // Fallback limit to prevent too many files in one request
  const MAX_RETRIES = 3;

  // Utility function to create smart chunks based primarily on file size
  const createSmartChunks = (files: File[]) => {
    const chunks: File[][] = [];
    let currentChunk: File[] = [];
    let currentSize = 0;

    for (const file of files) {
      // Check if adding this file would exceed the size limit
      const wouldExceedSize = currentSize + file.size > MAX_SIZE_PER_CHUNK;
      const wouldExceedCount = currentChunk.length >= MAX_FILES_PER_CHUNK;
      
      // If we have files in current chunk and adding this file would exceed limits
      if ((wouldExceedSize || wouldExceedCount) && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [file];
        currentSize = file.size;
        
        // Warn if single file is too large
        if (file.size > MAX_SIZE_PER_CHUNK) {
          console.warn(`File ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds chunk size limit`);
        }
      } else {
        currentChunk.push(file);
        currentSize += file.size;
      }
    }

    // Add the last chunk if it has files
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    // Log chunking info for debugging
    console.log(`Created ${chunks.length} chunks:`, chunks.map((chunk, i) => ({
      chunk: i + 1,
      files: chunk.length,
      sizeMB: (chunk.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(1)
    })));

    return chunks;
  };

  // Upload a single chunk of files
  const uploadChunk = async (
    chunk: File[],
    chunkIndex: number,
    totalChunks: number,
  ): Promise<boolean> => {
    const chunkToast = toast.loading(
      `Uploading batch ${chunkIndex + 1} of ${totalChunks}`,
      {
        description: `${chunk.length} photos in this batch`,
        duration: Infinity,
      },
    );

    try {
      // Get workspace header
      const headers = new Headers();
      let currentWorkspace = localStorage.getItem(CURRENT_WORKSPACE);
      if (!currentWorkspace) {
        const session = await getSession();
        currentWorkspace = session?.user.workspaces?.[0]?.keyWorkspace ?? "";
        localStorage.setItem(CURRENT_WORKSPACE, currentWorkspace);
      }
      headers.set(CURRENT_WORKSPACE, currentWorkspace);

      const formData = new FormData();
      chunk.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("eventId", eventId);

      const response = await fetch("/api/upload/parallel", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Batch ${chunkIndex + 1} upload failed`);
      }

      const result = await response.json();

      // Dismiss chunk toast and show success
      toast.dismiss(chunkToast);
      toast.success(`Batch ${chunkIndex + 1} completed!`, {
        description: `${chunk.length} photos uploaded successfully`,
      });

      return true;
    } catch (error) {
      toast.dismiss(chunkToast);
      console.error(`Batch ${chunkIndex + 1} error:`, error);
      toast.error(`Batch ${chunkIndex + 1} failed`, {
        description: `Failed to upload ${chunk.length} photos. Will retry if possible.`,
      });
      return false;
    }
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      // Get workspace header
      const headers = new Headers();
      let currentWorkspace = localStorage.getItem(CURRENT_WORKSPACE);
      if (!currentWorkspace) {
        const session = await getSession();
        currentWorkspace = session?.user.workspaces?.[0]?.keyWorkspace ?? "";
        localStorage.setItem(CURRENT_WORKSPACE, currentWorkspace);
      }
      headers.set(CURRENT_WORKSPACE, currentWorkspace);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("eventId", eventId);

      const response = await fetch("/api/upload/parallel", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      toast.error("Only image files are allowed");
    }

    const newSelectedFiles: SelectedFile[] = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setSelectedFiles((prev) => [...prev, ...newSelectedFiles]);
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    // Close modal immediately
    handleClose();

    const files = selectedFiles.map((sf) => sf.file);
    const chunks = createSmartChunks(files);

    console.log(`Uploading ${files.length} files in ${chunks.length} chunks`);

    // Show initial upload toast
    const mainToast = toast.loading(
      `Starting upload of ${files.length} photos...`,
      {
        description: `Split into ${chunks.length} batches for optimal performance`,
        duration: Infinity,
      },
    );

    let completedFiles = 0;
    const failedChunks: number[] = [];

    try {
      // Upload chunks sequentially to avoid overwhelming the server
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i] ?? [];
        console.log(
          `Uploading chunk ${i + 1}/${chunks.length} with ${chunk.length} files`,
        );

        const success = await uploadChunk(chunk, i, chunks.length);

        if (success) {
          completedFiles += chunk.length;

          // Update main progress toast
          toast.dismiss(mainToast);
          if (i < chunks.length - 1) {
            toast.loading(
              `Progress: ${completedFiles}/${files.length} photos uploaded`,
              {
                description: `Batch ${i + 2} of ${chunks.length} starting...`,
                duration: Infinity,
              },
            );
          }
        } else {
          failedChunks.push(i);
        }
      }

      // Dismiss main toast
      toast.dismiss(mainToast);

      // Show final results
      if (failedChunks.length === 0) {
        toast.success(`All ${files.length} photos uploaded successfully!`, {
          description: "Your photos are now available in the gallery",
        });
      } else {
        const failedFiles = failedChunks.reduce(
          (total, chunkIndex) => total + (chunks[chunkIndex]?.length ?? 0),
          0,
        );
        toast.warning(`Upload completed with some issues`, {
          description: `${completedFiles} photos uploaded, ${failedFiles} failed. You can retry the failed ones.`,
        });
      }

      // Call upload complete callback
      onUploadComplete?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast.dismiss(mainToast);

      toast.error("Upload failed", {
        description: "Please try again. Check your internet connection.",
      });
    }
  };

  const handleClose = () => {
    // Clean up object URLs
    selectedFiles.forEach((file) => {
      URL.revokeObjectURL(file.preview);
    });

    setSelectedFiles([]);
    setIsUploading(false);
    onClose();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      toast.error("Only image files are allowed");
    }

    const newSelectedFiles: SelectedFile[] = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setSelectedFiles((prev) => [...prev, ...newSelectedFiles]);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Upload Photos</DialogTitle>
          <DialogDescription>
            Select images to upload to this event. You can drag and drop files
            or click to browse.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Selection Area */}
          <div
            className="border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <ImagePlus className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="mb-2 text-lg font-medium">Choose images to upload</p>
            <p className="text-muted-foreground text-sm">
              Drag and drop images here, or click to browse
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">
                Selected Images ({selectedFiles.length})
              </h3>
              <div className="grid max-h-60 grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3 lg:grid-cols-4">
                <AnimatePresence>
                  {selectedFiles.map((selectedFile) => (
                    <motion.div
                      key={selectedFile.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="group relative"
                    >
                      <div className="bg-muted aspect-square overflow-hidden rounded-lg">
                        <img
                          src={selectedFile.preview}
                          alt={selectedFile.file.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Remove button */}
                      {!isUploading && (
                        <button
                          onClick={() => removeFile(selectedFile.id)}
                          className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}

                      <p className="mt-1 truncate text-center text-xs">
                        {selectedFile.file.name}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload {selectedFiles.length} photos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
