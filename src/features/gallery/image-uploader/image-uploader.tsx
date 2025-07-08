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
type BulkUploadResponseType = {
  message?: string;
  file?: {
    id: string;
    name: string;
  };
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
async function uploadFiles(formData: FormData) {
  const response = await fetch("/api/upload/bulk", {
    method: "POST",
    body: formData,
    headers: await getHeader(),
  });

  if (!response.ok) {
    const error = (await response.json()) as BulkUploadResponseType;
    throw new Error(error?.message || "Upload failed");
  }

  return response.json() as BulkUploadResponseType;
}

interface ImageUploaderProps {
  eventId: string;
}

export function ImageUploader(props: ImageUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: uploadMutation } = useMutation({
    mutationFn: uploadFiles,
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

  const onSubmit = async (values: FormValues) => {
    setIsUploading(true);
    setUploadComplete(false);
    for (let index = 0; index < selectedFiles.length; index++) {
      setUploadProgress((index * 100) / selectedFiles.length);
      const file = selectedFiles[index];
      if (file) {
        const formData = new FormData();
        formData.append("images", file);
        formData.append("eventId", props.eventId);
        await uploadMutation(formData);
      }
    }
    setIsUploading(false);
    setUploadComplete(true);
  };
  const testing = async () => {};

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-md space-y-6 p-6"
      >
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <div
                className={`rounded-lg border-2 border-dashed p-8 transition-all ${
                  selectedFiles.length > 0
                    ? "border-gray-300 bg-gray-50"
                    : "border-gray-200"
                } hover:border-primary/50 hover:bg-gray-50`}
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
                          or click to browse
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
                        <h3 className="mb-3 text-center text-lg font-medium">
                          Selected Images
                        </h3>
                        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {previews.map((preview, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="group relative aspect-square overflow-hidden rounded-md"
                            >
                              <img
                                src={preview || "/placeholder.svg"}
                                alt={`Preview ${index}`}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute top-1 right-1 rounded-full bg-black/70 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                                disabled={isUploading}
                              >
                                <X className="h-4 w-4 text-white" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col items-center">
                    <input
                      type="file"
                      id="file-upload"
                      ref={fileInputRef}
                      onChange={(e) => {
                        handleFileSelect(e);
                        field.onChange(e.target.files);
                      }}
                      multiple
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                    />
                    <FormMessage />
                  </div>

                  <div className="flex w-full gap-3">
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="flex-1"
                      disabled={isUploading}
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      {selectedFiles.length > 0 ? "Add More" : "Select Images"}
                    </Button>

                    {selectedFiles.length > 0 && (
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : uploadComplete ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Complete!
                          </>
                        ) : (
                          "Upload Files"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </FormItem>
          )}
        />

        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <div className="flex justify-between text-sm">
                <span>
                  Uploading {selectedFiles.length}{" "}
                  {selectedFiles.length === 1 ? "file" : "files"}
                </span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {uploadComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center rounded-md border border-green-200 bg-green-50 p-3"
            >
              <Check className="mr-2 h-5 w-5 text-green-500" />
              <span className="text-green-700">
                All files uploaded successfully!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Form>
  );
}
