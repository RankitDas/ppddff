"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, AlertCircle } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (files: File[]) => void;
  allowedExtensions: string[];
  allowMultiple?: boolean;
}

const MAX_UPLOAD_BYTES = 52_428_800; // 50 MB

export function UploadZone({
  onFileSelect,
  allowedExtensions,
  allowMultiple = false,
}: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (fileList: FileList) => {
    setError(null);
    const validFiles: File[] = [];
    const filesArray = Array.from(fileList);

    if (filesArray.length === 0) return;

    if (!allowMultiple && filesArray.length > 1) {
      setError("Only one file can be uploaded in this mode.");
      return;
    }

    for (const file of filesArray) {
      if (file.size > MAX_UPLOAD_BYTES) {
        setError(
          `File "${file.name}" is too large. Max size is 50 MB (current: ${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)} MB)`
        );
        return;
      }

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !allowedExtensions.includes(ext)) {
        setError(`Unsupported file extension: .${ext || "?"} for "${file.name}"`);
        return;
      }
      validFiles.push(file);
    }

    onFileSelect(validFiles);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`w-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center cursor-pointer dropzone-3d ${
          isDragActive ? "border-[#0A84FF] bg-[#FAFAFA]" : ""
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={allowedExtensions.map((ext) => `.${ext}`).join(",")}
          multiple={allowMultiple}
        />

        <div className="w-12 h-12 rounded-lg bg-neutral-50 flex items-center justify-center mb-4 text-neutral-400 border border-neutral-100">
          <UploadCloud className="w-6 h-6 text-neutral-500" />
        </div>

        <h3 className="font-semibold text-[#111827] text-base mb-1">
          {allowMultiple ? "Drag & drop your PDF files here" : "Drag & drop your file here"}
        </h3>
        <p className="text-xs text-[#6B7280] mb-5">
          or click to browse your folders
        </p>

        <div className="btn-3d-primary text-xs px-5 py-2.5 font-semibold shadow-sm transition-transform">
          Browse Files
        </div>

        <p className="text-[11px] text-[#9CA3AF] mt-6">
          Maximum file size: 50 MB • Privacy Protected (No files stored on server)
        </p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-xs text-red-600 text-left">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
