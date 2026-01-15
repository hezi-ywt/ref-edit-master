import React, { useRef, useState } from 'react';
import { ReferenceImage } from '../types';
import { UploadIcon, TrashIcon, LayersIcon, XIcon } from './Icons';

interface ReferencePoolProps {
  references: ReferenceImage[];
  onUpload: (files: FileList) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
  lang?: 'en' | 'zh';
}

const TEXT = {
  en: {
    title: "References",
    unit: "images",
    add: "Add",
    empty: "Drag & drop or click Add",
  },
  zh: {
    title: "参考素材",
    unit: "张图片",
    add: "添加",
    empty: "拖拽或点击添加",
  }
};

export const ReferencePool: React.FC<ReferencePoolProps> = ({ 
  references, 
  onUpload, 
  onRemove,
  compact = false,
  lang = 'zh'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const t = TEXT[lang];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  return (
    <>
      {/* Fullscreen Image Preview Modal */}
      {previewUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setPreviewUrl(null)}
        >
          <button 
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors z-[101]"
            onClick={() => setPreviewUrl(null)}
          >
            <XIcon className="w-6 h-6" />
          </button>
          <img 
            src={previewUrl} 
            alt="Full size preview" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl ring-1 ring-slate-800"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div 
        className={`flex flex-col h-full ${compact ? '' : 'px-4 py-3'} relative rounded-xl border-2 border-dashed 
          ${isDragging 
            ? 'border-orange-500 bg-orange-50 dark:bg-indigo-500/10 dark:border-indigo-500' 
            : 'border-stone-300 bg-white/60 dark:border-slate-800 dark:bg-slate-950/30'
          } transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="mb-2 flex justify-between items-center shrink-0 p-2">
          <div className="flex items-center gap-2">
             <div className="p-1.5 bg-stone-200 dark:bg-slate-800 rounded-md">
               <LayersIcon className="w-4 h-4 text-orange-600 dark:text-purple-400" />
             </div>
             <div>
               <h2 className="text-xs font-semibold text-stone-600 dark:text-slate-300 uppercase tracking-wider">
                 {t.title}
               </h2>
               <span className="text-[10px] text-stone-500 dark:text-slate-500">{references.length} {t.unit}</span>
             </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 border border-stone-200 dark:border-slate-700 text-xs font-medium rounded-md transition-colors shadow-sm"
          >
            <UploadIcon className="w-3.5 h-3.5" />
            {t.add}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex-1 min-h-[100px] p-2">
          {references.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 dark:text-slate-500">
               <p className="text-xs font-medium opacity-70">{t.empty}</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {references.map((ref) => (
                <div 
                  key={ref.id} 
                  className="group relative bg-white dark:bg-black/40 rounded-lg overflow-hidden border border-stone-200 dark:border-slate-700/50 hover:border-orange-400 dark:hover:border-indigo-500/50 transition-all aspect-square cursor-zoom-in shadow-sm dark:shadow-none"
                  onClick={() => setPreviewUrl(ref.url)}
                >
                  <img 
                    src={ref.url} 
                    alt={ref.file.name} 
                    className="w-full h-full object-contain p-1"
                  />
                  
                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 pointer-events-none">
                    <div className="text-[9px] text-white/80 truncate px-1 drop-shadow-md bg-black/50 rounded">
                      {ref.file.name}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(ref.id);
                      }}
                      className="self-end p-1 text-slate-300 hover:text-red-400 bg-slate-900/80 rounded backdrop-blur-sm pointer-events-auto"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};