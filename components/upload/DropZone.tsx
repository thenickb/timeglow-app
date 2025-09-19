'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import imageCompression from 'browser-image-compression';
import { APP_CONFIG } from '@/lib/constants';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export default function DropZone({ onFileSelect, isProcessing = false }: DropZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!APP_CONFIG.supportedFormats.includes(file.type)) {
      return 'Please upload a JPEG, PNG, or TIFF image';
    }

    // Check file size
    const maxSizeBytes = APP_CONFIG.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${APP_CONFIG.maxFileSizeMB}MB`;
    }

    return null;
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Compress if needed
    let processedFile = file;
    if (file.size > 5 * 1024 * 1024) { // If larger than 5MB, compress
      try {
        processedFile = await imageCompression(file, {
          maxSizeMB: 5,
          maxWidthOrHeight: 4096,
          useWebWorker: true,
        });
      } catch (err) {
        console.error('Compression error:', err);
      }
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(processedFile);

    setSelectedFile(processedFile);
    onFileSelect(processedFile);
  };

  const clearSelection = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div>
      {!preview ? (
        <div
          className={`bg-white border-2 ${
            dragActive ? 'border-black' : 'border-dashed border-black/30'
          } rounded-md p-12 text-center transition-all ${
            isProcessing ? 'opacity-50 pointer-events-none' : ''
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-16 h-16 mx-auto mb-4 text-black/60" />
          <h3 className="font-bold text-xl uppercase tracking-wider mb-2">
            Drop your photo here
          </h3>
          <p className="text-sm text-black/60 mb-6">
            or click to browse • JPEG, PNG, TIFF • Max {APP_CONFIG.maxFileSizeMB}MB
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
            disabled={isProcessing}
          />
          <label htmlFor="file-upload">
            <Button
              className="bg-black text-[#F5F0E8] hover:bg-black/90 px-8 py-4 rounded-md uppercase tracking-wider cursor-pointer"
              disabled={isProcessing}
              asChild
            >
              <span>Select File</span>
            </Button>
          </label>
        </div>
      ) : (
        <div className="bg-white border border-black rounded-md p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg uppercase tracking-wider">
                Photo Ready
              </h3>
              <p className="text-sm text-black/60">
                {selectedFile?.name} • {(selectedFile?.size || 0 / 1024 / 1024).toFixed(2)}MB
              </p>
            </div>
            <button
              onClick={clearSelection}
              className="p-1 hover:bg-black/10 rounded transition-colors"
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}