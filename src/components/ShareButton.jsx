import React, { useState } from 'react';
import fastorLogoUrl from '../assets/fastor-logo.svg';

/**
 * Loads an HTMLImageElement with crossOrigin="anonymous".
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Draws rounded rectangle helper for canvas.
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export default function ShareButton({
  imageSrc,
  restaurantName = 'Restaurant',
  overlayBounds,
  className = '',
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const showFeedback = (msg, duration = 4000) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, duration);
  };

  const handleShare = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      const targetWidth = 800;
      const targetHeight = 500;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      let taintedFallback = false;

      // 1. Attempt to load the background restaurant image
      try {
        if (imageSrc && !imageSrc.startsWith('data:')) {
          const bgImg = await loadImage(imageSrc);
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
          taintedFallback = true;
        }
      } catch {
        // Image failed to load or CORS error
        taintedFallback = true;
      }

      // If background failed or CORS tainted, render a styled Fastor card background
      if (taintedFallback) {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#1E2230');
        grad.addColorStop(1, '#0F111A');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Decorative background accent
        ctx.fillStyle = 'rgba(255, 109, 106, 0.15)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 180, 0, Math.PI * 2);
        ctx.fill();

        // Restaurant Title text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px Urbanist, Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(restaurantName, canvas.width / 2, canvas.height * 0.32);

        ctx.fillStyle = '#FF6D6A';
        ctx.font = '600 20px Urbanist, Inter, sans-serif';
        ctx.fillText('FASTOR DINING EXPERIENCE', canvas.width / 2, canvas.height * 0.40);
      }

      // 2. Draw the Fastor logo overlay at the user-positioned relative coordinates
      try {
        const logoImg = await loadImage(fastorLogoUrl);

        let destX, destY, destW, destH;

        if (overlayBounds && overlayBounds.containerWidth && overlayBounds.containerHeight) {
          const relX = overlayBounds.x / overlayBounds.containerWidth;
          const relY = overlayBounds.y / overlayBounds.containerHeight;
          const relW = overlayBounds.itemWidth / overlayBounds.containerWidth;
          const relH = overlayBounds.itemHeight / overlayBounds.containerHeight;

          destX = relX * canvas.width;
          destY = relY * canvas.height;
          destW = Math.max(120, relW * canvas.width);
          destH = Math.max(34, relH * canvas.height);
        } else {
          // Centered fallback
          destW = 160;
          destH = 40;
          destX = (canvas.width - destW) / 2;
          destY = (canvas.height - destH) / 2;
        }

        // Pill backdrop for the logo
        ctx.fillStyle = 'rgba(15, 18, 25, 0.75)';
        drawRoundedRect(ctx, destX - 10, destY - 8, destW + 20, destH + 16, 12);
        ctx.fill();

        // Logo image
        ctx.drawImage(logoImg, destX, destY, destW, destH);
      } catch (err) {
        console.warn('Could not draw logo overlay to canvas', err);
      }

      // 3. Export canvas to blob
      let blob;
      try {
        blob = await new Promise((resolve, reject) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error('Canvas toBlob failed'));
          }, 'image/png');
        });
      } catch {
        // In case canvas was tainted despite crossOrigin="anonymous"
        taintedFallback = true;
        // Create an un-tainted canvas fallback
        const safeCanvas = document.createElement('canvas');
        safeCanvas.width = 600;
        safeCanvas.height = 400;
        const sCtx = safeCanvas.getContext('2d');
        sCtx.fillStyle = '#1A1C24';
        sCtx.fillRect(0, 0, 600, 400);
        sCtx.fillStyle = '#FFFFFF';
        sCtx.font = 'bold 28px sans-serif';
        sCtx.textAlign = 'center';
        sCtx.fillText(restaurantName, 300, 180);
        sCtx.fillStyle = '#FF6D6A';
        sCtx.font = '20px sans-serif';
        sCtx.fillText('FASTOR DINING', 300, 220);

        blob = await new Promise((res) => safeCanvas.toBlob(res, 'image/png'));
      }

      const fileName = `${restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-fastor.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // 4. Share using Web Share API or download fallback
      let sharedViaApi = false;
      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.share
      ) {
        try {
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: restaurantName,
              text: `Check out ${restaurantName} on Fastor!`,
            });
            sharedViaApi = true;
            showFeedback('Shared successfully!');
          }
        } catch (shareErr) {
          if (shareErr.name !== 'AbortError') {
            console.warn('Navigator share error, falling back to download', shareErr);
          } else {
            // User cancelled share sheet
            setIsProcessing(false);
            return;
          }
        }
      }

      if (!sharedViaApi) {
        // Trigger file download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        if (taintedFallback) {
          showFeedback('Image downloaded (CORS fallback used for external S3 host)');
        } else {
          showFeedback('Composite image downloaded successfully!');
        }
      }
    } catch (err) {
      console.error('Share failed', err);
      showFeedback('Could not create share image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="share-btn-wrapper">
      <button
        type="button"
        onClick={handleShare}
        disabled={isProcessing}
        className={`share-button ${className}`}
        aria-label="Share composite restaurant image"
        data-testid="share-composite-btn"
      >
        <span className="share-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </span>
        <span>{isProcessing ? 'Creating image...' : 'Share'}</span>
      </button>

      {feedbackMessage && (
        <div className="share-feedback-toast" role="status" aria-live="polite">
          {feedbackMessage}
        </div>
      )}
    </div>
  );
}
