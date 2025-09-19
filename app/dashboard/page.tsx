'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, CreditCard, Clock } from 'lucide-react';
import Link from 'next/link';
import { APP_CONFIG, RESTORATION_PRESETS } from '@/lib/constants';

export default function Dashboard() {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState<'upload' | 'history'>('upload');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    console.log('Files uploaded:', files);
    // TODO: Implement file upload logic
  };

  return (
    <main className="min-h-screen bg-[#F5F0E8] pt-20">
      {/* Header */}
      <section className="px-4 py-8 md:px-8 lg:px-12 border-b border-thin border-black bg-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-bold text-3xl md:text-4xl uppercase tracking-tight">
            Welcome back, {user?.firstName || 'User'}
          </h1>
          <p className="text-sm text-black/70 mt-2 uppercase tracking-wider">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-[#F5F0E8] border-thin border-black rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Credits</span>
              </div>
              <p className="font-bold text-2xl">50</p>
              <p className="text-xs text-black/60">of {APP_CONFIG.creditsPerMonth} remaining</p>
            </div>

            <div className="bg-[#F5F0E8] border-thin border-black rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Photos</span>
              </div>
              <p className="font-bold text-2xl">0</p>
              <p className="text-xs text-black/60">restored this month</p>
            </div>

            <div className="bg-[#F5F0E8] border-thin border-black rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Resets</span>
              </div>
              <p className="font-bold text-2xl">30</p>
              <p className="text-xs text-black/60">days remaining</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 py-4 md:px-8 lg:px-12 bg-white border-b border-thin border-black">
        <div className="mx-auto max-w-6xl flex gap-8">
          <button
            onClick={() => setSelectedTab('upload')}
            className={`text-sm uppercase tracking-wider py-2 border-b-2 transition-colors ${
              selectedTab === 'upload' ? 'border-black' : 'border-transparent'
            }`}
          >
            Upload New
          </button>
          <button
            onClick={() => setSelectedTab('history')}
            className={`text-sm uppercase tracking-wider py-2 border-b-2 transition-colors ${
              selectedTab === 'history' ? 'border-black' : 'border-transparent'
            }`}
          >
            History
          </button>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 py-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          {selectedTab === 'upload' ? (
            <div>
              {/* Upload Area */}
              <div
                className={`bg-white border-2 ${
                  dragActive ? 'border-black' : 'border-dashed border-black/30'
                } rounded-md p-12 text-center transition-all`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-black/60" />
                <h3 className="font-bold text-lg uppercase tracking-wider mb-2">
                  Drop your photo here
                </h3>
                <p className="text-sm text-black/60 mb-6">
                  or click to browse • JPEG, PNG, TIFF • Max {APP_CONFIG.maxFileSizeMB}MB
                </p>

                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleChange}
                />
                <label htmlFor="file-upload">
                  <Button className="bg-black text-[#F5F0E8] hover:bg-black/90 px-6 py-3 rounded-md uppercase tracking-wider cursor-pointer">
                    Select File
                  </Button>
                </label>
              </div>

              {/* Presets Preview */}
              <div className="mt-12">
                <h3 className="font-bold text-lg uppercase tracking-wider mb-6">
                  Available Presets
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {RESTORATION_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      className="bg-white border-thin border-black rounded-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="text-2xl mb-2">{preset.icon}</div>
                      <h4 className="font-bold text-sm uppercase tracking-wider mb-1">
                        {preset.name}
                      </h4>
                      <p className="text-xs text-black/70">{preset.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* History */}
              <div className="bg-white border-thin border-black rounded-md p-8 text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-black/30" />
                <h3 className="font-bold text-lg uppercase tracking-wider mb-2">
                  No restorations yet
                </h3>
                <p className="text-sm text-black/60 mb-6">
                  Your restored photos will appear here
                </p>
                <Button
                  onClick={() => setSelectedTab('upload')}
                  className="bg-black text-[#F5F0E8] hover:bg-black/90 px-6 py-3 rounded-md uppercase tracking-wider"
                >
                  Upload First Photo
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}