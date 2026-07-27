'use client';

import React from 'react';
import PhoneInputLib from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface PhoneInputProps {
  value: string;
  onChange: (value: string | undefined) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function PhoneInput({ value, onChange, required, className, placeholder, disabled }: PhoneInputProps) {
  return (
    <div className={`phone-input-wrapper ${className || ''}`}>
      <PhoneInputLib
        international
        defaultCountry="US"
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder || "Enter phone number"}
        disabled={disabled}
        className="w-full flex items-center border border-slate-200 rounded-xl focus-within:border-[#4C1D95] bg-white overflow-hidden px-3 py-2 text-sm"
        style={{ '--PhoneInput-color--focus': 'transparent' } as React.CSSProperties}
      />
      <style dangerouslySetInnerHTML={{__html: `
        .PhoneInputInput {
          border: none;
          outline: none;
          background: transparent;
          flex: 1;
          margin-left: 8px;
        }
        .PhoneInputCountry {
          margin-right: 8px;
        }
      `}} />
    </div>
  );
}
