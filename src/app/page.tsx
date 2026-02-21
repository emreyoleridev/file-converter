import { Converter } from "@/components/converter";
import { Sparkles, Replace } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 font-sans selection:bg-orange-500/30 transition-colors duration-500 overflow-hidden relative">

      {/* Grid Pattern overlay for texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* Immersive Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-[#E0E7FF]/70 to-[#F3E8FF]/70 dark:from-[#E0E7FF]/5 dark:to-[#F3E8FF]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-[#FFE4E6]/70 to-[#FFF1F2]/70 dark:from-[#FFE4E6]/5 dark:to-[#FFF1F2]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] right-[0%] w-[40%] h-[40%] bg-gradient-to-bl from-[#E0F2FE]/60 to-[#F0F9FF]/60 dark:from-[#E0F2FE]/5 dark:to-[#F0F9FF]/5 blur-[120px] rounded-full pointer-events-none" />


      <div className="max-w-[1200px] mx-auto pt-4 pb-24 px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">

        {/* Home Hero Content */}
        <div className="text-center space-y-6 max-w-4xl mx-auto mb-16 px-4">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-white/90 dark:bg-black/40 border border-[#E5E7EB] dark:border-white/10 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.02)] transition-all cursor-default scale-95">
            <Sparkles className="w-4 h-4 text-[#F97316]" />
            <span className="text-[12px] font-bold tracking-widest uppercase text-[#F97316]">
              100% Free & Secure
            </span>
          </div>

          <h1 className="text-7xl sm:text-8xl md:text-[6.5rem] font-bold tracking-tighter text-[#111827] dark:text-white leading-[0.9] mt-2">
            File{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F97316]">
              Converter
            </span>
          </h1>

          <p className="text-[22px] text-slate-500 dark:text-slate-400 font-semibold max-w-2xl mx-auto leading-tight mt-6">
            Instantly transform any file locally in your browser.
            <br className="hidden sm:inline" /> Zero uploads, limitless possibilities.
          </p>
        </div>

        <Converter />
      </div>
    </div>
  );
}
