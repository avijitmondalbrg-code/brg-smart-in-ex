/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const DEFAULT_APP_LOGO = "https://www.bengalrehabilitationgroup.com/images/brg_logo.png";
export const LOGO_STORAGE_KEY = "brg_custom_app_logo";

/**
 * Retrieves the stored logo from local storage or defaults to the original BRG logo
 */
export function getInitialAppLogo(): string {
  try {
    const saved = localStorage.getItem(LOGO_STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch (e) {
    console.warn("Unable to access localStorage for logo:", e);
  }
  return DEFAULT_APP_LOGO;
}

/**
 * Saves a logo URL or Data URL to local storage
 */
export function saveLogoToLocalStorage(logo: string): void {
  try {
    localStorage.setItem(LOGO_STORAGE_KEY, logo);
  } catch (e) {
    console.warn("Unable to save logo to localStorage:", e);
  }
}

/**
 * Removes custom logo from local storage
 */
export function removeLogoFromLocalStorage(): void {
  try {
    localStorage.removeItem(LOGO_STORAGE_KEY);
  } catch (e) {
    console.warn("Unable to remove logo from localStorage:", e);
  }
}

/**
 * Scales down and optimizes an uploaded image file into a compact Base64 Data URL.
 * Ensures the image fits comfortably in localStorage and Firestore without exceeding limits,
 * while maintaining sharpness and transparent backgrounds for logos.
 */
export function compressAndEncodeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's an SVG file and under 250KB, read directly as Data URL to maintain vector quality
    if (file.type === "image/svg+xml" && file.size < 250 * 1024) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback to original reader result if canvas context unavailable
          resolve(readerEvent.target?.result as string);
          return;
        }

        // Draw image onto canvas preserving transparency
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG format for transparency if original was PNG/WebP, else JPEG
        const outputMime = file.type === "image/png" || file.type === "image/webp" 
          ? "image/png" 
          : "image/jpeg";
        
        const dataUrl = canvas.toDataURL(outputMime, 0.92);
        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image file. Please ensure it is a valid image."));
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
