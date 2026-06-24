"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileWidgetProps = {
  onTokenChange: (token: string) => void;
  onExpire?: () => void;
};

export function TurnstileWidget({ onTokenChange, onExpire }: TurnstileWidgetProps) {
  const turnstileRef = useRef<TurnstileInstance>(null);

  if (!siteKey) {
    return null;
  }

  return (
    <div className="turnstile-widget">
      <Turnstile
        ref={turnstileRef}
        siteKey={siteKey}
        onSuccess={onTokenChange}
        onExpire={() => {
          onTokenChange("");
          onExpire?.();
          turnstileRef.current?.reset();
        }}
        onError={() => {
          onTokenChange("");
        }}
        options={{
          theme: "light",
          language: "auto",
        }}
      />
    </div>
  );
}

export function isTurnstileConfigured() {
  return Boolean(siteKey);
}
