import { useState } from 'react';
import { Settings, Plus, Search, X } from 'lucide-react';
import { getNextBirthday, getAgeInfo } from '../utils/dateHelpers';
import { CakeIcon } from './CakeIcon';



const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function ListView({ birthdays, onSelect, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Sanitize input array
  const safeBirthdays = (birthdays || []).filter(
    (b) => b && typeof b === 'object' && b.id && b.name && b.date
  );

  // 2. Filter by search query
  const searchedBirthdays = safeBirthdays.filter((bday) =>
    bday.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3. Sort by days remaining
  const today = new Date();
  const sorted = [...searchedBirthdays].sort((a, b) => {
    const nextA = getNextBirthday(a.date, today);
    const nextB = getNextBirthday(b.date, today);
    if (!nextA) return 1;
    if (!nextB) return -1;
    return nextA.getTime() - nextB.getTime();
  });

  // 4. Group by Month dynamically in upcoming chronological order
  const groupedByMonthList = [];
  const monthMap = {};

  sorted.forEach((bday) => {
    const nextBday = getNextBirthday(bday.date, today);
    if (nextBday) {
      const monthIndex = nextBday.getMonth();
      const monthName = MONTH_NAMES[monthIndex];
      
      if (!monthMap[monthName]) {
        const newGroup = {
          monthName,
          birthdays: []
        };
        monthMap[monthName] = newGroup;
        groupedByMonthList.push(newGroup);
      }
      monthMap[monthName].birthdays.push({
        ...bday,
        nextBdayDate: nextBday
      });
    }
  });

  // Format countdown text (e.g. "Today", "1 day", "4 days")
  const getCountdownLabel = (nextBday) => {
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const nextBdayStart = new Date(nextBday.getFullYear(), nextBday.getMonth(), nextBday.getDate());
    const diffMs = nextBdayStart.getTime() - todayStart.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (days === 0) return { text: 'Today', isToday: true };
    if (days === 1) return { text: '1 day', isToday: false };
    return { text: `${days} days`, isToday: false };
  };

  const getSubtext = (bday, nextBday) => {
    const { hideYear, date } = bday;
    const { nextAge } = getAgeInfo(date, nextBday);
    const dateObj = new Date(date);
    const options = { month: 'long', day: 'numeric' };
    const monthDayStr = dateObj.toLocaleDateString('en-US', options);

    if (hideYear) {
      return monthDayStr;
    }
    return `Turns ${nextAge} on ${monthDayStr}`;
  };

  return (
    <div className="w-full min-h-screen bg-[#f2f5fa] dark:bg-[#0b0f19] flex flex-col justify-between relative safe-pb-list animate-fade-in select-none">
      
      {/* Container */}
      <div className="w-full max-w-[440px] mx-auto px-4 safe-pt flex flex-col gap-5">
        
        {/* Header bar matching Image 5 */}
        <header className="flex justify-between items-center bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-3xl p-4.5 shadow-sm">
          <button
            onClick={() => onNavigate('settings')}
            className="p-2.5 hover:bg-gray-50 dark:hover:bg-[#1e293b] rounded-full transition-all text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 cursor-pointer"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
          
          <h1 className="text-xl font-extrabold text-[#F2591D] font-headings tracking-tight">
            Birthdays
          </h1>
          
          <button
            onClick={() => onNavigate('add')}
            className="p-2.5 hover:bg-gray-50 dark:hover:bg-[#1e293b] rounded-full transition-all text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 cursor-pointer"
            aria-label="Add Birthday"
          >
            <Plus size={20} />
          </button>
        </header>

        {/* Grouped Birthdays list in chronological upcoming order */}
        <div className="flex flex-col gap-6">
          {safeBirthdays.length === 0 ? (
            <div className="text-center py-12 px-6 bg-white dark:bg-[#151c2c] border border-gray-100/50 dark:border-[#222e45]/60 rounded-[32px] shadow-sm relative overflow-hidden group min-h-[300px] flex flex-col items-center justify-center">
              {/* Floating Balloon and Sparkle Emojis with slow bounce animations */}
              <div className="absolute top-4 left-6 text-3xl animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '3s' }}>🎈</div>
              <div className="absolute top-10 right-8 text-2xl animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '4s' }}>✨</div>
              <div className="absolute bottom-12 left-10 text-2xl animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}>🎉</div>
              <div className="absolute bottom-8 right-12 text-3xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}>🎁</div>
              
              {/* Glow Visual Container */}
              <div className="relative w-28 h-28 mb-4 flex items-center justify-center">
                {/* Glowing backdrop circle */}
                <div className="absolute inset-0 bg-[#F2591D]/10 dark:bg-[#F2591D]/20 rounded-full blur-xl group-hover:scale-115 transition-transform duration-500"></div>
                {/* Outer rotating dashed ring */}
                <div className="absolute inset-1 border-2 border-dashed border-[#F2591D]/30 dark:border-[#F2591D]/40 rounded-full animate-[spin_30s_linear_infinite]"></div>
                {/* Inner rotating solid ring */}
                <div className="absolute inset-3 border border-dashed border-[#F2591D]/15 dark:border-[#F2591D]/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                
                {/* Central Birthday Cake Graphic */}
                <div className="relative w-18 h-18 bg-gradient-to-tr from-[#F2591D] to-[#ff844f] rounded-2xl flex items-center justify-center shadow-lg text-white transform group-hover:rotate-6 group-hover:scale-105 transition-transform duration-300">
                  <CakeIcon size={38} className="drop-shadow-md" />
                </div>
              </div>

              {/* Message Content */}
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-headings">
                No Birthdays Saved Yet! 🎂
              </h2>
            </div>
          ) : groupedByMonthList.length > 0 ? (
            groupedByMonthList.map((group) => (
              <div key={group.monthName} className="flex flex-col gap-2.5">
                {/* Month header */}
                <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2.5">
                  {group.monthName}
                </h2>
                
                {/* Group items */}
                <div className="flex flex-col gap-2">
                  {group.birthdays.map((bday) => {
                    const cd = getCountdownLabel(bday.nextBdayDate);
                    const hasImage = bday.image && bday.image !== '/cake-icon.png' && bday.image !== 'cake-icon.png' && !bday.image.endsWith('cake-icon.png');
                    return (
                      <div
                        key={bday.id}
                        onClick={() => onSelect(bday)}
                        className="bg-white dark:bg-[#151c2c] border border-gray-100/50 dark:border-[#222e45]/60 rounded-2xl p-3 flex justify-between items-center shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                      >
                        {/* Left Details */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {hasImage ? (
                            <img
                              src={bday.image}
                              alt={bday.name}
                              className="w-11 h-11 rounded-xl object-cover border border-gray-100 dark:border-[#222e45] shadow-sm"
                            />
                          ) : (
                            <div className="w-11 h-11 bg-[#F2591D] rounded-xl flex items-center justify-center shadow-sm shrink-0 text-white">
                              <CakeIcon size={24} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                              {bday.name}
                            </h3>
                            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold mt-0.5">
                              {getSubtext(bday, bday.nextBdayDate)}
                            </p>
                          </div>
                        </div>

                        {/* Right Countdown Label with divider line */}
                        <div className="flex items-center shrink-0">
                          <div className="border-l border-gray-100 dark:border-[#222e45] h-8 mx-3"></div>
                          <div className="min-w-[65px] text-center">
                            <span className={`text-xs font-black tracking-wide ${
                              cd.isToday ? 'text-blue-600 dark:text-blue-400 animate-pulse' : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {cd.text}
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-3xl p-6 shadow-sm">
              <p className="text-sm text-slate-400 dark:text-slate-500 font-semibold">No birthdays match your search.</p>
            </div>
          )}
        </div>

      </div>

      {/* Floating search pill bottom bar matching Image 5 */}
      {safeBirthdays.length > 0 && (
        <div className="fixed safe-bottom-fixed left-0 right-0 px-4 z-40 flex justify-center pointer-events-none">
          <div className="w-full max-w-[400px] bg-white/90 dark:bg-[#151c2c]/90 backdrop-blur-md border border-gray-200/50 dark:border-[#222e45] rounded-full py-2.5 px-4 shadow-lg flex items-center gap-2 pointer-events-auto">
            <Search size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent border-none text-sm text-slate-700 dark:text-slate-200 outline-none placeholder-slate-400 py-0.5"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-full transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ListView;

