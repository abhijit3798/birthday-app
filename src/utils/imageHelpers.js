/**
 * Reads an image file, crops it to a square, resizes it to standard avatar dimensions,
 * and compresses it to JPEG format to minimize localStorage impact.
 * 
 * @param {File} file - The uploaded image file
 * @param {number} [maxWidth=128] - Target width
 * @param {number} [maxHeight=128] - Target height
 * @returns {Promise<string>} Base64 data URL of the compressed image
 */
export function compressImage(file, maxWidth = 128, maxHeight = 128) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const width = img.width;
        const height = img.height;

        // Crop to a square centered area
        const size = Math.min(width, height);
        canvas.width = maxWidth;
        canvas.height = maxHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(
          img,
          (width - size) / 2,
          (height - size) / 2,
          size,
          size,
          0,
          0,
          maxWidth,
          maxHeight
        );

        // Convert to highly-compressed JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      
      img.onerror = (err) => reject(err);
    };
    
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Extract initials from a full name.
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0] ? parts[0][0].toUpperCase() : '?';
}

/**
 * Returns Tailwind gradient classes based on the category.
 * @param {string} category
 * @returns {string}
 */
export function getCategoryGradient(category) {
  switch (category?.toLowerCase()) {
    case 'family':
      return 'from-pink-500 to-rose-600';
    case 'friends':
      return 'from-emerald-400 to-teal-600';
    case 'work':
      return 'from-amber-400 to-orange-500';
    default:
      return 'from-[#F2591D] to-[#b83407]';
  }
}

