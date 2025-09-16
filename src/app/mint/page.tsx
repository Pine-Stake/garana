"use client";
import { useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";

export default function MintPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    collectionName: "",
    symbol: "",
    description: "",
    launchDate: "2024-12-31T12:00",
    supply: "400",
    mintPrice: "24",
    royalties: "5",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handlePreviewFiles = () => {
    if (uploadedFiles.length === 0) {
      alert("Please select a file first");
      return;
    }
    const urls = uploadedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  };

  const handleDeployToPinata = async () => {
    if (!formData.collectionName.trim()) {
      alert("Collection Name is required");
      return;
    }
    if (!formData.symbol.trim() || formData.symbol.length < 3) {
      alert("Symbol must have at least 3 characters");
      return;
    }
    if (!formData.description.trim()) {
      alert("Description is required");
      return;
    }
    if (uploadedFiles.length === 0) {
      alert("At least one image is required");
      return;
    }

    setIsUploading(true);
    try {
      const data = new FormData();
      uploadedFiles.forEach((file) => data.append("files", file));
      data.set("collectionName", formData.collectionName);

      const res = await fetch("/api/files", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload failed");

      const json = await res.json();
      console.log("Pinata response:", json);
      alert("Collection deployed successfully!");
    } catch (err) {
      console.error(err);
      alert("Error deploying files");
    } finally {
      setIsUploading(false);
    }
  };

  const clearFields = () => {
    setFormData({
      collectionName: "",
      symbol: "",
      description: "",
      launchDate: "2024-12-31T12:00",
      supply: "400",
      mintPrice: "24",
      royalties: "5",
    });
    setUploadedFiles([]);
    setPreviews([]);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white tracking-wider font-semibold">
          DEPLOY COLLECTION
        </h1>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-12 space-y-6">
        <div>
          <label className="block text-white mb-2">Collection Name</label>
          <Input
            value={formData.collectionName}
            onChange={(e) =>
              handleInputChange("collectionName", e.target.value)
            }
            className="bg-black border-0 border-l-2 border-b-2 border-gray-600 text-white font-sans focus:border-white rounded outline-none ring-0 focus:ring-0 focus-visible:ring-0"
            placeholder="My Awesome Collection"
          />
        </div>

        <div>
          <label className="block text-white mb-2">Symbol</label>
          <p className="text-gray-400 text-sm mb-2">
            Collection symbol (3-10 characters)
          </p>
          <Input
            value={formData.symbol}
            onChange={(e) => handleInputChange("symbol", e.target.value)}
            className="bg-black border-0 border-l-2 border-b-2 border-gray-600 text-white font-sans focus:border-2 focus:border-white rounded outline-none ring-0 focus:ring-0 focus-visible:ring-0"
            placeholder="MAC"
            maxLength={10}
          />
        </div>

        <div>
          <label className="block text-white mb-2">Description</label>
          <p className="text-gray-400 text-sm mb-2">Describe your collection</p>
          <Textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="bg-black border-0 border-l-2 border-b-2 border-gray-600 text-white font-sans min-h-[120px] focus:border-2 focus:border-white rounded outline-none ring-0 focus:ring-0 focus-visible:ring-0"
            placeholder="A unique collection of digital art..."
          />
        </div>

        <div>
          <label className="block text-white mb-2">
            Launch Date <span className="text-gray-500">(soon)</span>
          </label>
          <Input
            type="datetime-local"
            value={formData.launchDate}
            disabled
            className="bg-gray-900 border-0 border-l-2 border-b-2 border-gray-600 text-gray-400 font-sans cursor-not-allowed rounded outline-none ring-0 focus:ring-0 focus-visible:ring-0"
          />
        </div>

        <div>
          <label className="block text-white mb-2">
            Supply <span className="text-gray-500">(soon)</span>
          </label>
          <p className="text-gray-400 text-sm mb-2">
            Total number of NFTs (1-10000)
          </p>
          <Input
            type="number"
            value={formData.supply}
            disabled
            className="bg-gray-900 border-0 border-l-2 border-b-2 border-gray-600 text-gray-400 font-sans cursor-not-allowed rounded outline-none ring-0 focus:ring-0 focus-visible:ring-0"
          />
        </div>

        <div>
          <label className="block text-white mb-2">
            Mint Price <span className="text-gray-500">(soon)</span>
          </label>
          <p className="text-gray-400 text-sm mb-2">Price per NFT (XLM)</p>
          <Input
            type="number"
            step="0.01"
            value={formData.mintPrice}
            disabled
            className="bg-gray-900 border-0 border-l-2 border-b-2 border-gray-600 text-gray-400 font-sans cursor-not-allowed rounded outline-none ring-0 focus:ring-0 focus-visible:ring-0"
          />
        </div>

        <div>
          <label className="block text-white mb-2">
            Royalties <span className="text-gray-500">(soon)</span>
          </label>
          <p className="text-gray-400 text-sm mb-2">
            Creator royalties percentage (0-10%)
          </p>
          <Input
            type="number"
            value={formData.royalties}
            disabled
            className="bg-gray-900 border-0 border-l-2 border-b-2 border-gray-600 text-gray-400 font-sans cursor-not-allowed rounded outline-none ring-0 focus:ring-0 focus-visible:ring-0"
          />
        </div>

        <div>
          <label className="block text-white mb-2">Collection Assets</label>
          <div
            className={`border-2 border-dashed p-12 text-center cursor-pointer transition-colors rounded outline-none ring-0 focus:ring-0 focus-visible:ring-0 ${
              isDragOver
                ? "border-white bg-gray-900"
                : "border-gray-600 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="text-white font-sans mb-2">
              {uploadedFiles.length > 0
                ? `${uploadedFiles.length} files uploaded`
                : "Click to upload or drag files here"}
            </p>
            {uploadedFiles.length > 0 && (
              <div className="text-gray-400 text-sm">
                {uploadedFiles.map((file, index) => (
                  <div key={index}>{file.name}</div>
                ))}
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.gif,.json,.zip"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          {uploadedFiles.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handlePreviewFiles}
                className="bg-white text-black hover:bg-gray-200"
              >
                Preview Files
              </Button>
            </div>
          )}
        </div>

        {previews.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((url, idx) => (
              <div
                key={idx}
                className="aspect-square bg-gray-800 rounded overflow-hidden outline-none ring-0 focus:ring-0 focus-visible:ring-0"
              >
                <img
                  src={url}
                  alt={`Preview ${idx}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button
            onClick={clearFields}
            variant="outline"
            className="bg-black border-gray-600 text-white hover:bg-gray-900 font-sans rounded cursor-pointer outline-none ring-0 focus:ring-0 focus-visible:ring-0"
          >
            Clear Fields
          </Button>
          <Button
            onClick={handleDeployToPinata}
            disabled={isUploading}
            className="bg-white text-black hover:bg-gray-200 font-sans px-12 rounded cursor-pointer outline-none ring-0 focus:ring-0 focus-visible:ring-0"
          >
            {isUploading ? "Deploying..." : "Deploy Collection"}
          </Button>
        </div>
      </div>
    </div>
  );
}
