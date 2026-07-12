import { chromium } from "playwright";

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:3010";

async function clearConsent(page) {
  await page.evaluate(() => {
    window.localStorage.removeItem("barakova-cookie-consent");
    window.localStorage.removeItem("barakova-luxury-travel-locale");
  });
}

async function acceptConsentIfVisible(page) {
  const acceptButton = page.locator(".cookie-consent-accept");
  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click();
    await acceptButton.waitFor({ state: "hidden" });
  }
}

async function openMobileMenu(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".menu-toggle").click();
  await page.locator("#mobile-menu.is-open").waitFor();
}

async function waitForInert(page, selector, expected, attempts = 50) {
  for (let index = 0; index < attempts; index += 1) {
    const inert = await page.locator(selector).evaluate((element) => element.inert);

    if (inert === expected) {
      return;
    }

    await page.waitForTimeout(50);
  }

  throw new Error(`Expected inert=${expected} on ${selector}`);
}

async function waitForFocusWithin(page, containerSelector, attempts = 50) {
  for (let index = 0; index < attempts; index += 1) {
    const focusedInside = await page
      .locator(containerSelector)
      .evaluate((container) => container.contains(document.activeElement));

    if (focusedInside) {
      return;
    }

    await page.waitForTimeout(50);
  }

  throw new Error(`Expected focus within ${containerSelector}`);
}

async function waitForFocusedSelector(page, selector, attempts = 80) {
  for (let index = 0; index < attempts; index += 1) {
    const focused = await page
      .locator(selector)
      .evaluate((element) => element === document.activeElement);

    if (focused) {
      return;
    }

    await page.waitForTimeout(50);
  }

  const activeElement = await page.locator(":root").evaluate(() => ({
    tag: document.activeElement?.tagName ?? "",
    id: document.activeElement?.id ?? "",
    className: document.activeElement?.className ?? "",
    ariaLabel: document.activeElement?.getAttribute("aria-label") ?? "",
  }));

  throw new Error(
    `Expected focus on ${selector}; active element: ${JSON.stringify(activeElement)}`,
  );
}

async function runChecks() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`${baseUrl}/bg`, { waitUntil: "networkidle" });
    await clearConsent(page);
    await page.reload({ waitUntil: "networkidle" });

    const bgLang = await page.locator("html").getAttribute("lang");
    if (bgLang !== "bg") {
      throw new Error(`Expected /bg html lang=bg, received ${bgLang}`);
    }

    await page.goto(`${baseUrl}/en`, { waitUntil: "networkidle" });
    const enLang = await page.locator("html").getAttribute("lang");
    if (enLang !== "en") {
      throw new Error(`Expected /en html lang=en, received ${enLang}`);
    }

    await clearConsent(page);
    await page.goto(`${baseUrl}/bg`, { waitUntil: "networkidle" });

    const cookieDialog = page.locator(".cookie-consent[role='dialog']");
    await cookieDialog.waitFor({ state: "visible" });
    await waitForFocusWithin(page, ".cookie-consent[role='dialog']");
    await page.keyboard.press("Tab");
    await waitForFocusWithin(page, ".cookie-consent[role='dialog']");
    await page.keyboard.press("Shift+Tab");
    await waitForFocusWithin(page, ".cookie-consent[role='dialog']");

    await acceptConsentIfVisible(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const activeOnLoad = await page.locator(":root").evaluate(() => ({
      tag: document.activeElement?.tagName ?? "",
      className: document.activeElement?.className ?? "",
    }));

    if (activeOnLoad.className.includes("menu-toggle")) {
      throw new Error("Menu button must not receive focus on initial page load");
    }

    if (activeOnLoad.tag !== "BODY") {
      throw new Error(
        `Expected body focus on load with saved consent, received ${JSON.stringify(activeOnLoad)}`,
      );
    }

    await openMobileMenu(page);
    await waitForFocusWithin(page, "#mobile-menu.is-open");
    await page.keyboard.press("Tab");
    await waitForFocusWithin(page, "#mobile-menu.is-open");
    await page.keyboard.press("Shift+Tab");
    await waitForFocusWithin(page, "#mobile-menu.is-open");
    await page.keyboard.press("Escape");
    await page.locator("#mobile-menu.is-open").waitFor({ state: "hidden" });
    await waitForFocusedSelector(page, ".menu-toggle");

    await page.locator(".inquiry-agent-launcher").click();
    await page.locator(".inquiry-agent-panel.is-open").waitFor();
    await waitForFocusedSelector(page, ".inquiry-agent-close");

    await page.keyboard.press("Escape");
    await page.locator(".inquiry-agent-panel.is-open").waitFor({ state: "hidden" });
    await waitForFocusedSelector(page, ".inquiry-agent-launcher");

    await page.locator(".inquiry-agent-launcher").click();
    await page.locator(".inquiry-agent-panel.is-open").waitFor();
    await page.locator(".inquiry-agent-close").click();
    await page.locator(".inquiry-agent-panel.is-open").waitFor({ state: "hidden" });
    await waitForFocusedSelector(page, ".inquiry-agent-launcher");

    await page.locator(".inquiry-agent-launcher").click();
    await page.locator(".inquiry-agent-panel.is-open").waitFor();
    await page.locator(".inquiry-agent-backdrop").click({ position: { x: 8, y: 8 } });
    await page.locator(".inquiry-agent-panel.is-open").waitFor({ state: "hidden" });
    await waitForFocusedSelector(page, ".inquiry-agent-launcher");

    await page.evaluate(() => {
      window.localStorage.removeItem("barakova-cookie-consent");
      window.localStorage.removeItem("barakova-luxury-travel-locale");
    });
    await page.goto(`${baseUrl}/en`, { waitUntil: "networkidle" });
    await cookieDialog.waitFor({ state: "visible" });
    await waitForInert(page, "#app-content", true);
    await waitForInert(page, "#inquiry-agent-shell", true);
    await page.locator(".inquiry-agent-launcher").click({ timeout: 1000 }).catch(() => {});
    const appContentInert = await page.locator("#app-content").evaluate((element) => ({
      appContentInert: element.inert,
    }));
    const inquiryShellInert = await page
      .locator("#inquiry-agent-shell")
      .evaluate((element) => element.inert);

    if (!appContentInert.appContentInert || !inquiryShellInert) {
      throw new Error(
        `Expected inert locks while cookie dialog is open: ${JSON.stringify({
          appContentInert: appContentInert.appContentInert,
          inquiryShellInert,
        })}`,
      );
    }

    await waitForInert(page, "#app-content", true);

    const panelOpen = await page.locator(".inquiry-agent-panel.is-open").isVisible();
    if (panelOpen) {
      throw new Error("AI panel opened while cookie consent is active");
    }

    await acceptConsentIfVisible(page);
    await page.locator(".inquiry-agent-launcher").click();
    await page.locator(".inquiry-agent-panel.is-open").waitFor();
    await waitForInert(page, "#app-content", true);

    await page.keyboard.press("Escape");
    await page.locator(".inquiry-agent-panel.is-open").waitFor({ state: "hidden" });

    console.log("Browser keyboard QA passed.");
  } finally {
    await browser.close();
  }
}

runChecks().catch((error) => {
  console.error(error);
  process.exit(1);
});
