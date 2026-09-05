import { ArrowRight, CheckCircle2, FileSearch, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { MetricCard } from '../components/common/MetricCard';
import { ScanSteps } from '../components/common/ScanSteps';
import { landingMetrics, aboutSteps } from '../services/mockData';

const reasons = [
  'Automated label verification',
  'Rule-based compliance',
  'Explainable violations',
  'Evidence-based reports',
];

export function LandingPage() {
  const scoreDisplay = 92;
  const isLightTheme = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light';

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-[54px] sm:px-6 lg:px-8 lg:pt-[54px]">
      <section className="landing-hero glass-panel-strong relative overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(135deg,rgba(2,6,23,0.88),rgba(15,23,42,0.82),rgba(11,17,32,0.9))] p-6 shadow-[0_35px_90px_rgba(2,6,23,0.68)] sm:p-10 lg:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_30%)]" />
        <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="hero-kicker mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200"
            >
              <Sparkles className="h-3.5 w-3.5" /> Demo Compliance Flow
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: 'easeOut', delay: 0.12 }}
              className="landing-hero-title max-w-xl text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl lg:text-[4.2rem]"
            >
              Verify Every Label.
              <span className="block text-cyan-300">Trust Every Product.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.56, ease: 'easeOut', delay: 0.2 }}
              className="landing-hero-copy mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg"
            >
              Legal Metrology packaging review for sample product declarations and compliance checks in a presentation-ready demo.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, ease: 'easeOut', delay: 0.3 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link to="/scan">
                <Button variant="primary" icon={<ArrowRight className="h-4 w-4" />}>Scan a Product</Button>
              </Link>
              <Link to="/about">
                <Button variant="secondary">How It Works</Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, ease: 'easeOut', delay: 0.36 }}
              className="mt-8 flex flex-wrap items-center gap-5 text-xs uppercase tracking-[0.2em] text-slate-400"
            >
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Label checks</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-cyan-400" /> Rule audit</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-violet-400" /> Explainable results</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.62, ease: 'easeOut', delay: 0.32 }}
            className="lg:translate-y-[18px]"
          >
            <Card className={isLightTheme ? 'landing-hero-card relative overflow-hidden border-slate-200 bg-white/95 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-5' : 'landing-hero-card relative overflow-hidden border-slate-700/80 bg-slate-950/80 p-4 sm:p-5'}>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.14),_transparent_28%)]" />
              <div className="relative mb-4 flex items-center justify-between">
                <div className={isLightTheme ? 'flex items-center gap-2 text-sm text-slate-700' : 'flex items-center gap-2 text-sm text-slate-300'}>
                  <ShieldCheck className="h-4 w-4 text-cyan-300" /> Compliance Lens
                </div>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                  Live Scan
                </span>
              </div>

              <div className={isLightTheme ? 'relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)]' : 'relative overflow-hidden rounded-[24px] border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)]'}>
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-cyan-500/8 to-transparent" />
                <div className="relative mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className={isLightTheme ? 'text-2xl font-bold text-slate-900' : 'text-2xl font-bold text-white'}>Apex Protein Crunch</div>
                    <div className={isLightTheme ? 'text-xs text-slate-500' : 'text-xs text-slate-400'}>500 g • MRP ₹189.00</div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/20">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>

                <div className={isLightTheme ? 'relative space-y-3 text-sm text-slate-600' : 'relative space-y-3 text-sm text-slate-300'}>
                  <div className={isLightTheme ? 'flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5' : 'flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5'}>
                    <span>Manufacturer</span>
                    <span className={isLightTheme ? 'font-medium text-slate-900' : 'font-medium text-white'}>Apex Foods Pvt. Ltd.</span>
                  </div>
                  <div className={isLightTheme ? 'flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5' : 'flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5'}>
                    <span>Net Quantity</span>
                    <span className={isLightTheme ? 'font-medium text-slate-900' : 'font-medium text-white'}>500 g</span>
                  </div>
                  <div className={isLightTheme ? 'flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5' : 'flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5'}>
                    <span>Consumer Care</span>
                    <span className={isLightTheme ? 'font-medium text-slate-900' : 'font-medium text-white'}>1800-123-4567</span>
                  </div>
                </div>

                <div className={isLightTheme ? 'relative mt-5 rounded-2xl border border-cyan-200 bg-cyan-50/80 p-3 shadow-[0_0_20px_rgba(34,211,238,0.06)]' : 'relative mt-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-3 shadow-[0_0_24px_rgba(34,211,238,0.08)]'}>
                  <div className="flex items-center justify-between">
                    <span className={isLightTheme ? 'text-sm text-cyan-700' : 'text-sm text-cyan-200'}>Compliance score</span>
                    <span className={isLightTheme ? 'text-xl font-bold text-slate-900' : 'text-xl font-bold text-white'}>{scoreDisplay} / 100</span>
                  </div>
                  <div className={isLightTheme ? 'mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200' : 'mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800'}>
                    <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="pt-8 sm:pt-10 lg:pt-10">
        <div className="mb-8 text-center sm:mb-10">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">How PackSure Works</div>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">A smarter, explainable approval flow.</h2>
        </div>
        <ScanSteps steps={aboutSteps} />
      </section>

      <section className="py-10">
        <div className="mb-10 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Why PackSure</div>
          <h2 className="mt-3 text-3xl font-bold text-white">Built for confident compliance decisions.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reasons.map((reason, index) => (
            <Card key={reason} interactive className="h-full">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/10 text-cyan-200 ring-1 ring-cyan-500/20">
                <span className="text-sm font-bold text-cyan-300">0{index + 1}</span>
              </div>
              <div className="text-lg font-semibold text-white">{reason}</div>
              <div className="mt-3 text-sm leading-6 text-slate-400">Designed to help teams review packaging declarations faster and with more confidence.</div>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-14">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {landingMetrics.map((metric, index) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              accent={index % 2 === 0 ? 'cyan' : index % 3 === 0 ? 'emerald' : 'amber'}
              icon={<FileSearch className="h-4 w-4 text-slate-300" />}
            />
          ))}
        </div>
      </section>

      <section className="pt-8">
        <Card className="border-cyan-500/20 bg-[linear-gradient(135deg,rgba(6,182,212,0.14),rgba(15,23,42,0.7))] p-8 text-center shadow-[0_18px_52px_rgba(14,165,233,0.12)]">
          <div className="mx-auto max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Ready to verify</div>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Start validating labels with more clarity.</h2>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/scan">
                <Button variant="primary" icon={<ArrowRight className="h-4 w-4" />}>Scan a Product</Button>
              </Link>
              <Link to="/history">
                <Button variant="secondary">View History</Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
