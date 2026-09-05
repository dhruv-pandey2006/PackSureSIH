import { ShieldCheck } from 'lucide-react';
import { Card } from '../components/common/Card';
import { ScanSteps } from '../components/common/ScanSteps';
import { aboutSteps } from '../services/mockData';

export function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">How it works</div>
        <h1 className="text-4xl font-bold text-white sm:text-5xl">How PackSure Works</h1>
        <p className="mt-4 text-lg leading-8 text-slate-300">PackSure helps teams review packaged goods quickly, explain compliance gaps clearly, and support faster decisions around legal packaging declarations.</p>
      </div>

      <ScanSteps steps={aboutSteps} />

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Built for smarter compliance</div>
              <h2 className="mt-2 text-2xl font-bold text-white">Focused on packaging clarity.</h2>
            </div>
          </div>
          <p className="leading-8 text-slate-300">PackSure is designed for packaged commodities that need to comply with the Legal Metrology (Packaged Commodities) Rules, 2011. The product focuses on making compliance checks more transparent, faster, and easier for teams working with label and packaging review workflows.</p>
        </Card>

        <Card className="p-7">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Framework</div>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">Legal Metrology (Packaged Commodities) Rules, 2011</div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">Mandatory declaration review</div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">Explainable compliance reporting</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
