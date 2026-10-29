import React, { useRef, useEffect } from 'react';

export default function OtpInput({ length = 6, value = '', onChange, disabled = false, autoFocus = true }) {
  const inputRefs = useRef([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const handleChange = (index, e) => {
    const rawVal = e.target.value;
    // Only accept numeric digits
    const cleaned = rawVal.replace(/\D/g, '');

    if (!cleaned) {
      // User cleared the input
      const newDigits = [...digits];
      newDigits[index] = '';
      onChange(newDigits.join(''));
      return;
    }

    // If more than one digit was typed/inserted in single event
    if (cleaned.length > 1) {
      handlePastedText(cleaned, index);
      return;
    }

    const digit = cleaned[cleaned.length - 1];
    const newDigits = [...digits];
    newDigits[index] = digit;
    const nextVal = newDigits.join('');
    onChange(nextVal);

    // Auto-advance to next box
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current box is empty, move back and clear previous
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
        e.preventDefault();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const cleaned = pasteData.replace(/\D/g, '');
    if (cleaned) {
      handlePastedText(cleaned, 0);
    }
  };

  const handlePastedText = (text, startIndex = 0) => {
    const newDigits = [...digits];
    let writeIdx = startIndex;
    for (let i = 0; i < text.length && writeIdx < length; i++) {
      newDigits[writeIdx] = text[i];
      writeIdx++;
    }
    const nextVal = newDigits.join('');
    onChange(nextVal);
    const focusIdx = Math.min(writeIdx, length - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="otp-container" onPaste={handlePaste} role="group" aria-label="OTP inputs">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          pattern="[0-9]*"
          maxLength={2}
          value={digits[index]}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          className={`otp-box ${digits[index] ? 'filled' : ''}`}
          aria-label={`Digit ${index + 1}`}
          data-testid={`otp-input-${index}`}
        />
      ))}
    </div>
  );
}
