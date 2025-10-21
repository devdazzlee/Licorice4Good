'use client'
import React, { useState } from 'react';

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errorText?: string;
};

const PasswordInput = ({ label, id, name, value, onChange, errorText, ...rest }: PasswordInputProps) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-black font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-gray-400 bg-white"
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 px-3 text-gray-600 hover:text-black"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {errorText && <span className="text-xs text-red-500">{errorText}</span>}
    </div>
  );
};

export default PasswordInput;


