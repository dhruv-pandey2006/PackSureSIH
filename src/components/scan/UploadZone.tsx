import { Camera, ImagePlus, Trash2, UploadCloud } from 'lucide-react';
import type { ChangeEvent, DragEvent, MouseEvent } from 'react';

type UploadZoneProps = {
  files: File[];
  previewUrls: string[];
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onCameraOpen?: () => void;
  canAnalyze?: boolean;
};

export function UploadZone({ files, previewUrls, onFilesAdd, onFileRemove, onAnalyze, isAnalyzing, onCameraOpen, canAnalyze }: UploadZoneProps) {
  const isLightTheme = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light';

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
    if (selectedFiles.length > 0) {
      onFilesAdd(selectedFiles);
    }
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files ? Array.from(event.dataTransfer.files) : [];
    if (droppedFiles.length > 0) {
      onFilesAdd(droppedFiles);
    }
  };

  const handleRemoveClick = (event: MouseEvent<HTMLButtonElement>, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    onFileRemove(index);
  };

  const hasFiles = files.length > 0;
  const totalSizeMb = files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024;
  const statusText = hasFiles ? `${files.length} image${files.length === 1 ? '' : 's'} ready to analyze` : 'Drop images here';

  return (
    <div className="space-y-6">
      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className={isLightTheme
          ? 'group relative flex min-h-[330px] cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white p-5 text-center transition-[border-color,background-color,box-shadow,transform] duration-[var(--transition-normal)] ease-out hover:border-cyan-400/60 hover:bg-slate-50'
          : 'group relative flex min-h-[330px] cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-700 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.88))] p-5 text-center transition-[border-color,background-color,box-shadow,transform] duration-[var(--transition-normal)] ease-out hover:border-cyan-400/60 hover:bg-slate-900/80'}
      >
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleInputChange} />

        {hasFiles ? (
          <div className={isLightTheme ? 'w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)]' : 'w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/80 p-4 shadow-[0_12px_32px_rgba(2,6,23,0.45)]'}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {previewUrls.map((url, index) => (
                <div key={url} className={isLightTheme ? 'relative overflow-hidden rounded-xl border border-slate-200 bg-white' : 'relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900'}>
                  <img src={url} alt={`Selected image ${index + 1}`} className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    onClick={(event) => handleRemoveClick(event, index)}
                    aria-label={`Remove image ${index + 1}`}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-950/70 text-slate-100 transition-[background-color,color] duration-[var(--transition-fast)] ease-out hover:bg-red-500/90 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className={isLightTheme ? 'text-sm font-medium text-slate-900' : 'text-sm font-medium text-white'}>
                  {files.length} image{files.length === 1 ? '' : 's'} selected
                </div>
                <div className={isLightTheme ? 'text-xs text-slate-500' : 'text-xs text-slate-400'}>{totalSizeMb.toFixed(2)} MB total</div>
              </div>
              <span className={isLightTheme ? 'inline-flex items-center rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs text-cyan-700' : 'inline-flex items-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200'}>
                Click or drop to add more
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className={isLightTheme ? 'mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-cyan-500 ring-1 ring-inset ring-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.08)]' : 'mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900/80 text-cyan-300 ring-1 ring-inset ring-cyan-500/20 shadow-[0_0_28px_rgba(34,211,238,0.14)]'}>
              <UploadCloud className="h-8 w-8" />
            </div>
            <div>
              <div className={isLightTheme ? 'text-xl font-semibold text-slate-900' : 'text-xl font-semibold text-white'}>{statusText}</div>
              <div className={isLightTheme ? 'mt-2 text-sm text-slate-500' : 'mt-2 text-sm text-slate-400'}>JPG, PNG, and WEBP up to 10MB each — select multiple</div>
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
          disabled={(!hasFiles && !canAnalyze) || isAnalyzing}
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
