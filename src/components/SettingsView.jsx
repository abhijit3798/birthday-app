import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, Download, ChevronUp, ChevronDown } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';
import { getReminderTriggerDate } from '../utils/dateHelpers';

export function SettingsView({ onBack, onNavigate, birthdays, deferredPrompt, isAppInstalled, onAppInstalled, darkMode, onToggleDarkMode }) {
  const [remindersSettings, setRemindersSettings] = useLocalStorage('birthday_reminders_settings', {
    enabled: true,
    daysBefore: 1,
    notificationTime: '09:00',
    leapYearDaysBefore: 1
  });

  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    // Run self-testing logic check simulating non-leap year for Feb 29 birthday
    try {
      const testDob = '2000-02-29';
      const refToday = new Date('2026-05-24T12:00:00'); // next bday is in 2027 (non-leap year)
      const testSettings = {
        enabled: true,
        daysBefore: 2,
        notificationTime: '09:00',
        leapYearDaysBefore: 3
      };
      const trigger = getReminderTriggerDate({ date: testDob }, testSettings, refToday);
      
      const expectedYear = 2027;
      const expectedMonth = 1; // Feb (0-indexed)
      const expectedDay = 25; // Feb 28 - 3 days
      
      if (
        trigger &&
        trigger.getFullYear() === expectedYear &&
        trigger.getMonth() === expectedMonth &&
        trigger.getDate() === expectedDay
      ) {
        console.log('🤖 Self-Test: Leap Year notification fallback math verified successfully.');
      } else {
        console.error('🤖 Self-Test Failure: Leap Year notification fallback math mismatch:', trigger);
      }
    } catch (err) {
      console.error('🤖 Self-Test: Error running Leap Year notification math check:', err);
    }
  }, []);


  // Trigger JSON download of birthdays as a backup export feature!
  const handleExportBirthdays = () => {
    if (!birthdays || birthdays.length === 0) {
      alert('You do not have any birthdays saved to export.');
      return;
    }
    const dataStr = JSON.stringify(birthdays, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `birthdays_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-h-screen bg-[#f2f5fa] dark:bg-[#0b0f19] flex flex-col items-center animate-fade-in relative pb-10 select-none">
      
      <div className="w-full max-w-[440px] px-4 pt-6 flex flex-col gap-5">
        
        {/* Navigation Header bar matching Image 4 */}
        <header className="w-full flex justify-between items-center bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-3xl p-3.5 shadow-sm">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-50 dark:hover:bg-[#1e293b] rounded-full transition-all text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 cursor-pointer flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          
          <h1 className="text-base font-extrabold text-[#F2591D] font-headings tracking-tight">
            Settings
          </h1>
          
          {/* Empty spacing for symmetric centering */}
          <div className="w-9 h-9"></div>
        </header>


        {/* 1. Reminders Panel */}
        <div className="bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-[28px] p-4.5 shadow-sm flex flex-col animate-fade-in">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">
            Reminders
          </h3>
          
          <div className="flex flex-col">
            {/* Enabled Switch */}
            <div className="flex justify-between items-center py-2.5 px-1">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Enabled</span>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={remindersSettings.enabled}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setRemindersSettings(prev => ({ ...prev, enabled: isChecked }));
                    if (isChecked && 'Notification' in window) {
                      Notification.requestPermission().then((permission) => {
                        if (permission !== 'granted') {
                          alert('Please enable notification permissions in your browser settings to receive birthday reminders.');
                        }
                      });
                    }
                  }}
                  className="sr-only"
                />
                <div className={`w-9 h-5 rounded-full transition-all duration-200 relative ${remindersSettings.enabled ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-4 w-4 transition-transform duration-200 ${remindersSettings.enabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </label>
            </div>

            {/* Collapsible options with smooth Tailwind animation */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              remindersSettings.enabled ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0 pointer-events-none'
            }`}>
              <div className="flex flex-col border-t border-slate-100 dark:border-[#222e45] pt-2">
                {/* Send Reminder input */}
                <div className="flex justify-between items-center py-3 ios-divider px-1">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Send Reminder</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="365"
                      value={remindersSettings.daysBefore}
                      onChange={(e) => {
                        const val = Math.min(365, Math.max(0, parseInt(e.target.value) || 0));
                        setRemindersSettings(prev => ({ ...prev, daysBefore: val }));
                      }}
                      className="w-16 bg-slate-50 dark:bg-[#0c1220] border border-slate-200 dark:border-[#222e45] rounded-xl px-2 py-1 text-sm font-bold text-slate-700 dark:text-slate-200 text-center focus:outline-none focus:border-[#F2591D]"
                    />
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Days Before</span>
                  </div>
                </div>

                {/* Notification Time Selector */}
                <button
                  type="button"
                  onClick={() => setShowTimePicker(true)}
                  className="w-full flex justify-between items-center py-3 px-1 hover:bg-gray-50/50 dark:hover:bg-[#1e293b]/50 rounded-xl transition-all cursor-pointer text-left"
                >
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Notification Time</span>
                  <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-400 font-semibold">
                    <span>{remindersSettings.notificationTime}</span>
                    <ChevronRight size={14} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Leap Year Settings Panel */}
        <div className="bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-[28px] p-4.5 shadow-sm flex flex-col">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">
            If February 29 doesn't exist
          </h3>
          
          <div className="flex justify-between items-center py-2.5 px-1">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Send Reminder on</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="365"
                value={remindersSettings.leapYearDaysBefore}
                onChange={(e) => {
                  const val = Math.min(365, Math.max(0, parseInt(e.target.value) || 0));
                  setRemindersSettings(prev => ({ ...prev, leapYearDaysBefore: val }));
                }}
                className="w-16 bg-slate-50 dark:bg-[#0c1220] border border-slate-200 dark:border-[#222e45] rounded-xl px-2 py-1 text-sm font-bold text-slate-700 dark:text-slate-200 text-center focus:outline-none focus:border-[#F2591D]"
              />
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Days Before</span>
            </div>
          </div>
        </div>

        {/* 3. Advanced Section */}
        <div className="bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-[28px] p-4.5 shadow-sm flex flex-col">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">
            Advanced
          </h3>
          
          <div className="flex flex-col">

            {/* Dark Mode selection */}
            <div className="flex justify-between items-center py-3 ios-divider px-1">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Dark Mode</span>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={onToggleDarkMode}
                  className="sr-only"
                />
                <div className={`w-9 h-5 rounded-full transition-all duration-200 relative ${darkMode ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-4 w-4 transition-transform duration-200 ${darkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </label>
            </div>

            {/* Export Birthdays Button */}
            <button
              onClick={handleExportBirthdays}
              className="flex justify-between items-center py-3 hover:bg-gray-50/50 dark:hover:bg-[#1e293b]/50 px-1 rounded-xl transition-all cursor-pointer"
            >
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Export Birthdays</span>
              <Download size={16} className="text-slate-400 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Upgrade Section */}
        <div className="bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-[28px] p-4.5 shadow-sm flex flex-col">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">
            Upgrade
          </h3>
          
          <button
            onClick={() => onNavigate('pro')}
            className="flex justify-between items-center py-3 hover:bg-gray-50/50 dark:hover:bg-[#1e293b]/50 px-1 rounded-xl transition-all cursor-pointer text-left"
          >
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Birthday Pro</span>
            <ChevronRight size={16} className="text-slate-400 dark:text-slate-400" />
          </button>
        </div>

        {/* Privacy Section */}
        <div className="bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-[28px] p-4.5 shadow-sm flex flex-col">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">
            Privacy
          </h3>
          
          <button
            onClick={() => onNavigate('privacy')}
            className="flex justify-between items-center py-3 hover:bg-gray-50/50 dark:hover:bg-[#1e293b]/50 px-1 rounded-xl transition-all cursor-pointer text-left"
          >
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Privacy Policy</span>
            <ChevronRight size={16} className="text-slate-400 dark:text-slate-400" />
          </button>
        </div>

        {/* 4. PWA Installation Option (Only shown if not installed and browser triggers beforeinstallprompt) */}
        {!isAppInstalled && deferredPrompt && (
          <div className="bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-[28px] p-4.5 shadow-sm flex flex-col mt-1 animate-fade-in">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">
              Application
            </h3>
            
            <button
              onClick={async () => {
                deferredPrompt.prompt();
                try {
                  const { outcome } = await deferredPrompt.userChoice;
                  console.log('PWA installation user outcome choice:', outcome);
                  if (outcome === 'accepted') {
                    onAppInstalled();
                  }
                } catch (err) {
                  console.error('Error triggered during settings install action:', err);
                }
              }}
              className="flex justify-between items-center py-3 hover:bg-gray-50/50 dark:hover:bg-[#1e293b]/50 px-1 rounded-xl transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                  <Download size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Install App</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Add to home screen for offline access</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 dark:text-slate-400" />
            </button>
          </div>
        )}

      </div>

      {/* Time Picker Popup Modal */}
      {showTimePicker && (() => {
        const timeParts = (remindersSettings.notificationTime || '09:00').split(':');
        const selectedHour = timeParts[0] || '09';
        const selectedMinute = timeParts[1] || '00';
        
        return (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop overlay with blur */}
            <div 
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
              onClick={() => setShowTimePicker(false)}
            />
            
            {/* Time Picker Card */}
            <div 
              style={{ display: 'flex', flexDirection: 'column' }}
              className="bg-white dark:bg-[#151c2c] rounded-[28px] w-[280px] sm:w-[300px] shadow-2xl border border-slate-100/80 dark:border-[#222e45] z-[1001] animate-scale-in overflow-hidden"
            >
              
              {/* Header Title */}
              <div className="text-center px-5 pt-5 pb-3 border-b border-slate-100 dark:border-[#222e45] bg-white dark:bg-[#151c2c]">
                <span className="text-sm font-black text-slate-800 dark:text-slate-100 font-headings tracking-tight">Select Time</span>
              </div>

              {/* Time Pickers */}
              <div 
                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                className="gap-6 py-6 px-4 bg-slate-50/50 dark:bg-[#0c1220]/50"
              >
                {/* Hour Adjuster */}
                <div 
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  className="select-none"
                >
                  <button
                    type="button"
                    onClick={() => {
                      const nextHour = (parseInt(selectedHour) + 1) % 24;
                      const formattedHour = String(nextHour).padStart(2, '0');
                      setRemindersSettings(prev => ({
                        ...prev,
                        notificationTime: `${formattedHour}:${selectedMinute}`
                      }));
                    }}
                    className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full transition-all text-slate-400 hover:text-[#F2591D] active:scale-90 cursor-pointer flex items-center justify-center"
                    aria-label="Increase Hour"
                  >
                    <ChevronUp size={24} className="stroke-[2.5]" />
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight my-1 w-16 text-center font-headings">
                      {selectedHour}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hour</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const prevHour = (parseInt(selectedHour) - 1 + 24) % 24;
                      const formattedHour = String(prevHour).padStart(2, '0');
                      setRemindersSettings(prev => ({
                        ...prev,
                        notificationTime: `${formattedHour}:${selectedMinute}`
                      }));
                    }}
                    className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full transition-all text-slate-400 hover:text-[#F2591D] active:scale-90 cursor-pointer flex items-center justify-center"
                    aria-label="Decrease Hour"
                  >
                    <ChevronDown size={24} className="stroke-[2.5]" />
                  </button>
                </div>

                {/* Separator */}
                <span className="text-3xl font-black text-slate-300 dark:text-slate-700 self-center pb-5">:</span>

                {/* Minute Adjuster */}
                <div 
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  className="select-none"
                >
                  <button
                    type="button"
                    onClick={() => {
                      const nextMin = (parseInt(selectedMinute) + 1) % 60;
                      const formattedMinute = String(nextMin).padStart(2, '0');
                      setRemindersSettings(prev => ({
                        ...prev,
                        notificationTime: `${selectedHour}:${formattedMinute}`
                      }));
                    }}
                    className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full transition-all text-slate-400 hover:text-[#F2591D] active:scale-90 cursor-pointer flex items-center justify-center"
                    aria-label="Increase Minute"
                  >
                    <ChevronUp size={24} className="stroke-[2.5]" />
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight my-1 w-16 text-center font-headings">
                      {selectedMinute}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Minute</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const prevMin = (parseInt(selectedMinute) - 1 + 60) % 60;
                      const formattedMinute = String(prevMin).padStart(2, '0');
                      setRemindersSettings(prev => ({
                        ...prev,
                        notificationTime: `${selectedHour}:${formattedMinute}`
                      }));
                    }}
                    className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full transition-all text-slate-400 hover:text-[#F2591D] active:scale-90 cursor-pointer flex items-center justify-center"
                    aria-label="Decrease Minute"
                  >
                    <ChevronDown size={24} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Done Button Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-[#222e45] flex justify-center bg-white dark:bg-[#151c2c]">
                <button
                  type="button"
                  onClick={() => setShowTimePicker(false)}
                  className="w-full py-2.5 bg-[#F2591D] hover:bg-[#C24717] text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  Done
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}

export default SettingsView;
