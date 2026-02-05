"use client";

import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { Input } from "@/components/ui/input";

interface TOTPInputProps {
  onComplete: (code: string) => void;
  disabled?: boolean;
}

export function TOTPInput({ onComplete, disabled }: TOTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(6).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newValues = [...values];
    newValues[index] = value.slice(-1);
    setValues(newValues);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    const code = newValues.join("");
    if (code.length === 6) {
      onComplete(code);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newValues = [...values];
    paste.split("").forEach((char, i) => {
      newValues[i] = char;
    });
    setValues(newValues);
    if (paste.length === 6) {
      onComplete(paste);
    } else {
      inputs.current[paste.length]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {values.map((value, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          disabled={disabled}
          className="w-12 h-14 text-center text-2xl font-mono"
        />
      ))}
    </div>
  );
}
