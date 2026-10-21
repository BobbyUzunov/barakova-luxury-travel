"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { Locale } from "../../../constants/content";
import { getSiteContent } from "../../../constants/content-by-locale";
import { localizedHash } from "../../../constants/i18n";
import {
  clearChatSession,
  getChatSessionSnapshot,
  writeChatSession,
  type StoredChatMessage,
} from "../../../lib/chat-session-storage";
import {
  clearContactFormDraft,
  createContactFormDraft,
  readContactFormDraft,
  writeContactFormDraft,
} from "../../../lib/contact-form-draft";
import { buildInquiryChatRequestBody } from "../../../lib/inquiry-chat-request";
import { lockPageChrome } from "../../../lib/page-chrome-inert";
import {
  createEmptyTravelProfile,
  type TravelProfile,
} from "../../../lib/travel-profile";
import { buildTravelSummary } from "../../../lib/travel-summary";
import { useModalAccessibility } from "../../../lib/use-modal-accessibility";

type ChatMessage = StoredChatMessage;

type InquiryAgentProps = {
  locale: Locale;
};

type LocalChatDraft = {
  locale: Locale;
  messages: ChatMessage[];
  profile: TravelProfile;
  suggestContact: boolean;
};

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createWelcomeMessage(content: string): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    content,
    source: "faq",
  };
}

function subscribeToChatSession(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = () => onStoreChange();
  window.addEventListener("barakova-chat-session", handler);
  return () => window.removeEventListener("barakova-chat-session", handler);
}

function notifyChatSessionChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("barakova-chat-session"));
}

function getServerChatSessionSnapshot() {
  return null;
}

