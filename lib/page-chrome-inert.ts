import { lockElementInert } from "./element-inert-lock";

/** Locks main page chrome while a modal/dialog is open. */
export function lockPageChrome() {
  const appContent = document.getElementById("app-content");
  const inquiryAgentShell = document.getElementById("inquiry-agent-shell");
  const unlockAppContent = appContent ? lockElementInert(appContent) : () => {};
  const unlockInquiryAgent = inquiryAgentShell
    ? lockElementInert(inquiryAgentShell)
    : () => {};

  return () => {
    unlockInquiryAgent();
    unlockAppContent();
  };
}
