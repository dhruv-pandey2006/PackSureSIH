import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth as useClerkAuth } from '@clerk/react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, ScanSearch } from 'lucide-react';
import { Card } from '../components/common/Card';
import { ProgressIndicator } from '../components/common/ProgressIndicator';
import { analyzeProduct } from '../services/api';

const stageFlow = [
  'Uploading image...',
  'Detecting label...',
  'Extracting declarations...',
  'Validating compliance...',
  'Generating report...',
];

export function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const payload = (location.state as { files?: File[]; file?: File | null; demoProductId?: string; fileName?: string; imageUrl?: string | null } | null) ?? {};
  const analysisStartedRef = useRef(false);

  const { getToken } = useClerkAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [progress, setProgress] = useState(12);
  const [status, setStatus] = useState(stageFlow[0]);
  const [detectedFields, setDetectedFields] = useState(14);
  const [stages, setStages] = useState([
    { label: 'Uploading image...', done: true },
    { label: 'Detecting label...', done: false, active: true },
    { label: 'Extracting declarations...', done: false },
    { label: 'Validating compliance...', done: false },
    { label: 'Generating report...', done: false },
  ]);

  useEffect(() => {
  const timers = [
    window.setTimeout(() => {
      setProgress(32);
      setDetectedFields(28);
      setStatus(stageFlow[1]);
      setStages([
        { label: 'Uploading image...', done: true },
        { label: 'Detecting label...', done: true },
        { label: 'Extracting declarations...', done: false, active: true },
        { label: 'Validating compliance...', done: false },
        { label: 'Generating report...', done: false },
      ]);
    }, 700),

    window.setTimeout(() => {
      setProgress(58);
      setDetectedFields(64);
      setStatus(stageFlow[2]);
      setStages([
        { label: 'Uploading image...', done: true },
        { label: 'Detecting label...', done: true },
        { label: 'Extracting declarations...', done: true },
        { label: 'Validating compliance...', done: false, active: true },
        { label: 'Generating report...', done: false },
      ]);
    }, 1700),

    window.setTimeout(() => {
      setProgress(82);
      setDetectedFields(82);
      setStatus(stageFlow[3]);
      setStages([
        { label: 'Uploading image...', done: true },
        { label: 'Detecting label...', done: true },
        { label: 'Extracting declarations...', done: true },
        { label: 'Validating compliance...', done: true },
        { label: 'Generating report...', done: false, active: true },
      ]);
    }, 2600),
  ];

  const runAnalysis = async () => {
    try {
      const result = await analyzeProduct(payload, getTokenRef.current);

      setProgress(100);
      setDetectedFields(100);
      setStatus(stageFlow[4]);
      setStages([
        { label: 'Uploading image...', done: true },
        { label: 'Detecting label...', done: true },
        { label: 'Extracting declarations...', done: true },
        { label: 'Validating compliance...', done: true },
        { label: 'Generating report...', done: true },
      ]);

      navigate(`/report/${result.id}`, { replace: true });
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  if (!analysisStartedRef.current) {
    analysisStartedRef.current = true;
    runAnalysis();
  }

  return () => timers.forEach((timer) => window.clearTimeout(timer));
}, [navigate, location.state]);

  return (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl">
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_32%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-6 flex items-center gap-3 text-cyan-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
                  <ScanSearch className="h-5 w-5" />
                </div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em]">Scan in progress</div>
              </div>

              <div className="text-3xl font-bold text-white sm:text-4xl">Analyzing your product...</div>
              <div className="mt-3 text-sm text-slate-300">{status}</div>

              <div className="mt-8">
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400" />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {detectedFields} fields detected
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-300">
                  <Activity className="h-3.5 w-3.5 text-cyan-300" /> Real-time review
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-800 bg-slate-950/80 p-4">
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Processing stages</div>
              <div className="text-left">
                <ProgressIndicator items={stages} />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
