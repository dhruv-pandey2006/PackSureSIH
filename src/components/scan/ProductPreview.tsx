type ProductPreviewProps = {
  fileName: string;
  width?: number;
  height?: number;
  imageUrls?: string[];
};

export function ProductPreview({ fileName, width, height, imageUrls = [] }: ProductPreviewProps) {
  const primaryImage = imageUrls[0];
  const additionalCount = Math.max(imageUrls.length - 1, 0);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-sm font-medium text-white">Preview</div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Image details</div>
      </div>
      {primaryImage ? (
        <div className="relative">
          <img src={primaryImage} alt={fileName} className="h-52 w-full rounded-xl object-cover" />
          {additionalCount > 0 ? (
            <div className="absolute bottom-2 right-2 rounded-full bg-slate-950/80 px-2.5 py-1 text-xs font-medium text-white">
              +{additionalCount} more
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/70 text-sm text-slate-400">
          No image selected
        </div>
      )}
      <div className="mt-4 space-y-2 text-sm text-slate-300">
        <div className="flex justify-between"><span className="text-slate-400">File</span><span className="truncate max-w-[60%] text-right text-white">{fileName}</span></div>
        {width && height ? <div className="flex justify-between"><span className="text-slate-400">Dimensions</span><span className="text-white">{width} × {height}px</span></div> : null}
      </div>
    </div>
  );
}
