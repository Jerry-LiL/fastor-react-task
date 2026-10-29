import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import OtpInput from './OtpInput';

function ControlledOtpWrapper({ length = 6, initialValue = '', onChange = () => {} }) {
  const [val, setVal] = useState(initialValue);
  return (
    <OtpInput
      length={length}
      value={val}
      onChange={(next) => {
        setVal(next);
        onChange(next);
      }}
    />
  );
}

describe('OtpInput Component', () => {
  it('renders 6 input boxes by default', () => {
    render(<ControlledOtpWrapper />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('auto-advances focus as digits are entered', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<ControlledOtpWrapper onChange={handleChange} />);

    const inputs = screen.getAllByRole('textbox');

    await user.type(inputs[0], '1');
    expect(inputs[1]).toHaveFocus();

    await user.type(inputs[1], '2');
    expect(inputs[2]).toHaveFocus();

    expect(handleChange).toHaveBeenCalledWith('1');
    expect(handleChange).toHaveBeenCalledWith('12');
  });

  it('handles backspace moving focus back to previous input', async () => {
    const user = userEvent.setup();
    render(<ControlledOtpWrapper initialValue="12" />);

    const inputs = screen.getAllByRole('textbox');

    // Focus on index 2 (empty) and press backspace
    inputs[2].focus();
    await user.keyboard('{Backspace}');

    // Expect focus to move to input 1 and clear its value
    expect(inputs[1]).toHaveFocus();
    expect(inputs[1]).toHaveValue('');
  });

  it('supports pasting a 6-digit code', () => {
    const handleChange = vi.fn();
    render(<ControlledOtpWrapper onChange={handleChange} />);

    const inputs = screen.getAllByRole('textbox');
    const pasteEvent = {
      clipboardData: {
        getData: () => '123456',
      },
    };

    fireEvent.paste(inputs[0], pasteEvent);

    expect(handleChange).toHaveBeenCalledWith('123456');
    inputs.forEach((input, idx) => {
      expect(input).toHaveValue(String(idx + 1));
    });
  });

  it('filters out non-digit characters during paste', () => {
    const handleChange = vi.fn();
    render(<ControlledOtpWrapper onChange={handleChange} />);

    const inputs = screen.getAllByRole('textbox');
    const pasteEvent = {
      clipboardData: {
        getData: () => '12-34-56',
      },
    };

    fireEvent.paste(inputs[0], pasteEvent);

    expect(handleChange).toHaveBeenCalledWith('123456');
  });
});
