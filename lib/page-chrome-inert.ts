import { lockElementInert } from "./element-inert-lock";

type LockPageChromeOptions = {
  /** When false, leave the AI launcher/panel interactive (default: true). */
  includeInquiryAgent?: boolean;
};

/** Locks main page chrome while a modal/dialog is open. */
export function lockPageChrome(options: LockPageChromeOptions = {}) {
  const includeInquiryAgent = options.includeInquiryAgent ?? true;
  const appContent = document.getElementById("app-content");
  const inquiryAgentShell = includeInquiryAgent
    ? document.getElementById("inquiry-agent-shell")
    : null;
  const unlockAppContent = appContent ? lockElementInert(appContent) : () => {};
  const unlockInquiryAgent = inquiryAgentShell
    ? lockElementInert(inquiryAgentShell)
    : () => {};

  return () => {
    unlockInquiryAgent();
    unlockAppContent();
  };
}
