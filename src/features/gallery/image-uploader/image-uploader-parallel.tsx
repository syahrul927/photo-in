"use client";

import type React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "@tanstack/react-query";
import { getSession } from "next-auth/react";
import { CURRENT_WORKSPACE } from "@/lib/workspace-utils";

// Form schema
const formSchema = z.object({
  images: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type ParallelUploadResponseType = {
  message?: string;
  uploaded?: Array<{
    id: string;
    name: string;
  }>;
  totalFiles?: number;
  successfulUploads?: number;
  failedUploads?: number;
  warning?: string;
};

const getHeader = async () => {
  const headers = new Headers();
  let currentWorkspace = localStorage.getItem(CURRENT_WORKSPACE);
  if (!currentWorkspace) {
    const session = await getSession();
    currentWorkspace = session?.user.workspaces?.[0]?.keyWorkspace ?? "";
    localStorage.setItem(CURRENT_WORKSPACE, currentWorkspace);
  }
  headers.set(CURRENT_WORKSPACE, currentWorkspace);
  return headers;
};

async function uploadFilesParallel(formData: FormData) {
  const response = await fetch("/api/upload/parallel", {
    method: "POST",
    body: formData,
    headers: await getHeader(),
  });

  if (!response.ok) {
    const error = (await response.json()) as ParallelUploadResponseType;
    throw new Error(error?.message || "Upload failed");
  }

  return response.json() as ParallelUploadResponseType;
}

interface ImageUploaderProps {
  eventId: string;
}

export function ImageUploaderParallel(props: ImageUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadStats, setUploadStats] = useState<{
    total: number;
    successful: number;
    failed: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: uploadMutation } = useMutation({
    mutationFn: uploadFilesParallel,
  });

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: undefined,
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);

      // Set form value
      form.setValue("images", filesArray);

      // Generate previews
      filesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPreviews((prev) => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviews(previews.filter((_, i) => i !== index));
    form.setValue("images", updatedFiles.length > 0 ? updatedFiles : undefined);
  };

  const onSubmit = async (_values: FormValues) => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadComplete(false);
    setUploadProgress(0);
    setUploadStats(null);

    try {
      // Create FormData with all files at once
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("eventId", props.eventId);

      // Simulate progress during upload (since we can't track real progress easily)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadMutation(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadStats({
        total: result.totalFiles || selectedFiles.length,
        successful: result.successfulUploads || 0,
        failed: result.failedUploads || 0,
      });

      setUploadComplete(true);
      
      // Reset form after successful upload
      setTimeout(() => {
        setSelectedFiles([]);
        setPreviews([]);
        form.reset();
        setUploadProgress(0);
        setUploadComplete(false);
        setUploadStats(null);
      }, 3000);

    } catch (error) {
      console.error("Upload failed:", error);
      setUploadProgress(0);
      // Handle error - you might want to show a toast or error message
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-md space-y-6 p-6"
      >
        <FormField
          control={form.control}
          name="images"
          render={({ field: _field }) => (
            <FormItem>
              <div
                className={`rounded-lg border-2 border-dashed p-8 transition-all cursor-pointer ${
                  selectedFiles.length > 0
                    ? "border-gray-300 bg-gray-50"
                    : "border-gray-200"
                } hover:border-primary/50 hover:bg-gray-50`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length > 0) {
                    const imageFiles = files.filter(file => file.type.startsWith('image/'));
                    if (imageFiles.length > 0) {
                      setSelectedFiles((prev) => [...prev, ...imageFiles]);
                      form.setValue("images", imageFiles);
                      
                      // Generate previews
                      imageFiles.forEach((file) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          if (e.target?.result) {
                            setPreviews((prev) => [...prev, e.target!.result as string]);
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }
                  }
                }}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <AnimatePresence mode="wait">
                    {selectedFiles.length === 0 ? (
                      <motion.div
                        key="upload-icon"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center"
                      >
                        <div className="bg-primary/10 mb-4 rounded-full p-3">
                          <Upload className="text-primary h-8 w-8" />
                        </div>
                        <FormLabel className="text-lg font-medium">
                          Drag files to upload
                        </FormLabel>
                        <p className="mt-1 text-sm text-gray-500">
                          or click to browse (supports multiple files)
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="file-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {selectedFiles.length} file(s) selected
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                          >
                            Add More
                          </Button>
                        </div>

                        <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto">
                          {previews.map((preview, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="group relative aspect-square overflow-hidden rounded-lg border"
                            >
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {selectedFiles.length === 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="mt-4"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Choose Images
                    </Button>
                  )}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Upload Progress */}
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span>Uploading files...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </motion.div>
        )}

        {/* Upload Stats */}
        {uploadStats && uploadComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-green-50 p-4 text-sm"
          >
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Upload Complete!</span>
            </div>
            <div className="mt-2 text-green-700">
              <p>Total files: {uploadStats.total}</p>
              <p>Successful: {uploadStats.successful}</p>
              {uploadStats.failed > 0 && (
                <p className="text-orange-600">Failed: {uploadStats.failed}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={selectedFiles.length === 0 || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading {selectedFiles.length} files...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload {selectedFiles.length > 0 ? `${selectedFiles.length} ` : ""}Images
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}