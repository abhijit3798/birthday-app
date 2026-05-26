import { ArrowLeft, Sparkles, Cloud, Wand2, Paintbrush, Layout } from 'lucide-react';

export function ProView({ onBack }) {
  const features = [
    {
      icon: <Cloud className="w-5 h-5 text-blue-500" />,
      title: "Real-time Cloud Sync",
      desc: "Backup and sync your birthdays across all your devices securely."
    },
    {
      icon: <Wand2 className="w-5 h-5 text-purple-500" />,
      title: "AI Wishes Generator",
      desc: "Generate custom, personalized birthday wishes with a single click."
    },
    {
      icon: <Layout className="w-5 h-5 text-emerald-500" />,
      title: "Home Screen Widgets",
      desc: "Beautiful widgets to track upcoming birthdays right from your home screen."
    },
    {
      icon: <Paintbrush className="w-5 h-5 text-pink-500" />,
      title: "Premium Custom Themes",
      desc: "Unlock gorgeous custom styling options and premium app icons."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#f2f5fa] dark:bg-[#0b0f19] flex flex-col items-center animate-fade-in relative pb-10 select-none">
      
      <div className="w-full max-w-[440px] px-4 safe-pt flex flex-col gap-6">
        
        {/* Navigation Header */}
        <header className="w-full flex justify-between items-center bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-3xl p-3.5 shadow-sm">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-50 dark:hover:bg-[#1e293b] rounded-full transition-all text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 cursor-pointer flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          
          <h1 className="text-base font-extrabold text-[#F2591D] font-headings tracking-tight">
            Birthday Pro
          </h1>
          
          {/* Symmetrical placeholder */}
          <div className="w-9 h-9"></div>
        </header>

        {/* Hero Card */}
        <div className="bg-gradient-to-br from-indigo-600 via-[#F2591D] to-orange-500 rounded-[32px] p-6 text-white text-center shadow-xl relative overflow-hidden flex flex-col items-center">
          {/* Subtle glowing overlay */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none"></div>
          
          {/* Floating Sparkles */}
          <div className="w-14 h-14 bg-white/10 rounded-3xl flex items-center justify-center mb-4 shadow-inner relative z-10 animate-bounce">
            <Sparkles className="w-8 h-8 text-yellow-300 fill-yellow-300" />
          </div>
          
          <h2 className="text-2xl font-black font-headings tracking-tight mb-2 relative z-10">
            Go Premium!
          </h2>
          <p className="text-xs text-white/80 font-medium max-w-[260px] leading-relaxed relative z-10">
            Unlock advanced capabilities and design layouts to celebrate every special moment.
          </p>

          <div className="mt-6 px-6 py-2 bg-white/15 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest relative z-10 animate-pulse border border-white/20">
            Coming Soon
          </div>
        </div>

        {/* Features Checklist */}
        <div className="bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-[32px] p-5 shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
            Exclusive Features
          </h3>

          <div className="flex flex-col gap-4">
            {features.map((feat, idx) => (
              <div key={idx} className="flex gap-4 items-start p-1.5 rounded-2xl hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                <div className="p-2.5 bg-slate-50 dark:bg-[#0c1220] rounded-xl shrink-0 shadow-sm border border-slate-100/50 dark:border-[#222e45]/50 flex items-center justify-center">
                  {feat.icon}
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {feat.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold mt-1 leading-normal">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

export default ProView;
