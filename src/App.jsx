import { useState, useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import useLocalStorage from './hooks/useLocalStorage';
import ListView from './components/ListView';
import DetailView from './components/DetailView';
import AddEditView from './components/AddEditView';
import SettingsView from './components/SettingsView';
import ProView from './components/ProView';
import PrivacyPolicy from './components/PrivacyPolicy';
import CalendarComingSoon from './components/CalendarComingSoon';
import { getReminderTriggerDate } from './utils/dateHelpers';

const getInitialBirthdays = () => {
  const today = new Date();

  // Safe local date formatting helper (prevents timezone shifts from toISOString)
  const formatLocal = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const r = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${r}`;
  };

  const bToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const bTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const bFourDays = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4);
  const bEightDays = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8);
  const bTwentyDays = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 20);

  // Seed birthdates matching the screenshot ages/milestones
  const d1 = new Date(1995, bToday.getMonth(), bToday.getDate());
  const d2 = new Date(1995, bTomorrow.getMonth(), bTomorrow.getDate());
  const d3 = new Date(1993, bFourDays.getMonth(), bFourDays.getDate());
  const d4 = new Date(1990, bEightDays.getMonth(), bEightDays.getDate());
  const d5 = new Date(1995, bTwentyDays.getMonth(), bTwentyDays.getDate());

  return [
    {
      id: 'mock-1',
      name: 'Prasad Parkhe',
      date: formatLocal(d1),
      category: 'friends',
      hideYear: false,
      phoneNumber: '+1-555-0199',
      emailAddress: 'prasad@example.com',
      notes: 'Likes chess and custom black pens.'
    },
    {
      id: 'mock-2',
      name: 'Suresh - Komal Kardile',
      date: formatLocal(d2),
      category: 'family',
      hideYear: false,
      phoneNumber: '+1-555-0255',
      emailAddress: 'suresh@example.com',
      notes: 'Anniversary celebration.'
    },
    {
      id: 'mock-3',
      name: 'Bappu Sir',
      date: formatLocal(d3),
      category: 'work',
      hideYear: false,
      phoneNumber: '+1-555-0388',
      emailAddress: 'bappu@example.com',
      notes: 'Academic coordinator.'
    },
    {
      id: 'mock-4',
      name: 'Dilip Adsul',
      date: formatLocal(d4),
      category: 'work',
      hideYear: false,
      phoneNumber: '',
      emailAddress: '',
      notes: ''
    },
    {
      id: 'mock-5',
      name: 'Utkarsha Gaware',
      date: formatLocal(d5),
      category: 'friends',
      hideYear: false,
      phoneNumber: '',
      emailAddress: '',
      notes: ''
    }
  ];
};

export function App() {
  const [birthdays, setBirthdays] = useLocalStorage('birthday_countdown_items', []);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'detail', 'add', 'settings'
  const [selectedBirthday, setSelectedBirthday] = useState(null);
  const [editingBirthday, setEditingBirthday] = useState(null);
  const [darkMode, setDarkMode] = useLocalStorage('birthday_dark_mode', false);
  const [toast, setToast] = useState(null);
  const isPopStateChange = useRef(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // 1. Listen for browser back/forward history navigation (popstate)
  useEffect(() => {
    const handlePopState = (e) => {
      const targetView = e.state && e.state.view ? e.state.view : 'list';
      isPopStateChange.current = true;
      setCurrentView(targetView);
    };

    window.addEventListener('popstate', handlePopState);

    // Initialize the root state so the first page is recorded
    if (!window.history.state) {
      window.history.replaceState({ view: 'list' }, '', '');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // 2. Automatically push a new history state when currentView changes programmatically
  useEffect(() => {
    if (currentView === 'list') {
      window.history.replaceState(
        { view: 'list' },
        '',
        window.location.pathname
      );
    }
  }, [currentView]);

  useEffect(() => {
    if (isPopStateChange.current) {
      isPopStateChange.current = false;
      return;
    }

    const currentHistState = window.history.state;
    const histView = currentHistState ? currentHistState.view : 'list';

    if (histView !== currentView) {
      window.history.pushState({ view: currentView }, '', '');
    }
  }, [currentView]);

  const goBack = (fallbackView) => {
    if (window.history.state && window.history.length > 1) {
      window.history.back();
    } else {
      setCurrentView(fallbackView);
    }
  };

  useEffect(() => {
    let listener;

    const setupBackButton = async () => {
      listener = await CapacitorApp.addListener(
        'backButton',
        ({ canGoBack }) => {

          console.log("Current View:", currentView);
          console.log("Can Go Back:", canGoBack);

          // Add/Edit/Detail pages
          if (currentView !== 'list') {
            window.history.back();
            return;
          }

          // Dashboard page
          CapacitorApp.exitApp();
        }
      );
    };

    setupBackButton();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [currentView]);

  // 3. Proactive Notification Scheduler
  useEffect(() => {
    const checkReminders = () => {
      try {
        const now = new Date();
        const globalSettings = JSON.parse(
          localStorage.getItem('birthday_reminders_settings') ||
          '{"enabled":true,"daysBefore":1,"notificationTime":"09:00","leapYearDaysBefore":1}'
        );

        if (!globalSettings.enabled) return;

        const sentReminders = JSON.parse(localStorage.getItem('birthday_sent_reminders') || '{}');
        let updatedSent = false;

        birthdays.forEach((contact) => {
          if (!contact || !contact.date) return;

          // If custom reminders are explicitly disabled for this contact, skip
          if (contact.customReminders && contact.customReminders.enabled === false) return;

          const triggerDate = getReminderTriggerDate(contact, globalSettings, now);
          if (!triggerDate) return;

          // Get active timing (custom override vs global fallback)
          const isCustom = contact.customReminders && contact.customReminders.enabled;
          const timeStr = isCustom
            ? (contact.customReminders.notificationTime || '09:00')
            : (globalSettings.notificationTime || '09:00');

          const [hours, minutes] = timeStr.split(':').map(Number);

          const triggerTime = new Date(
            triggerDate.getFullYear(),
            triggerDate.getMonth(),
            triggerDate.getDate(),
            hours || 9,
            minutes || 0,
            0,
            0
          );

          const diffMs = now.getTime() - triggerTime.getTime();
          const oneDayMs = 24 * 60 * 60 * 1000;
          const isValidWindow = diffMs >= 0 && diffMs < oneDayMs; // Triggers if time has passed, but within 24h

          const uniqueKey = `${contact.id}_${triggerTime.getFullYear()}_${triggerTime.getMonth()}_${triggerTime.getDate()}_${hours}_${minutes}`;

          console.log(`⏰ Scheduler - [${contact.name}]: now: ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}, trigger: ${hours}:${minutes}, diff: ${Math.round(diffMs / 1000)}s, valid: ${isValidWindow}, sent: ${!!sentReminders[uniqueKey]}`);



          if (isValidWindow && !sentReminders[uniqueKey]) {
            // Trigger!
            const daysBefore = isCustom ? contact.customReminders.daysBefore : (globalSettings.daysBefore ?? 1);
            triggerNotification(contact, daysBefore);

            // Mark as sent
            sentReminders[uniqueKey] = now.getTime();
            updatedSent = true;
          }
        });

        if (updatedSent) {
          localStorage.setItem('birthday_sent_reminders', JSON.stringify(sentReminders));
        }
      } catch (err) {
        console.error('Error running checkReminders interval loop:', err);
      }
    };

    const triggerNotification = (contact, daysLeft) => {
      const title = `${contact.name}'s Birthday! 🎂`;
      let body = '';
      if (daysLeft === 0) {
        body = `Today is ${contact.name}'s birthday! 🎉`;
      } else if (daysLeft === 1) {
        body = `Tomorrow is ${contact.name}'s birthday! 🎈`;
      } else {
        body = `${contact.name}'s birthday is in ${daysLeft} days! 🎁`;
      }

      const defaultIcon = window.location.origin + '/icon.svg';

      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          if (navigator.serviceWorker) {
            navigator.serviceWorker.ready.then((registration) => {
              registration.showNotification(title, {
                body,
                icon: contact.image || defaultIcon,
                badge: defaultIcon,
                vibrate: [200, 100, 200],
                tag: `bday-reminder-${contact.id}`,
                renotify: true
              }).catch(() => {
                new Notification(title, {
                  body,
                  icon: contact.image || defaultIcon
                });
              });
            });
          } else {
            new Notification(title, {
              body,
              icon: contact.image || defaultIcon
            });
          }
        } catch (err) {
          console.error('Error triggering local desktop Notification:', err);
          // Fallback to in-app toast on error
          setToast({
            title,
            body,
            contact
          });
        }
      } else {
        // Fallback to in-app toast if native notifications are not supported or granted
        setToast({
          title,
          body,
          contact
        });
      }
    };

    // Run immediately on load, then every 30 seconds
    checkReminders();
    const intervalId = setInterval(checkReminders, 30000);

    return () => clearInterval(intervalId);
  }, [birthdays]);

  // 4. Request notification permission on startup if global reminders are enabled
  useEffect(() => {
    try {
      const globalSettings = JSON.parse(
        localStorage.getItem('birthday_reminders_settings') ||
        '{"enabled":true,"daysBefore":1,"notificationTime":"09:00","leapYearDaysBefore":1}'
      );
      if (globalSettings.enabled && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } catch (e) {
      console.log('Error prompting initial notification permission:', e);
    }
  }, []);


  // PWA install states
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        !!window.navigator.standalone
      );
    }
    return false;
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleSaveBirthday = (data) => {
    let wasEditing = false;
    const dataWithTimestamp = { ...data, updatedAt: Date.now() };
    setBirthdays((prev) => {
      const exists = prev.some((b) => b.id === data.id);
      if (exists) {
        wasEditing = true;
        return prev.map((b) => (b.id === data.id ? dataWithTimestamp : b));
      } else {
        return [...prev, dataWithTimestamp];
      }
    });

    if (wasEditing) {
      setSelectedBirthday(dataWithTimestamp);
    }

    // Pop the Edit state cleanly off the browser history stack
    if (window.history.state && window.history.length > 1) {
      window.history.back();
    } else {
      setCurrentView(wasEditing ? 'detail' : 'list');
    }
  };

  const handleDeleteBirthday = (id) => {
    setBirthdays((prev) => prev.filter((b) => b.id !== id));
    // Pop both Edit and Detail states cleanly off the stack to return straight to list dashboard
    if (window.history.state && window.history.length > 2) {
      window.history.go(-2);
    } else {
      setCurrentView('list');
    }
  };

  const handleEditSelect = (bday) => {
    setEditingBirthday(bday);
    setCurrentView('add');
  };

  const handleAddSelect = () => {
    setEditingBirthday(null);
    setCurrentView('add');
  };

  const handleUpdateBirthday = (data) => {
    const dataWithTimestamp = { ...data, updatedAt: Date.now() };
    setBirthdays((prev) => prev.map((b) => (b.id === data.id ? dataWithTimestamp : b)));
  };

  const handleCardSelect = (bday) => {
    setSelectedBirthday(bday);
    setCurrentView('detail');
  };

  // Safely find the updated birthday item inside detail view in case it was edited
  const activeBirthdayInDetail = birthdays.find(b => b.id === selectedBirthday?.id) || selectedBirthday;

  return (
    <div className="w-full min-h-screen bg-[#f2f5fa] relative overflow-x-hidden">
      {/* Premium Glassmorphic In-App Toast Notification */}
      {toast && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-[380px] bg-gradient-to-r from-[#F2591D] to-[#ff783e] text-white p-4 rounded-2xl shadow-[0_15px_30px_-5px_rgba(242,89,29,0.3)] border border-white/25 flex items-start gap-3.5 animate-slide-down cursor-pointer select-none"
          onClick={() => setToast(null)}
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl shrink-0 animate-bounce">
            🎂
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <span className="text-sm font-black tracking-tight leading-none">{toast.title}</span>
            <span className="text-xs text-white/90 font-semibold mt-1 leading-snug">{toast.body}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setToast(null);
            }}
            className="text-white/60 hover:text-white active:scale-90 transition-all font-bold text-xs p-1.5 rounded-full hover:bg-white/10 shrink-0 flex items-center justify-center w-6 h-6"
            aria-label="Close Notification"
          >
            ✕
          </button>
        </div>
      )}
      {currentView === 'list' && (
        <ListView
          birthdays={birthdays}
          onSelect={handleCardSelect}
          onNavigate={(view) => {
            if (view === 'add') handleAddSelect();
            else setCurrentView(view);
          }}
        />
      )}

      {currentView === 'detail' && activeBirthdayInDetail && (
        <DetailView
          birthday={activeBirthdayInDetail}
          onBack={() => goBack('list')}
          onEdit={handleEditSelect}
          onUpdate={handleUpdateBirthday}
          onNavigate={(view) => setCurrentView(view)}
        />
      )}

      {currentView === 'add' && (
        <AddEditView
          key={editingBirthday?.id || 'new'}
          editingBirthday={editingBirthday}
          onBack={() => {
            if (editingBirthday) goBack('detail');
            else goBack('list');
          }}
          onSave={handleSaveBirthday}
          onDelete={handleDeleteBirthday}
        />
      )}


      {currentView === 'settings' && (
        <SettingsView
          onBack={() => goBack('list')}
          onNavigate={(view) => setCurrentView(view)}
          birthdays={birthdays}
          deferredPrompt={deferredPrompt}
          isAppInstalled={isAppInstalled}
          onAppInstalled={() => {
            setIsAppInstalled(true);
            setDeferredPrompt(null);
          }}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(prev => !prev)}
        />
      )}

      {currentView === 'pro' && (
        <ProView
          onBack={() => goBack('settings')}
        />
      )}

      {currentView === 'privacy' && (
        <PrivacyPolicy
          onBack={() => goBack('settings')}
        />
      )}

      {currentView === 'calendar_coming_soon' && (
        <CalendarComingSoon
          onBack={() => goBack('detail')}
        />
      )}
    </div>
  );
}

export default App;
