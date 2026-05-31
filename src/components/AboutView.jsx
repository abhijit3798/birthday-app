import { ArrowLeft } from 'lucide-react';

export function AboutView({ onBack }) {
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
            About App
          </h1>
          
          <div className="w-9 h-9"></div>
        </header>

        {/* Content Card */}
        <div className="bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-[32px] p-6 shadow-sm flex flex-col items-center text-center gap-6">
          
          {/* App Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#F2591D]/15 dark:bg-[#F2591D]/25 rounded-3xl blur-md"></div>
            <img 
              src="/favicon.svg" 
              alt="Birthday Reminder App Icon" 
              className="w-20 h-20 rounded-3xl relative z-10 border border-slate-100 dark:border-[#222e45] p-2 bg-white dark:bg-[#151c2c] shadow-sm"
            />
          </div>

          {/* Headline details exactly as written */}
          <div className="flex flex-col items-center w-full">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-headings tracking-tight">
              Birthday Reminder
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1.5">
              Version 1.0
            </p>
          </div>

          <div className="w-full border-t border-slate-100 dark:border-[#222e45]"></div>

          <div className="flex flex-col gap-5 text-sm text-slate-600 dark:text-slate-300 font-semibold px-2 w-full">
            <div>
              <p className="font-extrabold text-slate-800 dark:text-slate-100">
                Developed by Stark Labs AI
              </p>
            </div>
            
            <div className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              <p>© 2026 Stark Labs AI</p>
              <p>All Rights Reserved.</p>
            </div>

            <p className="leading-relaxed text-xs text-slate-500 dark:text-slate-400 font-semibold border-t border-slate-100 dark:border-[#222e45] pt-5 px-1">
              Birthday Reminder helps you manage birthdays, special dates, and reminder notifications so you never miss an important celebration.
            </p>

            <p className="text-xs text-[#F2591D] font-extrabold tracking-wide mt-1">
              Thank you for using Birthday Reminder.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default AboutView;
