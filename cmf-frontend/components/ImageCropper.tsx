'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Camera, RefreshCw, Check } from 'lucide-react';

interface ImageCropperProps {
  onCropComplete: (blob: Blob) => void;
  aspectRatio?: number;
  initialImage?: string;
  onClear?: () => void;
}

export default function ImageCropper({ 
  onCropComplete, 
  aspectRatio = 3 / 4, 
  initialImage = '', 
  onClear
}: ImageCropperProps) {
  const [imgSrc, setImgSrc] = useState(initialImage);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isConfirmed, setIsConfirmed] = useState(!!initialImage);
  const [previewUrl, setPreviewUrl] = useState(initialImage);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (initialImage) {
      // If we are actively editing, do NOT override with the intermediate preview
      if (imgSrc && !isConfirmed) {
        return;
      }
      setImgSrc(initialImage);
      setPreviewUrl(initialImage);
      setIsConfirmed(true);
    } else {
      if (!imgSrc) {
        setImgSrc('');
        setPreviewUrl('');
        setIsConfirmed(false);
      }
    }
  }, [initialImage, imgSrc, isConfirmed]);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      setCompletedCrop(undefined);
      setIsConfirmed(false);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setPreviewUrl('');
      });
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

    // Calculate initial completedCrop in pixels so it triggers the auto-crop immediately
    const pixelWidth = (width * 90) / 100;
    const pixelHeight = pixelWidth / aspectRatio;
    const initialPixelCrop: PixelCrop = {
      unit: 'px',
      x: (width - pixelWidth) / 2,
      y: (height - pixelHeight) / 2,
      width: pixelWidth,
      height: pixelHeight
    };
    setCompletedCrop(initialPixelCrop);
  };

  // Automatically generate cropped image when completedCrop changes
  useEffect(() => {
    if (imgRef.current && imgSrc && !isConfirmed) {
      let activeCrop = completedCrop;
      if (!activeCrop) {
        const image = imgRef.current;
        const width = image.width;
        const height = image.height;
        const cropWidth = width * 0.9;
        const cropHeight = cropWidth / aspectRatio;
        
        activeCrop = {
          unit: 'px',
          x: (width - cropWidth) / 2,
          y: (height - cropHeight) / 2,
          width: cropWidth,
          height: cropHeight
        };
      }
      
      const canvas = document.createElement('canvas');
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = activeCrop.width * scaleX;
      canvas.height = activeCrop.height * scaleY;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          image,
          activeCrop.x * scaleX,
          activeCrop.y * scaleY,
          activeCrop.width * scaleX,
          activeCrop.height * scaleY,
          0,
          0,
          canvas.width,
          canvas.height
        );
        canvas.toBlob((blob) => {
          if (blob) {
            onCropComplete(blob);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  }, [completedCrop, imgSrc, isConfirmed, onCropComplete, aspectRatio]);

  const handleClear = () => {
    setImgSrc('');
    setPreviewUrl('');
    setIsConfirmed(false);
    onClear?.();
  };

  return (
    <div className="relative border-2 border-dashed border-gray-200 rounded-[2rem] p-6 text-center hover:border-red-200 transition-all bg-gray-50/30">
      {isConfirmed && previewUrl ? (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="relative max-w-[200px] mx-auto group">
            <img 
              src={previewUrl} 
              className="w-full aspect-[3/4] object-cover rounded-2xl shadow-xl border border-gray-100 transition-transform duration-300 group-hover:scale-[1.02]" 
              alt="Cropped Portrait" 
            />
            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg border border-white">
              <Check size={14} strokeWidth={3} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 justify-center">
              Portrait Confirmed
            </div>
            <button 
              type="button"
              onClick={handleClear} 
              className="mt-2 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#E63946] transition-all"
            >
              <RefreshCw size={12} /> Change Photo
            </button>
          </div>
        </div>
      ) : imgSrc ? (
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
              type="button"
              onClick={handleClear} 
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
