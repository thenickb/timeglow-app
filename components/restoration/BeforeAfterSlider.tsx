'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="relative rounded-md overflow-hidden border border-black">
      <ReactCompareSlider
        itemOne={
          <div className="relative w-full h-full">
            <ReactCompareSliderImage src={beforeImage} alt="Before restoration" />
            <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs uppercase tracking-wider rounded">
              {beforeLabel}
            </div>
          </div>
        }
        itemTwo={
          <div className="relative w-full h-full">
            <ReactCompareSliderImage src={afterImage} alt="After restoration" />
            <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 text-xs uppercase tracking-wider rounded">
              {afterLabel}
            </div>
          </div>
        }
        position={sliderPosition}
        onPositionChange={setSliderPosition}
        style={{
          height: '500px',
        }}
        handle={
          <div className="flex items-center justify-center h-full">
            <div className="bg-black w-1 h-full relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-black rounded-full w-10 h-10 flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 14L3 10L7 6"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13 14L17 10L13 6"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}