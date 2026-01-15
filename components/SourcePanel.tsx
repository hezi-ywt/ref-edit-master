import React, { useRef } from 'react';
import { UploadIcon, XIcon } from './Icons';

interface SourcePanelProps {
  sourceImage: string | null;
  onUpload: (file: File) => void;
  onClear: () => void;
}

export const SourcePanel: React.FC<SourcePanelProps> = ({ sourceImage, onUpload, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Source Image
        </h2>
        <p className="text-xs text-slate-500 mt-1">Original image to be edited</p>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-slate-950/50 rounded-xl border border-slate-800 border-dashed relative overflow-hidden group">
        {sourceImage ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black/40">
            <img 
              src={sourceImage} 
              alt="Source" 
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
            <button
              onClick={onClear}
              className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-lg"
              title="Remove source"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/30 transition-colors"
          >
            <div className="p-4 rounded-full bg-slate-800 mb-3 text-blue-400 group-hover:scale-110 transition-transform">
              <UploadIcon className="w-8 h-8" />
            </div>
            <p className="text-sm text-slate-300 font-medium">Click to upload source</p>
            <p className="text-xs text-slate-500 mt-2">JPG, PNG, WEBP</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};