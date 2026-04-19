import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Share2, Zap, Target, ArrowRight, Loader2, Moon, Sun } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const FEATURES = [
  { icon: Share2, label: 'Neural Memory', desc: 'AI that learns your thinking style across every session' },
  { icon: Target, label: 'Deep Discovery', desc: '12+ frameworks — from IDEO to Amazon Working Backwards' },
  { icon: Zap, label: 'Gemini Powered', desc: 'Your Google account. Your AI. Zero setup.' },
];

export default function LoginOverlay({ isDarkMode, toggleDarkMode }: { isDarkMode: boolean, toggleDarkMode: () => void }) {
  const { login, isLoading } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated particle field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.6 + 0.3,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.classList.contains('dark');
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        // Green in dark mode, darker beige in light mode to contrast against cream
        ctx.fillStyle = isDark ? `rgba(16, 185, 129, ${p.alpha * 1.5})` : `rgba(145, 135, 125, ${p.alpha * 1.5})`;
        ctx.fill();
      });
      // Draw soft connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.strokeStyle = isDark
              ? `rgba(16, 185, 129, ${0.3 * (1 - dist / 140)})`
              : `rgba(145, 135, 125, ${0.4 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, [isDarkMode]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[var(--color-cream)] transition-colors duration-500">
      
      {/* Dark mode toggle header */}
      <div className="absolute top-0 right-0 p-6 z-50">
        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] flex items-center justify-center hover:bg-[var(--color-cream-warm)] text-[var(--color-ink)] hover:shadow-sm transition-all shadow-sm"
        >
          {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Gradient orbs - updated to use CSS variables for mode matching */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[var(--color-sage)] opacity-10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[var(--color-lavender)] opacity-10 blur-[100px] pointer-events-none z-0" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo strip */}
        <div className="flex flex-col items-center justify-center mb-8 gap-1 select-none">
          <div className="flex items-center text-3xl leading-none">
            <span className="font-sans font-bold text-[#E05D36]">PS</span>
            <span className="font-sans font-bold text-neutral-300 dark:text-neutral-600 mx-2 -translate-y-0.5">/</span>
            <span className="font-mono font-medium text-[var(--color-ink)] tracking-tight">problemspace</span>
          </div>
          <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-ink-muted)] mt-1">Design Discovery Engine</span>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-cream)]/80 backdrop-blur-2xl shadow-xl shadow-black/5 dark:shadow-black/40 overflow-hidden">
          {/* Header band */}
          <div className="px-8 py-6 bg-[var(--color-cream-warm)] border-b border-[var(--color-border)]">
            <h1 className="text-xl font-bold text-[var(--color-ink)] leading-tight">
              Welcome back.
            </h1>
            <p className="text-sm text-[var(--color-ink-light)] mt-1 font-medium">
              Sign in with Google to continue your discovery session.
            </p>
          </div>

          <div className="px-8 py-8 flex flex-col gap-6">
            {/* Feature list */}
            <div className="flex flex-col gap-4">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.4, ease: 'easeOut' }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-cream-warm)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-[var(--color-ink)]" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[var(--color-ink)]">{f.label}</span>
                    <span className="block text-[11px] text-[var(--color-ink-muted)] leading-relaxed mt-0.5">{f.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[var(--color-border)]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Continue with</span>
              <div className="flex-1 h-px bg-[var(--color-border)]" />
            </div>

            {/* Google Sign-In Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => login()}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[var(--color-ink)] text-[var(--color-cream)] font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed border border-[var(--color-ink)]"
            >
              {isLoading ? (
               <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="bg-white p-1 rounded-full">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
              )}
              {isLoading ? 'Connecting...' : 'Sign in with Google'}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-auto opacity-70" />}
            </motion.button>

            {/* Fine print */}
            <p className="text-center text-[10px] text-[var(--color-ink-muted)] leading-relaxed font-medium">
              Your API calls use your own Google Gemini quota.
              <br />No data is stored on our servers.
            </p>
          </div>
        </div>

        {/* Bottom tag */}
        <p className="mt-8 text-center text-[9px] font-bold text-[var(--color-ink-muted)] opacity-60 uppercase tracking-[0.2em]">
          ProblemSpace · Design Discovery · v2
        </p>
      </motion.div>
    </div>
  );
}
