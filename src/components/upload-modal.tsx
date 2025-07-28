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

export function UploadModal({
  isOpen,
  onClose,
  eventId,
  onUploadComplete,
}: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Show initial upload toast
    console.log("Showing loading toast");
    const uploadToast = toast.loading(
      `Uploading ${selectedFiles.length} photos...`,
      {
        description: "Please wait while we upload your photos",
        duration: Infinity,
      },
    );
    console.log("Loading toast ID:", uploadToast);

    try {
      console.log(
        "Starting upload for files:",
        selectedFiles.map((f) => f.file.name),
      );
      await uploadMutation.mutateAsync(selectedFiles.map((sf) => sf.file));

      // Dismiss loading toast
      toast.dismiss(uploadToast);
      console.log("Dismissed loading toast");

      // Show individual success toasts for each file
      selectedFiles.forEach((selectedFile, index) => {
        setTimeout(() => {
          console.log(`Showing success toast for ${selectedFile.file.name}`);
          toast.success(`${selectedFile.file.name} uploaded!`, {
            description: "Photo uploaded successfully",
          });
        }, index * 200); // Stagger the success toasts
      });

      // Show overall success toast
      setTimeout(
        () => {
          console.log("Showing overall success toast");
          toast.success(
            `All ${selectedFiles.length} photos uploaded successfully!`,
            {
              description: "Your photos are now available in the gallery",
            },
          );
        },
        selectedFiles.length * 200 + 500,
      );

      // Call upload complete callback
      console.log("Calling onUploadComplete");
      onUploadComplete?.();
    } catch (error) {
      console.error("Upload error:", error);
      // Dismiss loading toast
      toast.dismiss(uploadToast);

      // Show error toast
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
