import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="packsure-footer border-t shadow-[inset_0_1px_0_rgba(34,211,238,0.06)]"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 text-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-[0_8px_24px_rgba(34,211,238,0.18)]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="packsure-footer-brand text-base font-semibold tracking-[0.16em]">PACKSURE</div>
            <div className="packsure-footer-tagline text-[10px] uppercase tracking-[0.22em]">Trust Every Label</div>
          </div>
        </div>

        <div className="packsure-footer-copy">© 2026 PackSure. Modern compliance verification for packaged goods.</div>
      </div>
    </motion.footer>
  );
}
