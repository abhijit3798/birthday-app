import { ArrowLeft, ShieldCheck, Database, ServerCrash, EyeOff } from 'lucide-react';

export function PrivacyPolicy({ onBack }) {
  return (
    <div className="w-full min-h-screen bg-[#f2f5fa] dark:bg-[#0b0f19] flex flex-col items-center animate-fade-in relative pb-10 select-none">
      
      <div className="w-full max-w-[440px] px-4 pt-6 flex flex-col gap-6">
        
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
            Privacy Policy
          </h1>
          
          <div className="w-9 h-9"></div>
        </header>

        {/* Policy Content Card */}
        <div className="bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-[32px] p-6 shadow-sm flex flex-col gap-6">
          
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-[#222e45] pb-4">
            <div className="w-10 h-10 bg-green-500/10 dark:bg-green-500/20 text-green-500 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Your Data is Yours</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-0.5">100% Private & Local</p>
            </div>
          </div>

          <div className="space-y-5 text-left">
            {/* Local Storage */}
            <div className="flex gap-3.5 items-start">
              <div className="p-2 bg-slate-50 dark:bg-[#0c1220] rounded-lg shrink-0 text-slate-500 border border-slate-100 dark:border-[#222e45]">
                <Database className="w-4 h-4 text-[#F2591D]" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Local-First Storage</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold mt-1 leading-normal">
                  All birthday dates, names, email addresses, phone numbers, notes, and profile pictures are stored entirely inside your device's local database (IndexedDB and LocalStorage).
                </p>
              </div>
            </div>

            {/* No Server Transmission */}
            <div className="flex gap-3.5 items-start">
              <div className="p-2 bg-slate-50 dark:bg-[#0c1220] rounded-lg shrink-0 text-slate-500 border border-slate-100 dark:border-[#222e45]">
                <ServerCrash className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No External Servers</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold mt-1 leading-normal">
                  This application does not connect to or host any server-side database. Your personal info is never uploaded, tracked, or shared across any networks.
                </p>
              </div>
            </div>

            {/* Permissions */}
            <div className="flex gap-3.5 items-start">
              <div className="p-2 bg-slate-50 dark:bg-[#0c1220] rounded-lg shrink-0 text-slate-500 border border-slate-100 dark:border-[#222e45]">
                <EyeOff className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Camera Permissions</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold mt-1 leading-normal">
                  Camera access is requested solely to capture profile photos locally. Captured pictures are immediately encoded to local base64 strings and are not transmitted.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-[#222e45] pt-4 text-center mt-2">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Last Updated: May 2026
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default PrivacyPolicy;
