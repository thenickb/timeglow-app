'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ProcessingStatusProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
  estimatedTime?: number; // in seconds
}

export default function ProcessingStatus({
  status,
  message,
  estimatedTime = 30,
}: ProcessingStatusProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status]);

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="w-12 h-12 text-black/50" />;
      case 'processing':
        return <Loader2 className="w-12 h-12 text-black animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case 'failed':
        return <XCircle className="w-12 h-12 text-red-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'pending':
        return message || 'Waiting to start...';
      case 'processing':
        return message || 'AI is working its magic...';
      case 'completed':
        return message || 'Restoration complete!';
      case 'failed':
        return message || 'Something went wrong. Please try again.';
    }
  };

  const getProgressPercentage = () => {
    if (status !== 'processing') return 0;
    return Math.min((elapsedTime / estimatedTime) * 100, 95);
  };

  return (
    <div className="bg-white border border-black rounded-md p-8">
      <div className="flex flex-col items-center text-center">
        {getStatusIcon()}

        <h3 className="font-bold text-xl uppercase tracking-wider mt-4 mb-2">
          {getStatusMessage()}
        </h3>

        {status === 'processing' && (
          <>
            <p className="text-sm text-black/60 mb-6">
              This usually takes {estimatedTime} seconds
            </p>

            {/* Progress bar */}
            <div className="w-full max-w-xs">
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-black h-full transition-all duration-500 ease-out"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <p className="text-xs text-black/50 mt-2">
                {elapsedTime}s elapsed
              </p>
            </div>

            {/* Processing steps */}
            <div className="mt-8 space-y-2 text-left">
              <ProcessingStep
                completed={elapsedTime > 2}
                text="Analyzing image..."
              />
              <ProcessingStep
                completed={elapsedTime > 5}
                text="Applying AI restoration..."
              />
              <ProcessingStep
                completed={elapsedTime > 10}
                text="Enhancing details..."
              />
              <ProcessingStep
                completed={elapsedTime > 15}
                text="Finalizing..."
              />
            </div>
          </>
        )}

        {status === 'failed' && (
          <p className="text-sm text-red-600 mt-4 max-w-sm">
            {message || 'Please check your internet connection and try again.'}
          </p>
        )}
      </div>
    </div>
  );
}

function ProcessingStep({ completed, text }: { completed: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-full border-2 transition-all ${
          completed
            ? 'bg-black border-black'
            : 'bg-transparent border-black/30'
        }`}
      />
      <span
        className={`text-sm transition-all ${
          completed ? 'text-black' : 'text-black/40'
        }`}
      >
        {text}
      </span>
    </div>
  );
}