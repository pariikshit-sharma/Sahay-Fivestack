"use client";

import React, { useState, useRef } from "react";
import { Upload, FileCheck, CheckCircle2, AlertCircle, Trash2, Eye } from "lucide-react";
import { useApp } from "@/core/context/AppContext";

interface DocumentUploaderProps {
  requiredDocType?: string;
  schemeId?: string;
  schemeTitle?: string;
  onUploadComplete?: (doc: { id: string; name: string; type: string }) => void;
}

export function DocumentUploader({
  requiredDocType = "Aadhaar Card / पहचान पत्र",
  schemeId,
  schemeTitle,
  onUploadComplete,
}: DocumentUploaderProps) {
  const { t } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus("error");
      setUploadMessage("File size exceeds 5MB limit. Please choose a smaller file.");
      return;
    }

    setSelectedFile(file);
    setUploadStatus("idle");
    setUploadMessage("");

    // Create preview for images / PDFs
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus("uploading");
    setUploadMessage("Uploading & verifying document...");

    try {
      // Read data URL
      const reader = new FileReader();
      reader.onload = async () => {
        const fileDataUrl = reader.result as string;

        const res = await fetch("/api/v1/documents/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentType: requiredDocType,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            mimeType: selectedFile.type,
            fileDataUrl: fileDataUrl.slice(0, 100000), // lightweight preview payload
          }),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          setUploadStatus("success");
          setUploadMessage("Document verified & securely stored for scheme application!");
          if (onUploadComplete) {
            onUploadComplete({
              id: json.document?.id || `doc-${Date.now()}`,
              name: selectedFile.name,
              type: requiredDocType,
            });
          }
        } else {
          setUploadStatus("error");
          setUploadMessage(json.error || "Failed to upload document. Please try again.");
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      setUploadStatus("error");
      setUploadMessage(err.message || "Network error while uploading.");
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadStatus("idle");
    setUploadMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full bg-sahay-warm-50 rounded-2xl border-2 border-dashed border-sahay-navy-200 p-5 transition-all hover:border-sahay-green-600">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sahay-green-600"></span>
            <h4 className="font-bold text-sahay-navy-950 text-base">{requiredDocType}</h4>
          </div>
          {schemeTitle && (
            <p className="text-xs text-sahay-navy-600">
              For: <span className="font-semibold">{schemeTitle}</span>
            </p>
          )}
        </div>

        {uploadStatus === "success" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
            <CheckCircle2 className="w-4 h-4 text-green-700" />
            Uploaded
          </span>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,application/pdf"
        className="hidden"
      />

      {/* Drag & Select Box */}
      {!selectedFile ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 w-full py-6 px-4 rounded-xl bg-white border border-sahay-warm-300 flex flex-col items-center justify-center gap-2 text-sahay-navy-700 hover:bg-sahay-green-50 hover:border-sahay-green-400 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-sahay-warm-100 flex items-center justify-center group-hover:bg-sahay-green-100 transition-colors">
            <Upload className="w-6 h-6 text-sahay-navy-600 group-hover:text-sahay-green-700" />
          </div>
          <span className="font-bold text-sm text-sahay-navy-900">
            Tap to Upload Document (Photo / PDF)
          </span>
          <span className="text-xs text-sahay-navy-500">
            दस्तावेज़ की फ़ोटो या PDF चुनें (अधिकतम 5MB)
          </span>
        </button>
      ) : (
        <div className="mt-4 p-4 rounded-xl bg-white border border-sahay-warm-300 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileCheck className="w-7 h-7 text-sahay-green-700" />
              <div>
                <p className="text-sm font-bold text-sahay-navy-900 truncate max-w-[200px] sm:max-w-[300px]">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-sahay-navy-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || "Document"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearSelection}
              className="p-1.5 text-sahay-navy-400 hover:text-red-600 rounded-lg transition-colors"
              title="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {previewUrl && (
            <div className="w-full max-h-40 overflow-hidden rounded-lg border border-sahay-warm-200">
              <img src={previewUrl} alt="Preview" className="w-full object-contain max-h-40" />
            </div>
          )}

          {uploadStatus !== "success" ? (
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploadStatus === "uploading"}
              className="w-full py-2.5 px-4 rounded-xl bg-sahay-green-700 hover:bg-sahay-green-800 text-white font-bold text-sm shadow transition-all disabled:opacity-50"
            >
              {uploadStatus === "uploading" ? "Uploading & Verifying..." : "Confirm & Save Document"}
            </button>
          ) : (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-700 flex-shrink-0" />
              <span>{uploadMessage}</span>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0" />
              <span>{uploadMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