function persistChatSession(session: {
  locale: Locale;
  messages: ChatMessage[];
  profile: TravelProfile;
}) {
  writeChatSession(session);
  notifyChatSessionChanged();
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
  const messagesRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const stickToBottomRef = useRef(true);
  const pendingOpenScrollRef = useRef<"top" | "bottom" | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [handoffPreviewOpen, setHandoffPreviewOpen] = useState(false);
  const [handoffStorageError, setHandoffStorageError] = useState(false);
  const [handoffCopyDone, setHandoffCopyDone] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const handoffUseButtonRef = useRef<HTMLButtonElement>(null);
  const [draft, setDraft] = useState<LocalChatDraft | null>(null);

  const storedSession = useSyncExternalStore(
    subscribeToChatSession,
    () => getChatSessionSnapshot(locale),
    getServerChatSessionSnapshot,
  );

  if (draft && draft.locale !== locale) {
    setDraft(null);
  }

  const welcomeMessage = createWelcomeMessage(copy.welcome);
  const messages =
    draft && draft.locale === locale
      ? draft.messages
      : (storedSession?.messages ?? [welcomeMessage]);
  const profile =
    draft && draft.locale === locale
      ? draft.profile
      : (storedSession?.profile ?? createEmptyTravelProfile(locale));
  const suggestContact =
    draft && draft.locale === locale ? draft.suggestContact : false;

  const closePanel = useCallback(() => {
    setHandoffPreviewOpen(false);
    setHandoffStorageError(false);
    setHandoffCopyDone(false);
    setIsOpen(false);
  }, [
    setHandoffPreviewOpen,
    setHandoffStorageError,
    setHandoffCopyDone,
    setIsOpen,
  ]);

  useModalAccessibility({
    containerRef: panelRef,
    initialFocusRef: handoffPreviewOpen ? handoffUseButtonRef : closeButtonRef,
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

    if (handoffPreviewOpen) {
      handoffUseButtonRef.current?.focus({ preventScroll: true });
    } else {
      closeButtonRef.current?.focus({ preventScroll: true });
    }
    launcherRef.current?.setAttribute("aria-hidden", "true");
  }, [isOpen, handoffPreviewOpen]);

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

  const isFreshConversation =
    messages.length === 1 && messages[0]?.id === "welcome";
  const messagesSignature = `${messages.length}:${messages.at(-1)?.id ?? ""}:${suggestContact}`;

  const syncJumpVisibilityFromScroll = () => {
    const container = messagesRef.current;
    if (!container) {
      setShowJumpToLatest(false);
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const nearBottom = distanceFromBottom <= 72;
    stickToBottomRef.current = nearBottom;
    setShowJumpToLatest(
      !nearBottom && container.scrollHeight > container.clientHeight + 8,
    );
  };

  const scrollMessagesContainer = (
    position: "top" | "bottom",
    behavior: ScrollBehavior = "auto",
  ) => {
    const container = messagesRef.current;
    if (!container) {
      return;
    }

    const top = position === "top" ? 0 : container.scrollHeight;
    container.scrollTo({ top, behavior });
    stickToBottomRef.current = true;
  };

  const openPanel = () => {
    const sessionMessages =
      draft && draft.locale === locale
        ? draft.messages
        : (getChatSessionSnapshot(locale)?.messages ?? [
            createWelcomeMessage(copy.welcome),
          ]);
    const fresh =
      sessionMessages.length === 1 && sessionMessages[0]?.id === "welcome";
    pendingOpenScrollRef.current = fresh ? "top" : "bottom";
    stickToBottomRef.current = !fresh;
    setShowJumpToLatest(false);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen || !pendingOpenScrollRef.current) {
      return;
    }

    const target = pendingOpenScrollRef.current;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const delayMs = prefersReducedMotion ? 0 : 440;

    const timeoutId = window.setTimeout(() => {
      scrollMessagesContainer(target, "auto");
      pendingOpenScrollRef.current = null;
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || pendingOpenScrollRef.current) {
      return;
    }

    if (isFreshConversation) {
      scrollMessagesContainer("top", "auto");
      return;
    }

    if (!stickToBottomRef.current) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    scrollMessagesContainer("bottom", prefersReducedMotion ? "auto" : "smooth");
  }, [isFreshConversation, isOpen, isSending, messagesSignature]);

  const updateDraft = (next: {
    messages: ChatMessage[];
    profile: TravelProfile;
    suggestContact: boolean;
  }) => {
    setDraft({
      locale,
      messages: next.messages,
      profile: next.profile,
      suggestContact: next.suggestContact,
    });
    persistChatSession({
      locale,
      messages: next.messages,
      profile: next.profile,
    });
  };

  const resetConversation = () => {
    requestIdRef.current += 1;
    setIsSending(false);
    setInputValue("");
    setHandoffPreviewOpen(false);
    setHandoffStorageError(false);
    setHandoffCopyDone(false);
    stickToBottomRef.current = true;
    pendingOpenScrollRef.current = null;
    setShowJumpToLatest(false);
    const nextMessages = [createWelcomeMessage(copy.welcome)];
    const nextProfile = createEmptyTravelProfile(locale);
    clearChatSession();
    notifyChatSessionChanged();
    const pendingDraft = readContactFormDraft(locale);
    if (pendingDraft && !pendingDraft.applied) {
      clearContactFormDraft();
    }
    setDraft({
      locale,
      messages: nextMessages,
      profile: nextProfile,
      suggestContact: false,
    });
    window.requestAnimationFrame(() => {
      scrollMessagesContainer("top", "auto");
    });
  };

  const navigateToContactForm = () => {
    const contactHash = localizedHash(locale, "contact");
    const isHomePage =
      window.location.pathname === `/${locale}` ||
      window.location.pathname === `/${locale}/`;

    closePanel();

    if (isHomePage) {
      window.requestAnimationFrame(() => {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      });
      return;
    }

    window.location.href = contactHash;
  };

  const transferSummaryToForm = async () => {
    const summary = buildTravelSummary(profile);
    if (!summary.hasUsefulData) {
      setHandoffPreviewOpen(false);
      setHandoffStorageError(false);
      navigateToContactForm();
      return;
    }

    const wrote = writeContactFormDraft(
      createContactFormDraft({
        locale,
        summary,
      }),
    );

    if (!wrote) {
      setHandoffStorageError(true);
      setHandoffCopyDone(false);
      return;
    }

    setHandoffStorageError(false);
    setHandoffCopyDone(false);
    setHandoffPreviewOpen(false);
    navigateToContactForm();
  };

  const copyHandoffSummary = async () => {
    const summary = buildTravelSummary(profile);
    if (!summary.hasUsefulData || !navigator.clipboard?.writeText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(summary.text);
      setHandoffCopyDone(true);
    } catch {
      setHandoffCopyDone(false);
    }
  };

  const sendMessage = async ({ message }: { message?: string }) => {
    const trimmedMessage = message?.trim();

    if (!trimmedMessage) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmedMessage,
    };

    const profileSnapshot = profile;
    const requestBody = buildInquiryChatRequestBody({
      locale,
      message: trimmedMessage,
      messages,
      profile: profileSnapshot,
    });
    const nextMessages = [...messages, userMessage];

    updateDraft({
      messages: nextMessages,
      profile: profileSnapshot,
      suggestContact,
    });
    setInputValue("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const payload = (await response.json()) as {
        reply?: string;
        source?: "faq" | "ai" | "fallback";
        suggestContact?: boolean;
        profile?: TravelProfile;
        message?: string;
      };

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!response.ok || !payload.reply) {
        throw new Error(payload.message || "chat-error");
      }

      updateDraft({
        messages: [
          ...nextMessages,
          {
            id: createMessageId(),
            role: "assistant",
            content: payload.reply,
            source: payload.source,
          },
        ],
        profile: payload.profile ?? profileSnapshot,
        suggestContact: payload.suggestContact === true ? true : suggestContact,
      });
    } catch {
      if (requestId !== requestIdRef.current) {
        return;
      }

      updateDraft({
        messages: [
          ...nextMessages,
          {
            id: createMessageId(),
            role: "assistant",
            content: copy.error,
            source: "fallback",
          },
        ],
        profile: profileSnapshot,
        suggestContact,
      });
    } finally {
      if (requestId === requestIdRef.current) {
        setIsSending(false);
      }
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
    const summary = buildTravelSummary(profile);
    if (summary.hasUsefulData) {
      setHandoffStorageError(false);
      setHandoffCopyDone(false);
      setHandoffPreviewOpen(true);
      return;
    }

    navigateToContactForm();
  };

  const handoffSummary = handoffPreviewOpen ? buildTravelSummary(profile) : null;
  const showHandoffPreview =
    handoffPreviewOpen && handoffSummary !== null && handoffSummary.hasUsefulData;

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
          onClick={openPanel}
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
            <div className="inquiry-agent-header-copy">
              <p className="inquiry-agent-eyebrow">
                <span className="inquiry-agent-ai-badge">{copy.launcherShortLabel}</span>
                {content.brand.name}
              </p>
              <h2 className="inquiry-agent-title" id={`${panelId}-title`}>
                {copy.title}
              </h2>
            </div>
            <div className="inquiry-agent-header-actions">
              <button
                className="inquiry-agent-new-chat"
                onClick={resetConversation}
                type="button"
              >
                {copy.newChat}
              </button>
              <button
                aria-label={copy.close}
                className="inquiry-agent-close"
                onClick={closePanel}
                ref={closeButtonRef}
                type="button"
              >
                ×
              </button>
            </div>
          </header>

          {showHandoffPreview && handoffSummary ? (
            <div className="inquiry-agent-handoff">
              <div className="inquiry-agent-handoff-copy">
                <h3 className="inquiry-agent-handoff-title">
                  {copy.handoffPreviewTitle}
                </h3>
                <p className="inquiry-agent-handoff-lead">
                  {copy.handoffPreviewLead}
                </p>
                <pre className="inquiry-agent-handoff-summary">
                  {handoffSummary.text}
                </pre>
              </div>
              {handoffStorageError ? (
                <div className="inquiry-agent-handoff-error" role="alert">
                  <p>{copy.handoffStorageError}</p>
                  <div className="inquiry-agent-actions inquiry-agent-handoff-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        void copyHandoffSummary();
                      }}
                      type="button"
                    >
                      {handoffCopyDone
                        ? copy.handoffCopyDone
                        : copy.handoffCopySummary}
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => {
                        void transferSummaryToForm();
                      }}
                      ref={handoffUseButtonRef}
                      type="button"
                    >
                      {copy.handoffStorageRetry}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="inquiry-agent-actions inquiry-agent-handoff-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setHandoffPreviewOpen(false);
                      setHandoffStorageError(false);
                    }}
                    type="button"
                  >
                    {copy.handoffPreviewBack}
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      void transferSummaryToForm();
                    }}
                    ref={handoffUseButtonRef}
                    type="button"
                  >
                    {copy.handoffPreviewUse}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="inquiry-agent-messages-wrap">
                <div
                  className="inquiry-agent-messages"
                  onScroll={syncJumpVisibilityFromScroll}
                  ref={messagesRef}
                  role="log"
                  aria-live="polite"
                >
                  {messages.map((message) => (
                    <article
                      className={`inquiry-agent-message inquiry-agent-message--${message.role}`}
                      key={message.id}
                    >
                      <p>{message.content}</p>
                      {message.role === "assistant" &&
                      message.source &&
                      message.id !== "welcome" ? (
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
                  {suggestContact ? (
                    <div className="inquiry-agent-contact-suggest">
                      <p>{copy.contactSuggest}</p>
                    </div>
                  ) : null}
                  <div ref={messagesEndRef} />
                </div>
                {showJumpToLatest ? (
                  <button
                    className="inquiry-agent-jump-latest"
                    onClick={() => {
                      const prefersReducedMotion = window.matchMedia(
                        "(prefers-reduced-motion: reduce)",
                      ).matches;
                      scrollMessagesContainer(
                        "bottom",
                        prefersReducedMotion ? "auto" : "smooth",
                      );
                      setShowJumpToLatest(false);
                    }}
                    type="button"
                  >
                    {copy.scrollToLatest}
                  </button>
                ) : null}
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
            </>
          )}

          <p className="inquiry-agent-note">{copy.poweredNote}</p>
          <p className="inquiry-agent-disclaimer">{copy.disclaimer}</p>
        </section>
      </div>
    </>
  );
}
