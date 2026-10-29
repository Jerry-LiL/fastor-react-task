import React, { useRef, useState, useEffect, useCallback } from 'react';
import fastorLogo from '../assets/fastor-logo.svg';
import { clampOverlayPosition, getInitialCenteredPosition } from '../utils/overlay';

export default function LogoOverlay({ containerRef, onPositionChange, currentPosition }) {
  const overlayRef = useRef(null);
  const onPositionChangeRef = useRef(onPositionChange);
  onPositionChangeRef.current = onPositionChange;

  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    itemWidth: 145,
    itemHeight: 28,
  });

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Sync with currentPosition prop if parent controls or updates it
  useEffect(() => {
    if (currentPosition) {
      setPosition(currentPosition);
    }
  }, [currentPosition]);

  // Center logo initially once container is measured
  const initializePosition = useCallback(() => {
    if (!containerRef?.current || !overlayRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const overlayRect = overlayRef.current.getBoundingClientRect();

    const itemWidth = overlayRect.width || 145;
    const itemHeight = overlayRect.height || 28;

    dragRef.current.itemWidth = itemWidth;
    dragRef.current.itemHeight = itemHeight;

    const initial = getInitialCenteredPosition({
      containerWidth: containerRect.width,
      containerHeight: containerRect.height,
      itemWidth,
      itemHeight,
    });

    setPosition(initial);
    if (onPositionChangeRef.current) {
      onPositionChangeRef.current(initial, {
        containerWidth: containerRect.width,
        containerHeight: containerRect.height,
        itemWidth,
        itemHeight,
      });
    }
    setIsInitialized(true);
  }, [containerRef]);

  useEffect(() => {
    initializePosition();

    const handleResize = () => {
      initializePosition();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializePosition]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (!containerRef?.current || !overlayRef.current) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // pointer capture fallback
    }

    const overlayRect = overlayRef.current.getBoundingClientRect();

    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      itemWidth: overlayRect.width || 145,
      itemHeight: overlayRect.height || 28,
    };

    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging || !containerRef?.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    const rawX = dragRef.current.initialX + deltaX;
    const rawY = dragRef.current.initialY + deltaY;

    const clamped = clampOverlayPosition(
      { x: rawX, y: rawY },
      {
        containerWidth: containerRect.width,
        containerHeight: containerRect.height,
        itemWidth: dragRef.current.itemWidth,
        itemHeight: dragRef.current.itemHeight,
      }
    );

    setPosition(clamped);
    if (onPositionChangeRef.current) {
      onPositionChangeRef.current(clamped, {
        containerWidth: containerRect.width,
        containerHeight: containerRect.height,
        itemWidth: dragRef.current.itemWidth,
        itemHeight: dragRef.current.itemHeight,
      });
    }
  };

  const handlePointerUp = (e) => {
    if (dragRef.current.isDragging) {
      dragRef.current.isDragging = false;
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div
      ref={overlayRef}
      className={`logo-overlay ${isDragging ? 'dragging' : ''} ${isInitialized ? 'ready' : ''}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      data-testid="draggable-logo"
      role="button"
      tabIndex={0}
      aria-label="Draggable Fastor Logo"
    >
      <div className="logo-overlay-badge">
        <img
          src={fastorLogo}
          alt="Fastor Logo"
          className="overlay-svg-logo"
          draggable="false"
        />
      </div>
      <div className="drag-hint">Drag me</div>
    </div>
  );
}
