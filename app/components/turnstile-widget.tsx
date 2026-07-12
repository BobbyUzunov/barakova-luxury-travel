"use client";

import {
  Turnstile,
  type TurnstileInstance,
} from "@marsidev/react-turnstile";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { isTurnstileSiteKeyConfigured } from "../../lib/turnstile-config";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export type TurnstileWidgetHandle = {
  reset: () => void;
};

type TurnstileWidgetProps = {
  onExpire?: () => void;
  onTokenChange: (token: string) => void;
};

export const TurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  TurnstileWidgetProps
>(function TurnstileWidget({ onExpire, onTokenChange }, ref) {
  const turnstileRef = useRef<TurnstileInstance>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      onTokenChange("");
      turnstileRef.current?.reset();
    },
  }));

  if (!siteKey) {
    return null;
  }

  const handleReset = () => {
    onTokenChange("");
    turnstileRef.current?.reset();
  };

  return (
    <div className="turnstile-widget">
      <Turnstile
        ref={turnstileRef}
        siteKey={siteKey}
        onError={handleReset}
        onExpire={() => {
          onExpire?.();
          handleReset();
        }}
        onSuccess={onTokenChange}
        options={{
          language: "auto",
          theme: "light",
        }}
      />
    </div>
  );
});

export function isTurnstileConfigured() {
  return isTurnstileSiteKeyConfigured();
}
