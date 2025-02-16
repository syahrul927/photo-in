"use client";
import ContentLayout from "@/components/layout/content-layout";
import JSZip from "jszip";

const CreateEventPage = () => {
  const maxZipSize = 10 * 1024 * 1024; // 100MB in bytes
  const maxImagesPerZip = 5; // Optional limit on images per zip

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    let currentZip = new JSZip();
    let currentZipSize = 0;
    let zipIndex = 1;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) return;
      const fileBlob = await file.arrayBuffer();
      const fileSize = fileBlob.byteLength;

      if (currentZipSize + fileSize > maxZipSize || i % maxImagesPerZip === 0) {
        if (currentZipSize > 0) {
          await downloadZip(currentZip, zipIndex);
          zipIndex++;
          currentZip = new JSZip();
          currentZipSize = 0;
        }
      }

      // Add the file to the current zip
      currentZip.file(file.name, fileBlob);
      currentZipSize += fileSize;
    }

    // Download the last zip if there are remaining files
    if (currentZipSize > 0) {
      await downloadZip(currentZip, zipIndex);
    }
  };

  const downloadZip = async (zip: JSZip, index: number) => {
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipUrl = URL.createObjectURL(zipBlob);

    // Create a temporary link to trigger the download
    const link = document.createElement("a");
    link.href = zipUrl;
    link.download = `batch-${index}.zip`;
    link.click();

    // Revoke the URL to free memory
    URL.revokeObjectURL(zipUrl);
  };

  return (
    <ContentLayout title="Create New Event">
      <div className="flex flex-col space-y-3 rounded-lg border p-3">
        <h3>Download Zipped Files</h3>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
        />
        <p>Select files to create and download zip files locally.</p>
      </div>
    </ContentLayout>
  );
};
export default CreateEventPage;
