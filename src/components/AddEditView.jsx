import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Zap, ZapOff, RefreshCw } from 'lucide-react';
import { CakeIcon } from './CakeIcon';

export function AddEditView({ editingBirthday, onBack, onSave, onDelete }) {
  // Compute initial states directly based on editingBirthday prop
  const getInitialNameParts = () => {
    return (editingBirthday?.name || '').trim().split(/\s+/);
  };
  
  const nameParts = getInitialNameParts();
  
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '');
  const [date, setDate] = useState(editingBirthday?.date || '');
  const [phoneNumber, setPhoneNumber] = useState(editingBirthday?.phoneNumber || '');
  const [emailAddress, setEmailAddress] = useState(editingBirthday?.emailAddress || '');
  const [notes, setNotes] = useState(editingBirthday?.notes || '');
  const [image, setImage] = useState(() => {
    const img = editingBirthday?.image || '';
    return (img === '/cake-icon.png' || img === 'cake-icon.png' || img.endsWith('cake-icon.png')) ? '' : img;
  });
  const [hideYear, setHideYear] = useState(editingBirthday?.hideYear || false);
  const [category] = useState(editingBirthday?.category || 'friends');

  const [showPhotoPopover, setShowPhotoPopover] = useState(false);
  const [errors, setErrors] = useState({});

  // DatePicker States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasChosenDate, setHasChosenDate] = useState(!!editingBirthday?.date);

  const getInitialYearVal = () => {
    if (editingBirthday?.date) {
      const d = new Date(editingBirthday.date);
      return isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear();
    }
    return new Date().getFullYear();
  };

  const getInitialMonthVal = () => {
    if (editingBirthday?.date) {
      const d = new Date(editingBirthday.date);
      return isNaN(d.getTime()) ? new Date().getMonth() : d.getMonth();
    }
    return new Date().getMonth();
  };

  const getInitialDayVal = () => {
    if (editingBirthday?.date) {
      const d = new Date(editingBirthday.date);
      return isNaN(d.getTime()) ? new Date().getDate() : d.getDate();
    }
    return new Date().getDate();
  };

  const [calendarMonth, setCalendarMonth] = useState(getInitialMonthVal);
  const [calendarYear, setCalendarYear] = useState(getInitialYearVal);
  const [calendarSelectedDay, setCalendarSelectedDay] = useState(getInitialDayVal);
  const [calendarHideYear, setCalendarHideYear] = useState(editingBirthday?.hideYear || false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const popoverRef = useRef(null);
  const monthDropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);

  // Webcam states and refs
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('user');
  const [flashOn, setFlashOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Image adjustment states
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [rawImage, setRawImage] = useState('');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Handle click outside popover to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowPhotoPopover(false);
      }
    };
    if (showPhotoPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPhotoPopover]);

  // Handle click outside Month and Year dropdowns to close them
  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
        setShowMonthDropdown(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setShowYearDropdown(false);
      }
    };
    if (showMonthDropdown || showYearDropdown) {
      document.addEventListener('mousedown', handleClickOutsideDropdown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideDropdown);
    };
  }, [showMonthDropdown, showYearDropdown]);

  const handleOpenDatePicker = () => {
    document.activeElement?.blur();
    if (date) {
      const parts = date.split('-');
      if (parts.length === 3) {
        setCalendarYear(parseInt(parts[0]));
        setCalendarMonth(parseInt(parts[1]) - 1);
        setCalendarSelectedDay(parseInt(parts[2]));
      }
    }
    setCalendarHideYear(hideYear);
    setShowDatePicker(true);
  };

  const handleDoneDatePicker = () => {
    setHasChosenDate(true);
    const y = calendarHideYear ? new Date().getFullYear() : calendarYear;
    const m = String(calendarMonth + 1).padStart(2, '0');
    const d = String(calendarSelectedDay).padStart(2, '0');
    setDate(`${y}-${m}-${d}`);
    setHideYear(calendarHideYear);
    setShowDatePicker(false);
  };

  const handlePrevMonth = () => {
    setCalendarMonth((prev) => {
      if (prev === 0) {
        setCalendarYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCalendarMonth((prev) => {
      if (prev === 11) {
        setCalendarYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const getCalendarDays = (month, year) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    const prevDays = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      prevDays.push({
        day: prevMonthTotalDays - i,
        isCurrentMonth: false,
        month: month === 0 ? 11 : month - 1,
        year: month === 0 ? year - 1 : year
      });
    }

    const currentDays = [];
    for (let i = 1; i <= totalDays; i++) {
      currentDays.push({
        day: i,
        isCurrentMonth: true,
        month,
        year
      });
    }

    const nextDays = [];
    const totalCells = 42;
    const remainingCells = totalCells - (prevDays.length + currentDays.length);
    for (let i = 1; i <= remainingCells; i++) {
      nextDays.push({
        day: i,
        isCurrentMonth: false,
        month: month === 11 ? 0 : month + 1,
        year: month === 11 ? year + 1 : year
      });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  };

  const getFormattedBirthdayLabel = () => {
    if (!hasChosenDate || !date) return '';
    const MONTH_NAMES = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const parts = date.split('-');
    if (parts.length < 3) return '';
    const y = parseInt(parts[0]);
    const m = parseInt(parts[1]) - 1;
    const d = parseInt(parts[2]);
    
    const monthName = MONTH_NAMES[m] || '';
    if (hideYear) {
      return `${monthName} ${d}`;
    }
    return `${monthName} ${d}, ${y}`;
  };

  // Webcam stream management
  useEffect(() => {
    let activeStream = null;
    if (showCameraModal) {
      setCameraActive(false);
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 400 }, height: { ideal: 400 } },
        audio: false
      })
      .then((stream) => {
        activeStream = stream;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);

        // Check if torch (flash) is supported
        const track = stream.getVideoTracks()[0];
        if (track && typeof track.getCapabilities === 'function') {
          try {
            const capabilities = track.getCapabilities();
            if (capabilities.torch) {
              setTorchSupported(true);
              // Apply current flash state
              track.applyConstraints({
                advanced: [{ torch: flashOn }]
              }).catch(e => console.log('Error applying initial torch constraint:', e));
            } else {
              setTorchSupported(false);
            }
          } catch (e) {
            console.log('Error reading camera capabilities:', e);
            setTorchSupported(false);
          }
        } else {
          setTorchSupported(false);
        }
      })
      .catch((err) => {
        console.error('Camera access error:', err);
        setCameraError('Unable to access camera. Please check permissions or select a photo instead.');
      });
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      streamRef.current = null;
      setCameraActive(false);
    };
  }, [showCameraModal, facingMode]);

  const handleToggleFlash = () => {
    const nextFlash = !flashOn;
    setFlashOn(nextFlash);
    const track = streamRef.current?.getVideoTracks()[0];
    if (track && torchSupported) {
      track.applyConstraints({
        advanced: [{ torch: nextFlash }]
      }).catch((err) => {
        console.error('Error toggling flash/torch:', err);
      });
    }
  };

  const handleCloseCamera = () => {
    setShowCameraModal(false);
    setFacingMode('user');
    setFlashOn(false);
    setTorchSupported(false);
  };

  const handleStartCamera = () => {
    setCameraError('');
    setFacingMode('user');
    setFlashOn(false);
    setTorchSupported(false);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setShowCameraModal(true);
    } else {
      cameraInputRef.current?.click();
    }
    setShowPhotoPopover(false);
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;
      canvas.width = vw;
      canvas.height = vh;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, vw, vh);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setRawImage(dataUrl);
        setZoom(1);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
        setShowCameraModal(false);
        setShowAdjustModal(true);
      }
    } catch (err) {
      console.error('Error capturing image:', err);
    }
  };

  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawImage(event.target.result);
        setZoom(1);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
        setShowAdjustModal(true);
        setShowPhotoPopover(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Image selection error:', err);
    }
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    const coords = getCoordinates(e);
    setDragStart({
      x: coords.x - offset.x,
      y: coords.y - offset.y
    });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const coords = getCoordinates(e);
    setOffset({
      x: coords.x - dragStart.x,
      y: coords.y - dragStart.y
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const getCoordinates = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleSaveCrop = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = rawImage;
    img.onload = () => {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scaleFactor = 128 / 256;
      const tx = offset.x * scaleFactor;
      const ty = offset.y * scaleFactor;

      // Apply translation in unrotated parent coordinate space to match CSS transform preview exactly!
      ctx.translate(cx + tx, cy + ty);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      const imgWidth = img.width;
      const imgHeight = img.height;
      
      let drawWidth = 128;
      let drawHeight = 128;
      
      const imgRatio = imgWidth / imgHeight;
      if (imgRatio > 1) {
        drawWidth = 128;
        drawHeight = 128 / imgRatio;
      } else {
        drawWidth = 128 * imgRatio;
        drawHeight = 128;
      }
      
      ctx.drawImage(
        img,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );

      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      setImage(base64);
      setShowAdjustModal(false);
    };
  };

  const handleValidate = () => {
    const newErrors = {};
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!hasChosenDate || !date) {
      newErrors.date = 'Birthday date is required';
    } else {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        newErrors.date = 'Invalid date';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    if (!handleValidate()) return;

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const data = {
      id: editingBirthday ? editingBirthday.id : Date.now().toString(),
      name: fullName,
      date,
      phoneNumber: phoneNumber.trim(),
      emailAddress: emailAddress.trim(),
      notes: notes.trim(),
      image,
      hideYear,
      category,
      customReminders: editingBirthday ? editingBirthday.customReminders : undefined
    };

    onSave(data);
  };

  const handleDeleteClick = () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (window.confirm(`Are you sure you want to delete ${fullName || 'this birthday'}?`)) {
      onDelete(editingBirthday.id);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f2f5fa] dark:bg-[#0b0f19] flex flex-col items-center animate-fade-in relative safe-pb-container select-none">
      
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageFile}
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="user"
        onChange={handleImageFile}
        className="hidden"
      />

      <div className="w-full max-w-[440px] px-4 safe-pt flex flex-col gap-5">
        
        {/* Navigation Header matching Image 1/2 */}
        <header className="w-full flex justify-between items-center bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-3xl p-3.5 shadow-sm">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-50 dark:hover:bg-[#1e293b] rounded-full transition-all text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 cursor-pointer flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          
          <button
            onClick={handleFormSubmit}
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-[#F2591D] text-white rounded-full text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-white/10"
          >
            Save
          </button>
        </header>

        {/* Input Form Card */}
        <div className="bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#222e45] rounded-[32px] p-6 shadow-md flex flex-col items-center relative">
          
          {/* Headline Title */}
          <h1 className="text-2xl font-black text-[#F2591D] font-headings mb-5 tracking-tight w-full text-left">
            {editingBirthday ? 'Edit Birthday' : 'Add Birthday'}
          </h1>

          {/* Photo Frame Container with dynamic action sheet popover matching Image 1 */}
          <div className="relative flex flex-col items-center mb-6 z-30">
            {image ? (
              <div
                onClick={() => setShowPhotoPopover(!showPhotoPopover)}
                className="w-24 h-24 rounded-3xl overflow-hidden border border-gray-200 dark:border-[#222e45] shadow-md cursor-pointer relative group"
              >
                <img src={image} alt="Profile preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-[10px] font-bold text-white uppercase tracking-wider">
                  Change
                </div>
              </div>
            ) : (
              <div
                onClick={() => setShowPhotoPopover(!showPhotoPopover)}
                className="w-24 h-24 bg-[#F2591D] hover:brightness-110 rounded-3xl flex flex-col items-center justify-center text-white cursor-pointer shadow-md transition-all gap-1.5"
              >
                <CakeIcon size={44} />
                <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-90">Add Photo</span>
              </div>
            )}

            {/* Float Popover matching Image 1 */}
            {showPhotoPopover && (
              <div
                ref={popoverRef}
                className="absolute top-[105%] bg-white/95 dark:bg-[#151c2c]/95 border border-gray-200 dark:border-[#222e45] shadow-2xl rounded-2xl p-3 w-56 flex flex-col gap-2.5 z-50 animate-scale-in text-center before:content-[''] before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-b-white/95 dark:before:border-b-[#151c2c]/95"
              >
                <button
                  type="button"
                  onClick={handleStartCamera}
                  className="w-full py-2.5 bg-gray-50 dark:bg-[#0c1220] hover:bg-gray-100 dark:hover:bg-[#1e293b] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  Take Photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowPhotoPopover(false);
                  }}
                  className="w-full py-2.5 bg-gray-50 dark:bg-[#0c1220] hover:bg-gray-100 dark:hover:bg-[#1e293b] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  Choose Photo
                </button>
                {image && (
                  <button
                    type="button"
                    onClick={() => {
                      setImage('');
                      setShowPhotoPopover(false);
                    }}
                    className="w-full py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Delete Photo
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Input Fields block */}
          <form className="w-full space-y-4">
            
            {/* First Name Input */}
            <div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="ios-input"
              />
              {errors.firstName && <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.firstName}</span>}
            </div>

            {/* Last Name Input */}
            <div>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="ios-input"
              />
            </div>

            {/* Birthday Date Selection */}
            <div>
              <input
                type="text"
                readOnly
                value={getFormattedBirthdayLabel()}
                onClick={handleOpenDatePicker}
                placeholder="Birthday"
                className="ios-input cursor-pointer"
              />
              {errors.date && <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.date}</span>}
            </div>

            {/* Phone Number Input */}
            <div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number"
                className="ios-input"
              />
            </div>

            {/* Email Address Input */}
            <div>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="Email Address"
                className="ios-input"
              />
            </div>

            {/* Notes Textarea */}
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes"
                rows={2}
                className="ios-input resize-none"
              />
            </div>

          </form>

          {editingBirthday && (
            <div className="w-full pt-4 border-t border-slate-100 dark:border-[#222e45] mt-6">
              <button
                type="button"
                onClick={handleDeleteClick}
                className="w-full py-3 bg-red-50 dark:bg-red-950/15 hover:bg-red-100/80 dark:hover:bg-red-950/30 active:bg-red-200 text-red-600 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer text-center uppercase tracking-wider border border-red-200/40 dark:border-red-900/30"
              >
                Delete Birthday
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#151c2c] border dark:border-[#222e45] rounded-[28px] p-5 w-full max-w-[340px] shadow-2xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 text-center">
              Take Photo
            </h3>
            
            <div className="relative aspect-square w-full bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              {cameraError ? (
                <div className="text-center p-4 text-xs font-semibold text-red-500 flex flex-col items-center gap-3">
                  <span>{cameraError}</span>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseCamera();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-black cursor-pointer shadow-md"
                  >
                    Choose from Files
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                    className="w-full h-full object-cover"
                  />

                  {/* Camera Viewfinder Controls Overlay */}
                  {cameraActive && (
                    <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none z-10">
                      {/* Top Bar for Flash Toggle */}
                      <div className="flex justify-end pointer-events-auto">
                        {torchSupported && (
                          <button
                            type="button"
                            onClick={handleToggleFlash}
                            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md active:scale-90 cursor-pointer ${
                              flashOn 
                                ? 'bg-amber-500 text-white hover:bg-amber-600' 
                                : 'bg-black/40 text-white/90 hover:bg-black/60'
                            }`}
                            aria-label="Toggle Flash"
                          >
                            {flashOn ? <Zap size={18} /> : <ZapOff size={18} />}
                          </button>
                        )}
                      </div>
                      
                      {/* Bottom Bar for Switch Camera Toggle */}
                      <div className="flex justify-end pointer-events-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
                            setFlashOn(false); // Reset flash state on switch
                          }}
                          className="p-2 rounded-full bg-black/40 text-white/90 hover:bg-black/60 backdrop-blur-md transition-all shadow-md active:scale-90 cursor-pointer hover:text-white"
                          aria-label="Switch Camera"
                        >
                          <RefreshCw size={18} className="transform active:rotate-180 transition-transform duration-300" />
                        </button>
                      </div>
                    </div>
                  )}

                  {!cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCloseCamera}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-[#1a2336] hover:bg-slate-200 dark:hover:bg-[#1e293b] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer text-center"
              >
                Cancel
              </button>
              {cameraActive && !cameraError && (
                <button
                  type="button"
                  onClick={handleCapture}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-[#1a508b] text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer text-center"
                >
                  Capture
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Adjust/Cropper Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#151c2c] border dark:border-[#222e45] rounded-[28px] p-5 w-full max-w-[340px] shadow-2xl flex flex-col items-center gap-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 text-center">
              Adjust Photo
            </h3>
            
            {/* Squircle crop area */}
            <div
              className="w-64 h-64 rounded-[32px] overflow-hidden border-4 border-white dark:border-[#222e45] shadow-lg relative bg-slate-900 cursor-move flex items-center justify-center touch-none select-none"
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            >
              <img
                src={rawImage}
                alt="Adjust preview"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
                className="pointer-events-none select-none"
              />
              {/* Squircle guide outline overlay */}
              <div className="absolute inset-0 rounded-[28px] border-2 border-dashed border-blue-500/40 pointer-events-none"></div>
            </div>

            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center uppercase tracking-wide">
              Drag to position • Pinch/slide to zoom
            </p>

            {/* Zoom Slider */}
            <div className="flex flex-col gap-1.5 w-full px-2">
              <div className="flex justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <span>Zoom</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-[#0c1220] rounded-lg appearance-none cursor-pointer accent-[#F2591D]"
              />
            </div>

            {/* Controls */}
            <div className="flex gap-2 w-full justify-between pt-1">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="px-3.5 py-2 bg-slate-50 dark:bg-[#0c1220] hover:bg-slate-100 dark:hover:bg-[#1e293b] text-slate-600 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200/50 dark:border-[#222e45]/50 cursor-pointer"
              >
                Rotate 90°
              </button>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-[#1a2336] hover:bg-slate-200 dark:hover:bg-[#1e293b] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCrop}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-[#F2591D] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Apply
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Gorgeous iOS Calendar Picker Popup Modal */}
      {showDatePicker && (() => {
        const MONTH_NAMES = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const calendarDays = getCalendarDays(calendarMonth, calendarYear);
        const today = new Date();
        
        return (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop overlay with blur */}
            <div 
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
              onClick={() => setShowDatePicker(false)}
            />
            
            {/* Calendar card popup */}
            <div className="bg-white dark:bg-[#151c2c] rounded-[28px] w-full max-w-[340px] shadow-2xl border border-slate-100/80 dark:border-[#222e45] z-[1001] animate-scale-in overflow-hidden flex flex-col">
              
              {/* Header select section */}
              <div className="flex justify-between items-center px-4 pt-4 pb-2 border-b border-slate-100 dark:border-[#222e45] bg-white dark:bg-[#151c2c]">
                
                {/* Previous Month Button */}
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-[#1e293b] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 rounded-xl transition-all active:scale-90 cursor-pointer flex items-center justify-center border border-slate-200/30 dark:border-[#222e45]/30 bg-white dark:bg-[#151c2c] shadow-sm"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={16} className="stroke-[2.5]" />
                </button>

                {/* Dropdowns pills */}
                <div className="flex items-center gap-1.5">
                  {/* Month Select Wrapper */}
                  <div className="relative" ref={monthDropdownRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMonthDropdown(!showMonthDropdown);
                        setShowYearDropdown(false);
                      }}
                      className="flex items-center gap-1 bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-[#222e45] shadow-sm rounded-xl pl-2.5 pr-6 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none hover:bg-slate-50 dark:hover:bg-[#1a2336] transition-all active:scale-95 relative min-w-[85px] text-left"
                    >
                      <span className="truncate pr-1">{MONTH_NAMES[calendarMonth]}</span>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 dark:text-slate-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {showMonthDropdown && (
                      <div className="absolute top-[115%] left-0 z-[1050] bg-slate-900/95 dark:bg-[#0c1220]/95 backdrop-blur-md border border-slate-700 dark:border-[#222e45] rounded-2xl shadow-2xl py-1.5 w-32 max-h-60 overflow-y-auto animate-scale-in">
                        {MONTH_NAMES.map((name, idx) => {
                          const isSelected = calendarMonth === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setCalendarMonth(idx);
                                setShowMonthDropdown(false);
                              }}
                              className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                isSelected
                                  ? 'text-white bg-blue-500/30'
                                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <span className={`w-3 flex items-center justify-center shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                                ✓
                              </span>
                              <span>{name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Year Select Wrapper */}
                  <div className="relative" ref={yearDropdownRef}>
                    <button
                      type="button"
                      disabled={calendarHideYear}
                      onClick={() => {
                        setShowYearDropdown(!showYearDropdown);
                        setShowMonthDropdown(false);
                      }}
                      className="flex items-center gap-1 bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-[#222e45] shadow-sm rounded-xl pl-2.5 pr-6 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none hover:bg-slate-50 dark:hover:bg-[#1a2336] disabled:opacity-40 disabled:bg-slate-100 disabled:dark:bg-slate-800 disabled:cursor-not-allowed transition-all active:scale-95 relative min-w-[70px] text-left"
                    >
                      <span>{calendarYear}</span>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 dark:text-slate-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {showYearDropdown && !calendarHideYear && (
                      <div className="absolute top-[115%] right-0 z-[1050] bg-slate-900/95 dark:bg-[#0c1220]/95 backdrop-blur-md border border-slate-700 dark:border-[#222e45] rounded-2xl shadow-2xl py-1.5 w-28 max-h-60 overflow-y-auto animate-scale-in">
                        {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i).map((y) => {
                          const isSelected = calendarYear === y;
                          return (
                            <button
                              key={y}
                              type="button"
                              onClick={() => {
                                setCalendarYear(y);
                                setShowYearDropdown(false);
                              }}
                              className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                isSelected
                                  ? 'text-white bg-blue-500/30'
                                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <span className={`w-3 flex items-center justify-center shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                                ✓
                              </span>
                              <span>{y}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Month Button */}
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-[#1e293b] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 rounded-xl transition-all active:scale-90 cursor-pointer flex items-center justify-center border border-slate-200/30 dark:border-[#222e45]/30 bg-white dark:bg-[#151c2c] shadow-sm"
                  aria-label="Next month"
                >
                  <ChevronRight size={16} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Grid content */}
              <div className="p-4 flex flex-col items-center">
                {/* Week headers */}
                <div className="grid grid-cols-7 gap-x-1 w-full border-b border-slate-100 dark:border-[#222e45] pb-2 text-center">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                    <div key={d} className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-y-2 gap-x-1 w-full mt-3 justify-items-center">
                  {calendarDays.map((cell, idx) => {
                    const isSelected =
                      cell.isCurrentMonth &&
                      cell.day === calendarSelectedDay &&
                      cell.month === calendarMonth &&
                      cell.year === calendarYear;
                    
                    const isCurrentDay =
                      cell.day === today.getDate() &&
                      cell.month === today.getMonth() &&
                      cell.year === today.getFullYear();

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (cell.isCurrentMonth) {
                            setCalendarSelectedDay(cell.day);
                          } else {
                            setCalendarMonth(cell.month);
                            setCalendarYear(cell.year);
                            setCalendarSelectedDay(cell.day);
                          }
                        }}
                        className={`aspect-square w-9 h-9 rounded-full text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-500 to-[#F2591D] text-white shadow-md shadow-blue-500/25 scale-105'
                            : isCurrentDay
                            ? 'border border-blue-500 text-blue-600 dark:text-blue-400 font-extrabold hover:bg-blue-50 dark:hover:bg-blue-950/20'
                            : cell.isCurrentMonth
                            ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e293b]'
                            : 'text-slate-300 dark:text-slate-600 opacity-40 hover:bg-slate-50 dark:hover:bg-[#1e293b]/20'
                        }`}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hide Year Toggle Switch inside Footer */}
              <div className="flex justify-between items-center px-5 py-3.5 border-t border-slate-100 dark:border-[#222e45] bg-slate-50/50 dark:bg-[#0c1220]/50 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Hide birth year</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Only show month/day</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={calendarHideYear}
                    onChange={(e) => setCalendarHideYear(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-9 h-5 rounded-full transition-all duration-200 relative ${calendarHideYear ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-4 w-4 transition-transform duration-200 ${calendarHideYear ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </label>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[#222e45] bg-white dark:bg-[#151c2c]">
                <button
                  type="button"
                  onClick={() => setShowDatePicker(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-[#1a2336] hover:bg-slate-200 dark:hover:bg-[#1e293b] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDoneDatePicker}
                  className="flex-1 py-2 bg-[#F2591D] hover:bg-[#C24717] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer text-center"
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

export default AddEditView;
