import { Camera, ImagePlus, Trash2, UploadCloud } from 'lucide-react';
import type { ChangeEvent, DragEvent } from 'react';

type UploadZoneProps = {
  file: File | null;
  previewUrl: string | null;
  onFileSelect: (file: File | null) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onCameraOpen?: () => void;
  canAnalyze?: boolean;
};

export function UploadZone({ file, previewUrl, onFileSelect, onAnalyze, isAnalyzing, onCameraOpen, canAnalyze }: UploadZoneProps) {
  const isLightTheme = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light';

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    onFileSelect(selectedFile);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    onFileSelect(droppedFile);
  };

  const statusText = file ? 'Image ready to analyze' : 'Drop an image here';

  return (
    <div className="space-y-6">
      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className={isLightTheme
          ? 'group relative flex min-h-[330px] cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white p-5 text-center transition-[border-color,background-color,box-shadow,transform] duration-[var(--transition-normal)] ease-out hover:border-cyan-400/60 hover:bg-slate-50'
          : 'group relative flex min-h-[330px] cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-700 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.88))] p-5 text-center transition-[border-color,background-color,box-shadow,transform] duration-[var(--transition-normal)] ease-out hover:border-cyan-400/60 hover:bg-slate-900/80'}
      >
        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleInputChange} />

        {previewUrl ? (
          <div className={isLightTheme ? 'relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)]' : 'relative w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/80 p-4 shadow-[0_12px_32px_rgba(2,6,23,0.45)]'}>
            <img src={previewUrl} alt="Product preview" className={isLightTheme ? 'h-[240px] w-full rounded-xl object-cover ring-1 ring-slate-200' : 'h-[240px] w-full rounded-xl object-cover ring-1 ring-slate-700'} />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className={isLightTheme ? 'text-sm font-medium text-slate-900' : 'text-sm font-medium text-white'}>{file?.name ?? 'Selected image'}</div>
                <div className={isLightTheme ? 'text-xs text-slate-500' : 'text-xs text-slate-400'}>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Ready for upload'}</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    onFileSelect(null);
                  }}
                  className={isLightTheme ? 'inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 transition-[border-color,color,transform] duration-[var(--transition-fast)] ease-out hover:border-red-300 hover:text-red-600' : 'inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 transition-[border-color,color,transform] duration-[var(--transition-fast)] ease-out hover:border-red-500/50 hover:text-red-200'}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
                <span className={isLightTheme ? 'inline-flex items-center rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs text-cyan-700' : 'inline-flex items-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200'}>
                  Replace image
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className={isLightTheme ? 'mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-cyan-500 ring-1 ring-inset ring-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.08)]' : 'mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900/80 text-cyan-300 ring-1 ring-inset ring-cyan-500/20 shadow-[0_0_28px_rgba(34,211,238,0.14)]'}>
              <UploadCloud className="h-8 w-8" />
            </div>
            <div>
              <div className={isLightTheme ? 'text-xl font-semibold text-slate-900' : 'text-xl font-semibold text-white'}>{statusText}</div>
              <div className={isLightTheme ? 'mt-2 text-sm text-slate-500' : 'mt-2 text-sm text-slate-400'}>JPG, PNG, and WEBP up to 10MB</div>
            </div>
            <div className={isLightTheme ? 'flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500' : 'flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500'}>
              <span className={isLightTheme ? 'h-px w-8 bg-slate-300' : 'h-px w-8 bg-slate-700'} /> Drag & drop <span className={isLightTheme ? 'h-px w-8 bg-slate-300' : 'h-px w-8 bg-slate-700'} />
            </div>
          </div>
        )}
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={(!file && !canAnalyze) || isAnalyzing}
          className={isLightTheme
            ? 'inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(14,165,233,0.3)] transition-[transform,box-shadow,opacity] duration-[var(--transition-normal)] ease-out hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(14,165,233,0.38)] disabled:cursor-not-allowed disabled:from-slate-200 disabled:via-slate-200 disabled:to-slate-300 disabled:text-slate-500 disabled:shadow-none'
            : 'inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(14,165,233,0.3)] transition-[transform,box-shadow,opacity] duration-[var(--transition-normal)] ease-out hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(14,165,233,0.38)] disabled:cursor-not-allowed disabled:opacity-50'}
        >
          <ImagePlus className="h-4 w-4" />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Product'}
        </button>
        <button
          type="button"
          onClick={onCameraOpen}
          className={isLightTheme
            ? 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-[border-color,color,transform,background-color] duration-[var(--transition-normal)] ease-out hover:-translate-y-0.5 hover:border-cyan-400 hover:text-slate-900'
            : 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-200 transition-[border-color,color,transform,background-color] duration-[var(--transition-normal)] ease-out hover:-translate-y-0.5 hover:border-cyan-500/40'}
        >
          <Camera className="h-4 w-4" /> Use Camera
        </button>
      </div>
    </div>
  );
}
