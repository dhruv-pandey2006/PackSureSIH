import { motion } from 'framer-motion';

type Step = {
  title: string;
  description: string;
};

type ScanStepsProps = {
  steps: Step[];
};

export function ScanSteps({ steps }: ScanStepsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{
            y: -2,
            borderColor: 'rgba(34,211,238,0.35)',
            boxShadow: '0 0 0 1px rgba(34,211,238,0.08), 0 16px 28px rgba(14,165,233,0.08)',
            transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
          }}
          className="glass-panel rounded-2xl p-5"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.42, delay: 0.12 + index * 0.12, ease: 'easeOut' }}
            className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-sm font-bold text-cyan-200 ring-1 ring-inset ring-cyan-500/20"
          >
            0{index + 1}
          </motion.div>
          <div className="mb-2 text-lg font-semibold text-white">{step.title}</div>
          <p className="text-sm leading-6 text-slate-400">{step.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
