import { ArrowLeft, Calendar, Clock, BellRing, Smartphone } from 'lucide-react';

export function CalendarComingSoon({ onBack }) {
  const upcomingFeatures = [
    {
      icon: <BellRing className="w-5 h-5 text-amber-500" />,
      title: "Automatic Calendar Sync",
      desc: "Automatically sync all upcoming birthdays to your Google Calendar, Apple Calendar, or Outlook."
    },
    {
      icon: <Clock className="w-5 h-5 text-indigo-500" />,
      title: "Custom Alert Times",
      desc: "Configure exactly when you want your system calendar to notify you of the event."
    },
    {
      icon: <Smartphone className="w-5 h-5 text-emerald-500" />,
      title: "Device Lockscreen Alerts",
      desc: "Get native system alerts on your phone or desktop lockscreen before the big day."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#f2f5fa] dark:bg-[#0b0f19] flex flex-col items-center animate-fade-in relative safe-pb-container select-none">
      
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
            Add to Calendar
          </h1>
          
          <div className="w-9 h-9"></div>
        </header>

        {/* Hero Card */}
        <div className="bg-gradient-to-br from-red-500 via-[#F2591D] to-orange-500 rounded-[32px] p-6 text-white text-center shadow-xl relative overflow-hidden flex flex-col items-center">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none"></div>
          
          <div className="w-14 h-14 bg-white/10 rounded-3xl flex items-center justify-center mb-4 shadow-inner relative z-10 animate-bounce">
            <Calendar className="w-8 h-8 text-yellow-300" />
          </div>
          
          <h2 className="text-2xl font-black font-headings tracking-tight mb-2 relative z-10">
            Coming Soon!
          </h2>
          <p className="text-xs text-white/80 font-medium max-w-[260px] leading-relaxed relative z-10">
            We are working on bringing direct, seamless calendar integrations directly to your device.
          </p>

          <div className="mt-6 px-6 py-2 bg-white/15 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest relative z-10 animate-pulse border border-white/20">
            In Development
          </div>
        </div>

        {/* Feature List */}
        <div className="bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-[32px] p-5 shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
            What's Next
          </h3>

          <div className="flex flex-col gap-4">
            {upcomingFeatures.map((feat, idx) => (
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

export default CalendarComingSoon;
