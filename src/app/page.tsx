import { Converter } from "@/components/converter";
import { Sparkles, ShieldCheck, Zap, Heart, Github, Layout, Lock, Globe, Coffee } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-emerald-500/30 transition-colors duration-500 overflow-hidden relative">

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(5,150,105,0.3)] transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-foreground">File<span className="text-emerald-500">Converter</span></span>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://github.com/emreyoleridev" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Immersive Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">

        {/* Hero Section */}
        <div className="text-center space-y-8 mb-16 px-4">
          <div className="inline-flex items-center gap-2 py-1 px-4 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-black tracking-widest uppercase text-emerald-500">
              100% Secure & Client-Side
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1] max-w-4xl mx-auto">
            The Ultimate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-600">
              Free File Converter
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
            Convert, optimize, and manage your files directly from your browser.
            Zero uploads, zero subscriptions, maximum privacy.
          </p>
        </div>

        <Converter />

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-32 w-full max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black tracking-tight">Absolute Privacy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              Files never leave your device. Everything is processed locally in your browser.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black tracking-tight">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              No waiting for servers to process or download. Convert files instantly.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black tracking-tight">Free Forever</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              No premium tiers, no hidden costs, no watermarks. Every feature is entirely free.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-white/10 bg-white dark:bg-black py-12">
        <div className="container mx-auto px-4 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-medium">
            <span>Built with ❤️ by</span>
            <span className="text-zinc-900 dark:text-white font-bold">Emre Yoleri</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a
              href="https://github.com/emreyoleridev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all group shadow-sm"
            >
              <Github size={18} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">GitHub</span>
            </a>

            <a
              href="https://buymeacoffee.com/emreyoleridev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-all group shadow-sm"
            >
              <Coffee size={18} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">Buy Me a Coffee</span>
            </a>
          </div>
        </div>
      </footer>
      {/* Floating Theme Toggle (Optional, following user request from before) */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>
    </div>
  );
}
