import React, { useState, useRef } from 'react';
import { MAX_VIDEO_SIZE_MB, MAX_VIDEO_SIZE_BYTES, VIDEO_ACCEPTED_TYPES } from '../../lib/constants';

interface VideoUploaderProps {
  currentVideoUrl?: string;
  onVideoSelect: (file: File) => void;
  onVideoRemove: () => void;
  disabled?: boolean;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  currentVideoUrl,
  onVideoSelect,
  onVideoRemove,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentVideoUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    if (!VIDEO_ACCEPTED_TYPES.includes(file.type)) {
      setError('Formato não suportado. Use MP4, WebM ou MOV.');
      return false;
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setError(`O vídeo excede o limite de ${MAX_VIDEO_SIZE_MB}MB.`);
      return false;
    }
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onVideoSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
    onVideoRemove();
  };

  if (previewUrl) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
        <video
          src={previewUrl}
          className="w-full aspect-9/16 max-h-80 object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            type="button"
            onClick={handleRemove}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
          >
            <span className="material-icons-round text-sm">delete</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center w-full aspect-9/16 max-h-80
          rounded-xl border-2 border-dashed transition-all cursor-pointer
          ${disabled
            ? 'border-neutral-800 bg-neutral-900/50 cursor-not-allowed opacity-50'
            : isDragOver
              ? 'border-white bg-white/5'
              : 'border-neutral-700 bg-neutral-900 hover:border-neutral-500'
          }
        `}
      >
        <span className="material-icons-round text-4xl text-neutral-500 mb-3">cloud_upload</span>
        <p className="text-sm text-neutral-400 text-center px-4">
          {disabled
            ? 'Limite de vídeos atingido'
            : 'Arraste um vídeo ou clique para selecionar'
          }
        </p>
        <p className="text-xs text-neutral-600 mt-2">
          MP4, WebM ou MOV - Máx. {MAX_VIDEO_SIZE_MB}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={VIDEO_ACCEPTED_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
          <span className="material-icons-round text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  );
};
