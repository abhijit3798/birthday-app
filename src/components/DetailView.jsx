import { useState } from 'react';
import { ArrowLeft, MessageSquare, Phone, Mail, Calendar, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { getNextBirthday, getAgeInfo, formatTime12Hour } from '../utils/dateHelpers';
import { CakeIcon } from './CakeIcon';



export function DetailView({ birthday, onBack, onEdit, onUpdate, onNavigate }) {
  const { name, date, hideYear, image: rawImage, phoneNumber = '', emailAddress = '', notes = '' } = birthday;
  const image = (rawImage === '/cake-icon.png' || rawImage === 'cake-icon.png' || (rawImage && rawImage.endsWith('cake-icon.png'))) ? '' : rawImage;

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerHour, setPickerHour] = useState('09');
  const [pickerMinute, setPickerMinute] = useState('00');
  const [pickerPeriod, setPickerPeriod] = useState('AM');

  const handleOpenTimePicker = () => {
    const timeParts = (customReminders.notificationTime || '09:00').split(':');
    let h = parseInt(timeParts[0] || '09', 10);
    const m = timeParts[1] || '00';
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    setPickerHour(String(h).padStart(2, '0'));
    setPickerMinute(m);
    setPickerPeriod(period);
    setShowTimePicker(true);
  };

  const handleDoneTimePicker = () => {
    let h = parseInt(pickerHour, 10);
    if (pickerPeriod === 'PM' && h < 12) h += 12;
    if (pickerPeriod === 'AM' && h === 12) h = 0;
    const formattedHour = String(h).padStart(2, '0');

    onUpdate({
      ...birthday,
      customReminders: {
        ...customReminders,
        notificationTime: `${formattedHour}:${pickerMinute}`
      }
    });
    setShowTimePicker(false);
  };

  const customReminders = birthday.customReminders || {
    enabled: false,
    daysBefore: 1,
    notificationTime: '09:00',
    leapYearDaysBefore: 1
  };

  const today = new Date();
  const nextBday = getNextBirthday(date, today);
  const { nextAge } = getAgeInfo(date, nextBday);

  const formatBirthdate = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const options = { month: 'long', day: 'numeric', year: hideYear ? undefined : 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  const getDaysLeft = () => {
    if (!nextBday) return 0;
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const nextBdayStart = new Date(nextBday.getFullYear(), nextBday.getMonth(), nextBday.getDate());
    const diffMs = nextBdayStart.getTime() - todayStart.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysLeft();
  const isToday = daysLeft === 0;



  return (
    <div className="w-full min-h-screen bg-[#f2f5fa] dark:bg-[#0b0f19] flex flex-col items-center animate-fade-in relative pb-10 select-none">
      
      {/* Blue Header Section */}
      <div className="w-full bg-[#F2591D] text-white pt-6 pb-12 px-4 rounded-b-[40px] shadow-md flex flex-col items-center relative">
        
        {/* Navigation Header */}
        <div className="w-full max-w-[440px] flex justify-between items-center mb-4">
          <button
            onClick={onBack}
            className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-full flex items-center justify-center cursor-pointer"
            aria-label="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          
          <button
            onClick={() => onEdit(birthday)}
            className="px-4 py-1.5 bg-white/15 hover:bg-white/25 active:scale-95 transition-all rounded-full text-xs font-bold border border-white/20 cursor-pointer"
          >
            Edit
          </button>
        </div>

        {/* Profile Picture / Initials Fallback matching Image 3 */}
        <div className="w-full max-w-[440px] flex flex-col items-center mt-3 text-center">
          <div className="relative mb-4">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-white/20 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 bg-[#F2591D] rounded-3xl flex items-center justify-center text-white">
                <CakeIcon size={56} />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-black font-headings tracking-tight leading-snug">
            {name}
          </h2>
          <p className="text-sm text-white/70 font-semibold mt-1">
            {formatBirthdate(date)}
          </p>
          {!hideYear && (
            <p className="text-xs text-white/50 font-bold uppercase tracking-wider mt-1">
              Turns {nextAge}
            </p>
          )}

          {/* Large Pill Status Badge */}
          <div className="mt-5">
            <span className={`px-8 py-2 rounded-full text-sm font-extrabold shadow-md border ${
              isToday 
                ? 'bg-white text-[#F2591D] border-white' 
                : 'bg-white/15 text-white border-white/20'

            }`}>
              {isToday ? 'Today' : `${daysLeft} days left`}
            </span>
          </div>
        </div>

      </div>

      {/* Main Settings/Actions Layout */}
      <div className="w-full max-w-[440px] px-4 -mt-6 z-20 flex flex-col gap-5">
        
        {/* Action Shortcuts Grid (Image 3) */}
        <div className="bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-3xl p-4 shadow-md flex justify-between items-center gap-1">
          
          {/* Text/SMS */}
          <a
            href={phoneNumber ? `sms:${phoneNumber}` : 'sms:'}
            className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-all">
              <MessageSquare size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200">Text</span>
          </a>

          {/* Call/Tel */}
          <a
            href={phoneNumber ? `tel:${phoneNumber}` : 'tel:'}
            className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-all">
              <Phone size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200">Call</span>
          </a>

          {/* Email */}
          <a
            href={emailAddress ? `mailto:${emailAddress}` : 'mailto:'}
            className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-all">
              <Mail size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200">Email</span>
          </a>

          {/* Add to calendar */}
          <button
            onClick={() => onNavigate('calendar_coming_soon')}
            className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
            title="Download Calendar Reminder"
          >
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-all">
              <Calendar size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200">Add</span>
          </button>

        </div>

        {/* Custom Reminders card matching SettingsView design */}
        <div className="bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-3xl p-4.5 shadow-md flex flex-col">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">
            Custom Reminders
          </h3>
          
          <div className="flex flex-col">
            {/* Enable Reminders Switch */}
            <div className="flex justify-between items-center py-2.5 px-1">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Enable Reminders</span>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={customReminders.enabled}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    onUpdate({
                      ...birthday,
                      customReminders: {
                        ...customReminders,
                        enabled: isChecked
                      }
                    });
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
                <div className={`w-9 h-5 rounded-full transition-all duration-200 relative ${customReminders.enabled ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-4 w-4 transition-transform duration-200 ${customReminders.enabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </label>
            </div>

            {/* Collapsible options with smooth slide-down transition */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              customReminders.enabled ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0 pointer-events-none'
            }`}>
              <div className="flex flex-col border-t border-slate-100 dark:border-[#222e45] pt-2">
                {/* Send Reminder daysBefore input */}
                <div className="flex justify-between items-center py-3 ios-divider px-1">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Send Reminder</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="365"
                      value={customReminders.daysBefore}
                      onChange={(e) => {
                        const val = Math.min(365, Math.max(0, parseInt(e.target.value) || 0));
                        onUpdate({
                          ...birthday,
                          customReminders: {
                            ...customReminders,
                            daysBefore: val
                          }
                        });
                      }}
                      className="w-16 bg-slate-50 dark:bg-[#0c1220] border border-slate-200 dark:border-[#222e45] rounded-xl px-2 py-1 text-sm font-bold text-slate-700 dark:text-slate-200 text-center focus:outline-none focus:border-[#F2591D]"
                    />
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Days Before</span>
                  </div>
                </div>

                {/* Notification Time Selector */}
                <button
                  type="button"
                  onClick={handleOpenTimePicker}
                  className="w-full flex justify-between items-center py-3 px-1 hover:bg-gray-50/50 dark:hover:bg-[#1e293b]/50 rounded-xl transition-all cursor-pointer text-left"
                >
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Notification Time</span>
                  <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-400 font-semibold">
                    <span>{formatTime12Hour(customReminders.notificationTime)}</span>
                    <ChevronRight size={14} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notes block if present */}
        {notes && (
          <div className="bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-3xl p-4.5 shadow-md flex flex-col gap-3.5">
            <div>
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 px-1">
                Notes
              </h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-gray-50 dark:bg-[#0c1220] border border-gray-100/50 dark:border-[#222e45]/50 rounded-2xl p-3.5 leading-relaxed break-words">
                {notes}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Custom Time Picker Popup Modal */}
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
                onClick={handleDoneTimePicker}
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

export default DetailView;
