"use client";

import { createContext, useContext, useState, useRef } from "react";

interface CaptchaContextType {
  captchaToken: string | undefined;
  setCaptchaToken: (token: string | undefined) => void;
  resetCaptcha: () => void;
  turnstileRef: React.MutableRefObject<any>;
}

const CaptchaContext = createContext<CaptchaContextType | undefined>(undefined);

export function CaptchaProvider({ children }: { children: React.ReactNode }) {
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const turnstileRef = useRef<any>(null);

  const resetCaptcha = () => {
    setCaptchaToken(undefined);
    turnstileRef.current?.reset();
  };

  return (
    <CaptchaContext.Provider
      value={{ captchaToken, setCaptchaToken, resetCaptcha, turnstileRef }}
    >
      {children}
    </CaptchaContext.Provider>
  );
}

export function useCaptcha() {
  const context = useContext(CaptchaContext);
  if (!context) {
    throw new Error("useCaptcha must be used within CaptchaProvider");
  }
  return context;
}
