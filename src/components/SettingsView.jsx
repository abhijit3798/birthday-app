import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, Download, ChevronUp, ChevronDown } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';
import { getReminderTriggerDate, formatTime12Hour, parseDate, getNextBirthday, getAgeInfo } from '../utils/dateHelpers';
import { jsPDF } from 'jspdf';
import { Filesystem, Directory } from '@capacitor/filesystem';

export function SettingsView({ onBack, onNavigate, birthdays, deferredPrompt, isAppInstalled, onAppInstalled, darkMode, onToggleDarkMode, globalSettings, onUpdateGlobalSettings }) {
  const remindersSettings = globalSettings;
  const setRemindersSettings = onUpdateGlobalSettings;

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerHour, setPickerHour] = useState('09');
  const [pickerMinute, setPickerMinute] = useState('00');
  const [pickerPeriod, setPickerPeriod] = useState('AM');

  const [daysBeforeInput, setDaysBeforeInput] = useState(String(remindersSettings.daysBefore ?? 1));
  const [leapYearDaysBeforeInput, setLeapYearDaysBeforeInput] = useState(String(remindersSettings.leapYearDaysBefore ?? 1));

  useEffect(() => {
    setDaysBeforeInput(String(remindersSettings.daysBefore ?? 1));
  }, [remindersSettings.daysBefore]);

  useEffect(() => {
    setLeapYearDaysBeforeInput(String(remindersSettings.leapYearDaysBefore ?? 1));
  }, [remindersSettings.leapYearDaysBefore]);

  const handleDaysBeforeChange = (e) => {
    const rawVal = e.target.value;
    const cleaned = rawVal.replace(/[^0-9]/g, '');
    setDaysBeforeInput(cleaned);

    if (cleaned !== '') {
      const num = parseInt(cleaned, 10);
      if (num >= 0 && num <= 365) {
        setRemindersSettings(prev => ({ ...prev, daysBefore: num, updatedAt: Date.now() }));
      }
    }
  };

  const handleDaysBeforeBlur = () => {
    let finalVal = remindersSettings.daysBefore ?? 1;
    
    if (daysBeforeInput !== '') {
      const num = parseInt(daysBeforeInput, 10);
      if (num < 0) {
        finalVal = 0;
      } else if (num > 365) {
        finalVal = 365;
      } else {
        finalVal = num;
      }
    } else {
      finalVal = remindersSettings.daysBefore ?? 1;
    }
    
    setDaysBeforeInput(String(finalVal));
    setRemindersSettings(prev => ({ ...prev, daysBefore: finalVal, updatedAt: Date.now() }));
  };

  const handleLeapYearDaysBeforeChange = (e) => {
    const rawVal = e.target.value;
    const cleaned = rawVal.replace(/[^0-9]/g, '');
    setLeapYearDaysBeforeInput(cleaned);

    if (cleaned !== '') {
      const num = parseInt(cleaned, 10);
      if (num >= 0 && num <= 365) {
        setRemindersSettings(prev => ({ ...prev, leapYearDaysBefore: num, updatedAt: Date.now() }));
      }
    }
  };

  const handleLeapYearDaysBeforeBlur = () => {
    let finalVal = remindersSettings.leapYearDaysBefore ?? 1;
    
    if (leapYearDaysBeforeInput !== '') {
      const num = parseInt(leapYearDaysBeforeInput, 10);
      if (num < 0) {
        finalVal = 0;
      } else if (num > 365) {
        finalVal = 365;
      } else {
        finalVal = num;
      }
    } else {
      finalVal = remindersSettings.leapYearDaysBefore ?? 1;
    }
    
    setLeapYearDaysBeforeInput(String(finalVal));
    setRemindersSettings(prev => ({ ...prev, leapYearDaysBefore: finalVal, updatedAt: Date.now() }));
  };



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


  // Trigger PDF download of birthdays as a professional backup export feature!
  const handleExportBirthdays = async () => {
    try {
      if (!birthdays || birthdays.length === 0) {
        alert('No birthdays available to export.');
        return;
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Render Title
      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.setTextColor(242, 89, 29); // Premium Orange (#F2591D)
      pdf.text('Birthday Reminder Backup', 20, 25);

      // Generated Time
      pdf.setFont('Helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139); // Slate-500
      const nowStr = new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      pdf.text(`Backup Generated: ${nowStr}`, 20, 32);

      // Header underline
      pdf.setDrawColor(242, 89, 29); // Premium Orange
      pdf.setLineWidth(1.0);
      pdf.line(20, 36, 190, 36);

      let y = 48; // starting point of records

      birthdays.forEach((birthday, index) => {
        // Handle page breaks automatically: if the card exceeds available page space, insert break
        if (y + 35 > 270) {
          pdf.addPage();
          y = 25; // reset y to top margin on next page
        }

        const name = birthday.name || 'Unknown';
        const birthDateStr = birthday.date || birthday.birthDate || '';
        
        let formattedDob = birthDateStr || 'N/A';
        if (birthDateStr) {
          const dobObj = parseDate(birthDateStr);
          if (dobObj) {
            formattedDob = dobObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: birthday.hideYear ? undefined : 'numeric'
            });
          }
        }

        let ageText = 'N/A';
        if (birthDateStr) {
          const nextBdayObj = getNextBirthday(birthDateStr, new Date());
          if (nextBdayObj) {
            const { currentAge } = getAgeInfo(birthDateStr, nextBdayObj);
            ageText = `${currentAge} years old`;
          }
        }

        const phone = birthday.phoneNumber || 'N/A';
        const email = birthday.emailAddress || 'N/A';

        // Reminders evaluation (Custom override vs Global fallback)
        let reminderStatus = 'Disabled';
        let daysBeforeVal = 'N/A';
        let notificationTimeVal = 'N/A';

        const customRem = birthday.customReminders;
        if (customRem && typeof customRem === 'object') {
          if (customRem.enabled) {
            reminderStatus = 'Enabled (Custom)';
            daysBeforeVal = `${customRem.daysBefore} ${customRem.daysBefore === 1 ? 'day' : 'days'} before`;
            notificationTimeVal = formatTime12Hour(customRem.notificationTime || '09:00');
          } else {
            reminderStatus = 'Disabled (Custom)';
          }
        } else {
          // Global Settings fallback
          const globalEnabled = remindersSettings?.enabled ?? true;
          if (globalEnabled) {
            reminderStatus = 'Enabled (Global)';
            daysBeforeVal = `${remindersSettings?.daysBefore ?? 1} ${(remindersSettings?.daysBefore ?? 1) === 1 ? 'day' : 'days'} before`;
            notificationTimeVal = formatTime12Hour(remindersSettings?.notificationTime || '09:00');
          } else {
            reminderStatus = 'Disabled (Global)';
          }
        }

        // Section Title: Name
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(30, 41, 59); // Slate-800
        pdf.text(`${index + 1}. ${name}`, 20, y);

        y += 6;

        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(71, 85, 105); // Slate-600

        // Column 1
        const col1X = 22;
        pdf.text(`• Birthday: ${formattedDob}`, col1X, y);
        pdf.text(`• Age: ${ageText}`, col1X, y + 5);
        pdf.text(`• Phone: ${phone}`, col1X, y + 10);
        pdf.text(`• Email: ${email}`, col1X, y + 15);

        // Column 2
        const col2X = 110;
        pdf.text(`• Reminder: ${reminderStatus}`, col2X, y);
        pdf.text(`• Days Before: ${daysBeforeVal}`, col2X, y + 5);
        pdf.text(`• Notification Time: ${notificationTimeVal}`, col2X, y + 10);

        y += 22;

        // Divider line between records
        pdf.setDrawColor(226, 232, 240); // Slate-200
        pdf.setLineWidth(0.3);
        pdf.line(20, y, 190, y);

        y += 10; // spacing before next record
      });

      // Render Summary at the bottom
      if (y + 15 > 270) {
        pdf.addPage();
        y = 25;
      }

      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(30, 41, 59); // Slate-800
      pdf.text(`Total Birthdays: ${birthdays.length}`, 20, y);

      // Double line for total summary footer
      pdf.setDrawColor(203, 213, 225); // Slate-300
      pdf.setLineWidth(0.8);
      pdf.line(20, y + 3, 190, y + 3);

      // Add Page Numbers on all pages if total pages > 1
      const pageCount = pdf.internal.getNumberOfPages();
      if (pageCount > 1) {
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.setFont('Helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(148, 163, 184); // Slate-400
          pdf.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
        }
      }

      const base64Pdf = pdf.output('datauristring').split(',')[1];
      const fileName = `birthday_backup_${Date.now()}.pdf`;

      await Filesystem.writeFile({
        path: fileName,
        data: base64Pdf,
        directory: Directory.Documents
      });

      const fileInfo = await Filesystem.getUri({
        directory: Directory.Documents,
        path: fileName,
      });

      console.log("PDF FILE INFO:", fileInfo);
      alert(`PDF Path: ${fileInfo.uri}`);
      alert(`PDF exported successfully.\nFile: ${fileName}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f2f5fa] dark:bg-[#0b0f19] flex flex-col items-center animate-fade-in relative safe-pb-container select-none">
      
      <div className="w-full max-w-[440px] px-4 safe-pt flex flex-col gap-5">
        
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
                    setRemindersSettings(prev => ({ ...prev, enabled: isChecked, updatedAt: Date.now() }));
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
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={daysBeforeInput}
                      onChange={handleDaysBeforeChange}
                      onBlur={handleDaysBeforeBlur}
                      className="w-16 bg-slate-50 dark:bg-[#0c1220] border border-slate-200 dark:border-[#222e45] rounded-xl px-2 py-1 text-sm font-bold text-slate-700 dark:text-slate-200 text-center focus:outline-none focus:border-[#F2591D]"
                    />
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Days Before</span>
                  </div>
                </div>

                {/* Notification Time Selector */}
                <button
                  type="button"
                  onClick={() => {
                    const timeParts = (remindersSettings.notificationTime || '09:00').split(':');
                    let h = parseInt(timeParts[0] || '09', 10);
                    const m = timeParts[1] || '00';
                    const period = h >= 12 ? 'PM' : 'AM';
                    h = h % 12;
                    h = h ? h : 12;
                    setPickerHour(String(h).padStart(2, '0'));
                    setPickerMinute(m);
                    setPickerPeriod(period);
                    setShowTimePicker(true);
                  }}
                  className="w-full flex justify-between items-center py-3 px-1 hover:bg-gray-50/50 dark:hover:bg-[#1e293b]/50 rounded-xl transition-all cursor-pointer text-left"
                >
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Notification Time</span>
                  <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-400 font-semibold">
                    <span>{formatTime12Hour(remindersSettings.notificationTime)}</span>
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
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={leapYearDaysBeforeInput}
                onChange={handleLeapYearDaysBeforeChange}
                onBlur={handleLeapYearDaysBeforeBlur}
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
      {showTimePicker && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop overlay with blur */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowTimePicker(false)}
          />
          
          {/* Time Picker Card */}
          <div 
            style={{ display: 'flex', flexDirection: 'column' }}
            className="bg-white dark:bg-[#151c2c] rounded-[28px] w-[310px] shadow-2xl border border-slate-100/80 dark:border-[#222e45] z-[1001] animate-scale-in overflow-hidden"
          >
            
            {/* Header Title */}
            <div className="text-center px-5 pt-5 pb-3 border-b border-slate-100 dark:border-[#222e45] bg-white dark:bg-[#151c2c]">
              <span className="text-sm font-black text-slate-800 dark:text-slate-100 font-headings tracking-tight">Select Time</span>
            </div>

            {/* Time Pickers */}
            <div 
              style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              className="gap-4 py-6 px-4 bg-slate-50/50 dark:bg-[#0c1220]/50"
            >
              {/* Hour Adjuster */}
              <div 
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                className="select-none"
              >
                <button
                  type="button"
                  onClick={() => {
                    const nextHour = parseInt(pickerHour) % 12 + 1;
                    setPickerHour(String(nextHour).padStart(2, '0'));
                  }}
                  className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full transition-all text-slate-400 hover:text-[#F2591D] active:scale-90 cursor-pointer flex items-center justify-center"
                  aria-label="Increase Hour"
                >
                  <ChevronUp size={24} className="stroke-[2.5]" />
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight my-1 w-16 text-center font-headings">
                    {pickerHour}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hour</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const prevHour = (parseInt(pickerHour) - 2 + 12) % 12 + 1;
                    setPickerHour(String(prevHour).padStart(2, '0'));
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
                    const nextMin = (parseInt(pickerMinute) + 1) % 60;
                    setPickerMinute(String(nextMin).padStart(2, '0'));
                  }}
                  className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full transition-all text-slate-400 hover:text-[#F2591D] active:scale-90 cursor-pointer flex items-center justify-center"
                  aria-label="Increase Minute"
                >
                  <ChevronUp size={24} className="stroke-[2.5]" />
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight my-1 w-16 text-center font-headings">
                    {pickerMinute}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Minute</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const prevMin = (parseInt(pickerMinute) - 1 + 60) % 60;
                    setPickerMinute(String(prevMin).padStart(2, '0'));
                  }}
                  className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full transition-all text-slate-400 hover:text-[#F2591D] active:scale-90 cursor-pointer flex items-center justify-center"
                  aria-label="Decrease Minute"
                >
                  <ChevronDown size={24} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Period Adjuster (AM/PM) */}
              <div 
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                className="select-none ml-2"
              >
                <button
                  type="button"
                  onClick={() => setPickerPeriod(prev => prev === 'AM' ? 'PM' : 'AM')}
                  className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full transition-all text-slate-400 hover:text-[#F2591D] active:scale-90 cursor-pointer flex items-center justify-center"
                  aria-label="Toggle Period"
                >
                  <ChevronUp size={24} className="stroke-[2.5]" />
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight my-1.5 w-16 text-center font-headings">
                    {pickerPeriod}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Period</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPickerPeriod(prev => prev === 'AM' ? 'PM' : 'AM')}
                  className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full transition-all text-slate-400 hover:text-[#F2591D] active:scale-90 cursor-pointer flex items-center justify-center"
                  aria-label="Toggle Period"
                >
                  <ChevronDown size={24} className="stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Done Button Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-[#222e45] flex justify-center bg-white dark:bg-[#151c2c]">
              <button
                type="button"
                onClick={() => {
                  let h = parseInt(pickerHour, 10);
                  if (pickerPeriod === 'PM' && h < 12) h += 12;
                  if (pickerPeriod === 'AM' && h === 12) h = 0;
                  const formattedHour = String(h).padStart(2, '0');

                  setRemindersSettings(prev => ({
                    ...prev,
                    notificationTime: `${formattedHour}:${pickerMinute}`,
                    updatedAt: Date.now()
                  }));
                  setShowTimePicker(false);
                }}
                className="w-full py-2.5 bg-[#F2591D] hover:bg-[#C24717] text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default SettingsView;
