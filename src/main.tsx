import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import './index.css';
import App from './App.tsx';

const darkClerkAppearance = {
  variables: {
    colorPrimary: '#22d3ee',
    colorPrimaryForeground: '#020817',
    colorBackground: '#020817',
    colorBackgroundSecondary: '#0f172a',
    colorInputBackground: '#0b1120',
    colorInputForeground: '#f8fafc',
    colorText: '#f8fafc',
    colorTextSecondary: '#cbd5e1',
    colorNeutral: '#94a3b8',
    colorDanger: '#f87171',
    colorSuccess: '#34d399',
    colorWarning: '#fbbf24',
    borderRadius: '18px',
    fontFamily: 'Inter, "Segoe UI", sans-serif',
    colorShadow: 'rgba(2, 6, 23, 0.52)',
  },
  elements: {
    rootBox: { width: '100%', background: 'transparent', boxShadow: 'none' },
    card: { background: 'rgba(15, 23, 42, 0.84)', border: '1px solid rgba(148, 163, 184, 0.18)', boxShadow: '0 28px 80px rgba(2, 6, 23, 0.54)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' },
    main: { background: 'transparent', padding: '0' },
    headerTitle: { color: '#f8fafc', fontWeight: '700' },
    headerSubtitle: { color: '#cbd5e1' },
    formFieldLabel: { color: '#cbd5e1', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: '600' },
    formFieldInput: { backgroundColor: 'rgba(15, 23, 42, 0.78)', border: '1px solid rgba(148, 163, 184, 0.22)', color: '#f8fafc', boxShadow: 'none', '&::placeholder': { color: 'rgba(148, 163, 184, 0.8)' }, '&:hover::placeholder': { color: 'rgba(203, 213, 225, 0.9)' }, '&:focus::placeholder': { color: 'rgba(203, 213, 225, 0.9)' }, '&:focus': { borderColor: 'rgba(34, 211, 238, 0.7)', boxShadow: '0 0 0 3px rgba(34, 211, 238, 0.14)' } },
    formButtonPrimary: { background: 'linear-gradient(135deg, #67e8f9 0%, #38bdf8 48%, #2563eb 100%)', color: '#020817', fontWeight: '700', border: 'none', boxShadow: '0 14px 30px rgba(59, 130, 246, 0.28)', '&:hover': { opacity: 0.98 } },
    socialButtonsBlockButton: { backgroundColor: 'rgba(15, 23, 42, 0.76)', border: '1px solid rgba(148, 163, 184, 0.18)', color: '#e2e8f0', '&:hover': { backgroundColor: 'rgba(15, 23, 42, 0.9)' } },
    dividerLine: { backgroundColor: 'rgba(148, 163, 184, 0.2)' },
    dividerText: { color: '#94a3b8' },
    footerActionText: { color: '#cbd5e1' },
    footerActionLink: { color: '#67e8f9', fontWeight: '600' },
    formFieldAction: { color: '#cbd5e1' },
    otpCodeFieldInput: { backgroundColor: 'rgba(15, 23, 42, 0.82)', border: '1px solid rgba(148, 163, 184, 0.22)', color: '#f8fafc' },
    verificationCodeField: { backgroundColor: 'rgba(15, 23, 42, 0.82)', border: '1px solid rgba(148, 163, 184, 0.22)', color: '#f8fafc' },
    formResendCodeLink: { color: '#67e8f9' },
    formHeader: { borderBottom: 'none' },
    form: { background: 'transparent' },
    body: { background: 'transparent' },
  },
};

const lightClerkAppearance = {
  variables: {
    colorPrimary: '#22c7e8',
    colorPrimaryForeground: '#0f172a',
    colorBackground: '#ffffff',
    colorBackgroundSecondary: '#f8fafc',
    colorInputBackground: '#ffffff',
    colorInputForeground: '#0f172a',
    colorText: '#0f172a',
    colorTextSecondary: '#475569',
    colorNeutral: '#64748b',
    colorDanger: '#ef4444',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    borderRadius: '18px',
    fontFamily: 'Inter, "Segoe UI", sans-serif',
    colorShadow: 'rgba(15, 23, 42, 0.08)',
  },
  elements: {
    rootBox: { width: '100%', background: 'transparent', boxShadow: 'none' },
    card: { background: 'rgba(255, 255, 255, 0.96)', border: '1px solid rgba(148, 163, 184, 0.26)', boxShadow: '0 20px 56px rgba(15, 23, 42, 0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' },
    main: { background: 'transparent', padding: '0' },
    headerTitle: { color: '#0f172a', fontWeight: '700' },
    headerSubtitle: { color: '#475569' },
    formFieldLabel: { color: '#475569', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: '600' },
    formFieldInput: { backgroundColor: '#ffffff', border: '1px solid rgba(148, 163, 184, 0.4)', color: '#0f172a', boxShadow: 'none', '&::placeholder': { color: '#64748b' }, '&:hover::placeholder': { color: '#475569' }, '&:focus::placeholder': { color: '#475569' }, '&:focus': { borderColor: 'rgba(34, 211, 238, 0.8)', boxShadow: '0 0 0 3px rgba(34, 211, 238, 0.12)' } },
    formButtonPrimary: { background: 'linear-gradient(135deg, #67e8f9 0%, #38bdf8 48%, #2563eb 100%)', color: '#0f172a', fontWeight: '700', border: 'none', boxShadow: '0 12px 24px rgba(59, 130, 246, 0.18)', '&:hover': { opacity: 0.98 } },
    socialButtonsBlockButton: { backgroundColor: '#ffffff', border: '1px solid rgba(148, 163, 184, 0.36)', color: '#0f172a', '&:hover': { backgroundColor: '#f8fafc' } },
    dividerLine: { backgroundColor: 'rgba(148, 163, 184, 0.32)' },
    dividerText: { color: '#64748b' },
    footerActionText: { color: '#475569' },
    footerActionLink: { color: '#0ea5d8', fontWeight: '600' },
    formFieldAction: { color: '#475569' },
    otpCodeFieldInput: { backgroundColor: '#ffffff', border: '1px solid rgba(148, 163, 184, 0.4)', color: '#0f172a' },
    verificationCodeField: { backgroundColor: '#ffffff', border: '1px solid rgba(148, 163, 184, 0.4)', color: '#0f172a' },
    formResendCodeLink: { color: '#0ea5d8' },
    formHeader: { borderBottom: 'none' },
    form: { background: 'transparent' },
    body: { background: 'transparent' },
  },
};

function getClerkAppearance(theme: 'light' | 'dark') {
  return theme === 'light' ? lightClerkAppearance : darkClerkAppearance;
}

function AppWithClerkTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    const syncTheme = () => {
      const nextTheme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
      setTheme(nextTheme);
    };

    syncTheme();
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'data-theme') {
          syncTheme();
          break;
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY} appearance={getClerkAppearance(theme)}>
      <App />
    </ClerkProvider>
  );
}

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  createRoot(document.getElementById('root')!).render(
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#020b17', color: '#e2e8f0', fontFamily: 'sans-serif', padding: 24 }}>
      Please add your Clerk publishable key to the VITE_CLERK_PUBLISHABLE_KEY environment variable.
    </div>,
  );
} else {
  createRoot(document.getElementById('root')!).render(
    <AppWithClerkTheme />,
  );
}
