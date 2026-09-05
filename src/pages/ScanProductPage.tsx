import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Camera, Info, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ProductPreview } from '../components/scan/ProductPreview';
import { UploadZone } from '../components/scan/UploadZone';
import { demoProducts, getScanQuality } from '../services/ocrService';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

export function ScanProductPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewUrlsRef = useRef<string[]>([]);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<string>('Camera ready when available');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }

    return () => {
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraStream]);

  // Recompute the "primary" image's natural dimensions (used only for the
  // cosmetic Scan Quality heuristic) whenever the first selected image changes.
  useEffect(() => {
    const primaryPreview = previewUrls[0];

    if (!primaryPreview) {
      setDimensions(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
    };
    img.src = primaryPreview;
  }, [previewUrls]);

  // Keep a ref of the latest preview URLs so the unmount cleanup below can
  // revoke whatever is currently selected, not just what existed at mount.
  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleFilesAdd = (incomingFiles: File[]) => {
    if (incomingFiles.length === 0) return;

    const validFiles: File[] = [];
    let rejectionMessage: string | null = null;

    for (const file of incomingFiles) {
      if (!allowedTypes.includes(file.type)) {
        rejectionMessage = 'Unsupported file type. Please upload JPG, PNG or WEBP images.';
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        rejectionMessage = 'One or more images exceed 10 MB. Please choose smaller files.';
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSelectedDemoId(null);
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setPreviewUrls((prev) => [...prev, ...validFiles.map((file) => URL.createObjectURL(file))]);
    }

    setErrorMessage(rejectionMessage);
  };

  const handleFileRemove = (index: number) => {
    setPreviewUrls((prev) => {
      const removedUrl = prev[index];
      if (removedUrl) {
        URL.revokeObjectURL(removedUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setErrorMessage(null);
  };

  const handleSelectDemo = (demoId: string) => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setErrorMessage(null);
    setSelectedDemoId(demoId);
  };

  const handleAnalyze = () => {
    if (selectedFiles.length === 0 && !selectedDemoId) return;

    const payload = selectedDemoId
      ? { demoProductId: selectedDemoId }
      : { files: selectedFiles, fileName: selectedFiles[0]?.name, imageUrl: previewUrls[0] ?? undefined };

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
      setCameraStream(stream);
      setCameraStatus('Camera live. Frame the label and capture a photo.');
    } catch {
      setCameraStatus('Camera permission was denied. Please use file upload instead.');
    }
  };

  const handleCloseCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
  };

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        handleFilesAdd([file]);
        handleCloseCamera();
        setCameraStatus('Photo captured from camera.');
      },
      'image/jpeg',
      0.92,
    );
  };

  const fileSummary = useMemo(() => {
    if (selectedFiles.length === 1) {
      return `${selectedFiles[0].name} • ${selectedFiles[0].type || 'image file'}`;
    }
    if (selectedFiles.length > 1) {
      return `${selectedFiles.length} images selected`;
    }
    if (selectedDemoId) {
      const demo = demoProducts.find((item) => item.id === selectedDemoId);
      return demo ? `${demo.productName} • Demo product` : 'Demo product selected';
    }
    return 'Awaiting image upload';
  }, [selectedFiles, selectedDemoId]);

  const scanQuality = getScanQuality(selectedFiles[0] ?? null, dimensions);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(event) => handleFilesAdd(event.target.files ? Array.from(event.target.files) : [])}
      />
      <div className="mb-8 max-w-2xl">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Upload image</div>
        <h1 className="text-4xl font-bold text-white sm:text-5xl">Scan Your Product</h1>
        <p className="mt-3 text-base text-slate-300">Upload a clear image of the product label to check its compliance.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.75fr]">
        <div className="space-y-6">
          <Card className="p-6">
            {cameraStream ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-cyan-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">Camera preview</div>
                    <div className="text-xs text-slate-400">Frame the product label, then capture a photo.</div>
                  </div>
                </div>
                <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-2xl border border-slate-700 bg-black" />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={handleCapturePhoto} icon={<Camera className="h-4 w-4" />} fullWidth>
                    Capture Photo
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      handleCloseCamera();
                      setCameraStatus('Camera ready when available');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <UploadZone
                files={selectedFiles}
                previewUrls={previewUrls}
                onFilesAdd={handleFilesAdd}
                onFileRemove={handleFileRemove}
                onAnalyze={handleAnalyze}
                isAnalyzing={false}
                onCameraOpen={handleCameraOpen}
                canAnalyze={Boolean(selectedFiles.length > 0 || selectedDemoId)}
              />
            )}
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
                  onClick={() => handleSelectDemo(demo.id)}
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
          <ProductPreview fileName={fileSummary} width={dimensions?.width} height={dimensions?.height} imageUrls={previewUrls} />

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
              {selectedFiles.length > 0 || selectedDemoId
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
              <div className="flex items-center justify-between"><span>Size</span><span className="text-white">Up to 10 MB each</span></div>
              <div className="flex items-center justify-between"><span>Camera status</span><span className="text-white">{cameraStatus}</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
