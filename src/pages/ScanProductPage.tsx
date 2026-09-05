import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { ProductPreview } from '../components/scan/ProductPreview';
import { UploadZone } from '../components/scan/UploadZone';
import { demoProducts, getScanQuality } from '../services/ocrService';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

export function ScanProductPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<string>('Camera ready when available');

  const clearFileSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDimensions(null);
    setSelectedDemoId(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      clearFileSelection();
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Unsupported file type. Please upload a JPG, PNG or WEBP image.');
      clearFileSelection();
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image exceeds 10 MB. Please choose a smaller file.');
      clearFileSelection();
      return;
    }

    setSelectedDemoId(null);
    setErrorMessage(null);
    setSelectedFile(file);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
    };
    img.src = url;
  };

  const handleAnalyze = () => {
    if (!selectedFile && !selectedDemoId) return;

    const payload = selectedDemoId
      ? { demoProductId: selectedDemoId }
      : { file: selectedFile, fileName: selectedFile?.name, imageUrl: previewUrl ?? undefined };

    navigate('/analysis', { state: payload });
  };

  const handleCameraOpen = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('Camera access is not available on this browser. You can still upload a packaged image file.');
      return;
    }

    try {
      setCameraStatus('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach((track) => track.stop());
      setCameraStatus('Camera ready. Please capture or choose an image file.');
      if (cameraInputRef.current) {
        cameraInputRef.current.setAttribute('capture', 'environment');
        cameraInputRef.current.click();
      }
    } catch {
      setCameraStatus('Camera permission was denied. Please use file upload instead.');
    }
  };

  const fileSummary = useMemo(() => {
    if (selectedFile) {
      return `${selectedFile.name} • ${selectedFile.type || 'image file'}`;
    }
    if (selectedDemoId) {
      const demo = demoProducts.find((item) => item.id === selectedDemoId);
      return demo ? `${demo.productName} • Demo product` : 'Demo product selected';
    }
    return 'Awaiting image upload';
  }, [selectedFile, selectedDemoId]);

  const scanQuality = getScanQuality(selectedFile, dimensions);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => handleFileSelect(event.target.files?.[0] ?? null)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={(event) => handleFileSelect(event.target.files?.[0] ?? null)}
      />

      <div className="mb-8 max-w-2xl">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Upload image</div>
        <h1 className="text-4xl font-bold text-white sm:text-5xl">Scan Your Product</h1>
        <p className="mt-3 text-base text-slate-300">Upload a clear image of the product label to check its compliance.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.75fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <UploadZone
              file={selectedFile}
              previewUrl={previewUrl}
              onFileSelect={(file) => handleFileSelect(file)}
              onAnalyze={handleAnalyze}
              isAnalyzing={false}
              onCameraOpen={handleCameraOpen}
              canAnalyze={Boolean(selectedFile || selectedDemoId)}
            />
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Demo Mode</div>
                <h2 className="mt-2 text-xl font-semibold text-white">Try Demo Product</h2>
              </div>
            </div>
            <div className="space-y-3">
              {demoProducts.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => {
                    setSelectedDemoId(demo.id);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setDimensions(null);
                    setErrorMessage(null);
                  }}
                  className={[
                    'flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition-[border-color,background-color,color,transform] duration-[var(--transition-normal)] ease-out',
                    selectedDemoId === demo.id
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-white'
                      : 'border-slate-700 bg-slate-900/60 text-slate-200 hover:-translate-y-0.5 hover:border-cyan-500/40',
                  ].join(' ')}
                >
                  <div>
                    <div className="font-medium">{demo.productName}</div>
                    <div className="text-xs text-slate-400">{demo.netQuantity} • {demo.status}</div>
                  </div>
                  <span className="text-sm font-semibold text-cyan-200">{demo.score}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <ProductPreview fileName={fileSummary} width={dimensions?.width} height={dimensions?.height} imageUrl={previewUrl} />

          {errorMessage ? (
            <Card className="border-red-500/30 bg-red-500/5 p-4">
              <div className="flex items-start gap-3 text-red-200">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <div className="text-sm">{errorMessage}</div>
              </div>
            </Card>
          ) : null}

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">Scan Quality</div>
                  <div className="text-xs text-slate-400">Based on image clarity and file size</div>
                </div>
              </div>
              <div className="text-lg font-bold text-white">{scanQuality}%</div>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" style={{ width: `${scanQuality}%` }} />
            </div>
            <div className="mt-3 text-xs text-slate-400">
              {selectedFile || selectedDemoId
                ? scanQuality >= 90
                  ? 'High clarity detected across label text and packaging regions.'
                  : scanQuality >= 70
                    ? 'Acceptable image quality for a valid mock OCR pass.'
                    : 'Lower quality may reduce extraction confidence; re-scan if needed.'
                : 'Add a clear image to improve scan confidence and declaration extraction.'}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20">
                <Info className="h-4 w-4" />
              </div>
              <div className="text-lg font-semibold text-white">Tips for a better scan</div>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" /> Capture the complete label</li>
              <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" /> Avoid blur</li>
              <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" /> Ensure text is readable</li>
              <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" /> Use good lighting</li>
            </ul>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-300 ring-1 ring-red-500/20">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="text-lg font-semibold text-white">Image requirements</div>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center justify-between"><span>Formats</span><span className="text-white">JPG, PNG, WEBP</span></div>
              <div className="flex items-center justify-between"><span>Size</span><span className="text-white">Up to 10 MB</span></div>
              <div className="flex items-center justify-between"><span>Camera status</span><span className="text-white">{cameraStatus}</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
