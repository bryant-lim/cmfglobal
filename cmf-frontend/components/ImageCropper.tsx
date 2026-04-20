'use client';

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Camera, RefreshCw } from 'lucide-react';

interface ImageCropperProps {
  onCropComplete: (blob: Blob) => void;
  aspectRatio?: number;
  initialImage?: string;
}

export default function ImageCropper({ onCropComplete, aspectRatio = 3 / 4, initialImage = '' }: ImageCropperProps) {
  const [imgSrc, setImgSrc] = useState(initialImage);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, aspectRatio, width, height),
      width,
      height
    );
    setCrop(initialCrop);
  };

  const generateCroppedImage = useCallback(async () => {
    if (completedCrop && imgRef.current) {
      const canvas = document.createElement('canvas');
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          image,
          completedCrop.x * scaleX,
          completedCrop.y * scaleY,
          completedCrop.width * scaleX,
          completedCrop.height * scaleY,
          0,
          0,
          canvas.width,
          canvas.height
        );
        canvas.toBlob((blob) => {
          if (blob) onCropComplete(blob);
        }, 'image/jpeg', 0.95);
      }
    }
  }, [completedCrop, onCropComplete]);

  const handleApplyCrop = async () => {
    await generateCroppedImage();
  };

  return (
    <div className="relative border-2 border-dashed border-gray-200 rounded-[2rem] p-6 text-center hover:border-red-200 transition-all bg-gray-50/30">
      {imgSrc ? (
        <div className="space-y-4">
          <ReactCrop 
            crop={crop} 
            onChange={c => setCrop(c)} 
            onComplete={c => setCompletedCrop(c)} 
            aspect={aspectRatio} 
            className="max-h-[300px] overflow-hidden rounded-2xl mx-auto shadow-xl"
          >
            <img ref={imgRef} src={imgSrc} onLoad={onImageLoad} className="max-w-full" alt="Crop" />
          </ReactCrop>
          <div className="flex flex-col items-center gap-3">
            <button 
                onClick={handleApplyCrop}
                className="w-full py-2 bg-[#E63946] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-100 hover:bg-black transition-all"
            >
                Confirm Portrait
            </button>
            <button 
                onClick={() => setImgSrc('')} 
                className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-all"
            >
                <RefreshCw size={12} /> Change Photo
            </button>
          </div>
        </div>
      ) : (
        <label className="cursor-pointer space-y-2 block py-10">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto text-[var(--color-cmf-red)] mb-4 shadow-sm shadow-red-100">
            <Camera size={24} />
          </div>
          <div className="text-sm font-black text-gray-900">Upload Photo</div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">3:4 Aspect Ratio Recommended</div>
          <input type="file" className="hidden" accept="image/*" onChange={onSelectFile} />
        </label>
      )}
    </div>
  );
}
