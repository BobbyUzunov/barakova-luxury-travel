"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { Locale } from "../../../constants/content";
import { getSiteContent } from "../../../constants/content-by-locale";
import { localizedHash } from "../../../constants/i18n";
import type { ChatHistoryMessage } from "../../../lib/chat";
import { lockPageChrome } from "../../../lib/page-chrome-inert";
import { useModalAccessibility } from "../../../lib/use-modal-accessibility";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: "faq" | "ai" | "fallback";
};

type InquiryAgentProps = {
  locale: Locale;
};

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function InquiryAgent({ locale }: InquiryAgentProps) {
  const content = getSiteContent(locale);
  const copy = content.inquiryAgent;
  const panelId = useId();
  const inputId = useId();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: copy.welcome,
      source: "faq",
    },
  ]);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  useModalAccessibility({
    containerRef: panelRef,
    initialFocusRef: closeButtonRef,
    isOpen,
    lockScroll: true,
    onClose: closePanel,
    restoreFocusRef: launcherRef,
    restoreFocusStrategy: "deferred",
  });

  useLayoutEffect(() => {
    if (!isOpen) {
      launcherRef.current?.setAttribute("aria-hidden", "false");
      return;
    }

    closeButtonRef.current?.focus({ preventScroll: true });
    launcherRef.current?.setAttribute("aria-hidden", "true");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Only inert the page behind the chat — never the AI shell itself,
    // or taps on the textarea fall through to the backdrop and close it.
    return lockPageChrome({ includeInquiryAgent: false });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const visualViewport = window.visualViewport;
    const panel = panelRef.current;

    if (!visualViewport) {
      return;
    }

    const syncKeyboardOffset = () => {
      const offset = Math.max(
        0,
        window.innerHeight - visualViewport.height - visualViewport.offsetTop,
      );
      panel?.style.setProperty("--inquiry-keyboard-offset", `${offset}px`);
    };

    syncKeyboardOffset();
    visualViewport.addEventListener("resize", syncKeyboardOffset);
    visualViewport.addEventListener("scroll", syncKeyboardOffset);

    return () => {
      visualViewport.removeEventListener("resize", syncKeyboardOffset);
      visualViewport.removeEventListener("scroll", syncKeyboardOffset);
      panel?.style.removeProperty("--inquiry-keyboard-offset");
    };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  const sendMessage = async ({ message }: { message?: string }) => {
    const trimmedMessage = message?.trim();

    if (!trimmedMessage) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmedMessage,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputValue("");
    setIsSending(true);

    const history: ChatHistoryMessage[] = messages
      .filter((entry) => entry.id !== "welcome")
      .map((entry) => ({
        role: entry.role,
        content: entry.content,
      }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
          locale,
          history,
        }),
      });

      const payload = (await response.json()) as {
        reply?: string;
        source?: "faq" | "ai" | "fallback";
        message?: string;
      };

      if (!response.ok || !payload.reply) {
        throw new Error(payload.message || "chat-error");
      }

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content: payload.reply ?? "",
          source: payload.source,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content: copy.error,
          source: "fallback",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSending) {
      return;
    }

    await sendMessage({ message: inputValue });
  };

  const handleContactClick = () => {
    closePanel();
    const contactHash = localizedHash(locale, "contact");
    const isHomePage =
      window.location.pathname === `/${locale}` ||
      window.location.pathname === `/${locale}/`;

    if (isHomePage) {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    window.location.href = contactHash;
  };

  return (
    <>
      {isOpen ? (
        <button
          aria-label={copy.close}
          className="inquiry-agent-backdrop"
          onClick={closePanel}
          type="button"
        />
      ) : null}

      <div
        className={`inquiry-agent-shell${isOpen ? " is-open" : ""}`}
        id="inquiry-agent-shell"
      >
        <button
          aria-controls={panelId}
          aria-expanded={isOpen}
          aria-label={`${copy.launcherLabel}. ${copy.launcherByline}`}
          className={`inquiry-agent-launcher${isOpen ? " is-chat-open" : ""}`}
          onClick={() => setIsOpen(true)}
          ref={launcherRef}
          type="button"
        >
          <span aria-hidden="true" className="inquiry-agent-launcher-icon">
            <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2.5l1.15 4.2 4.2 1.15-4.2 1.15L12 13.2l-1.15-4.2-4.2-1.15 4.2-1.15L12 2.5Z"
                fill="currentColor"
              />
              <path
                d="M18.5 12.5l.75 2.75 2.75.75-2.75.75-.75 2.75-.75-2.75-2.75-.75 2.75-.75.75-2.75-2.75-.75 2.75-.75.75-2.75Z"
                fill="currentColor"
                opacity="0.9"
              />
              <path
                d="M6.25 14.25l.55 2 2 .55-2 .55-.55 2-.55-2-2-.55 2-.55.55-2 2-.55-.55-2Z"
                fill="currentColor"
                opacity="0.75"
              />
            </svg>
          </span>
          <span className="inquiry-agent-launcher-copy">
            <span className="inquiry-agent-launcher-title">{copy.launcherLabel}</span>
            <span className="inquiry-agent-launcher-byline inquiry-agent-launcher-byline--full">
              {copy.launcherByline}
            </span>
            <span className="inquiry-agent-launcher-byline inquiry-agent-launcher-byline--short">
              {copy.launcherBylineShort}
            </span>
          </span>
        </button>

        <section
          aria-labelledby={`${panelId}-title`}
          aria-modal={isOpen ? "true" : undefined}
          className={`inquiry-agent-panel${isOpen ? " is-open" : ""}`}
          id={panelId}
          inert={!isOpen ? true : undefined}
          ref={panelRef}
          role={isOpen ? "dialog" : undefined}
        >
          <header className="inquiry-agent-header">
            <div>
              <p className="inquiry-agent-eyebrow">
                <span className="inquiry-agent-ai-badge">{copy.launcherShortLabel}</span>
                {content.brand.name}
              </p>
              <h2 className="inquiry-agent-title" id={`${panelId}-title`}>
                {copy.title}
              </h2>
              <p className="inquiry-agent-subtitle">{copy.subtitle}</p>
            </div>
            <button
              aria-label={copy.close}
              className="inquiry-agent-close"
              onClick={closePanel}
              ref={closeButtonRef}
              type="button"
            >
              ×
            </button>
          </header>

          <div className="inquiry-agent-messages" role="log" aria-live="polite">
            {messages.map((message) => (
              <article
                className={`inquiry-agent-message inquiry-agent-message--${message.role}`}
                key={message.id}
              >
                <p>{message.content}</p>
                {message.role === "assistant" && message.source ? (
                  <span className="inquiry-agent-source">
                    {message.source === "faq"
                      ? copy.sourceLabels.faq
                      : copy.sourceLabels.ai}
                  </span>
                ) : null}
              </article>
            ))}
            {isSending ? (
              <article className="inquiry-agent-message inquiry-agent-message--assistant inquiry-agent-message--typing">
                <p>{copy.sending}</p>
              </article>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <form className="inquiry-agent-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor={inputId}>
              {copy.placeholder}
            </label>
            <textarea
              className="inquiry-agent-input"
              disabled={isSending}
              id={inputId}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder={copy.placeholder}
              ref={inputRef}
              rows={2}
              value={inputValue}
            />
            <div className="inquiry-agent-actions">
              <button
                className="btn-secondary inquiry-agent-contact"
                onClick={handleContactClick}
                type="button"
              >
                {copy.contactCta}
              </button>
              <button
                className="btn-primary inquiry-agent-send"
                disabled={isSending || !inputValue.trim()}
                type="submit"
              >
                {isSending ? copy.sending : copy.send}
              </button>
            </div>
          </form>

          <p className="inquiry-agent-note">{copy.poweredNote}</p>
          <p className="inquiry-agent-disclaimer">{copy.disclaimer}</p>
        </section>
      </div>
    </>
  );
}
