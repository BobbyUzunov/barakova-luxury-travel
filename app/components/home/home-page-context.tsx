"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale, SiteContent } from "../../../constants/content";
import { localePath } from "../../../constants/i18n";
import { MobileFloatingContact } from "./mobile-floating-contact";
import { SiteHeader } from "./site-header";

type HomePageContextValue = {
  locale: Locale;
  scrollToContact: () => void;
  scrollToDestinations: () => void;
};

const HomePageContext = createContext<HomePageContextValue | null>(null);

export function useHomePage() {
  const context = useContext(HomePageContext);

  if (!context) {
    throw new Error("useHomePage must be used within HomePageShell");
  }

  return context;
}

type HomePageShellProps = {
  children: React.ReactNode;
  content: SiteContent;
  locale: Locale;
};

export function HomePageShell({
  children,
  content,
  locale,
}: HomePageShellProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuLabel = locale === "bg" ? "Меню" : "Menu";
  const closeMenuLabel =
    locale === "bg" ? "Затвори менюто" : "Close menu";

  const scrollToContact = useCallback(() => {
    setIsMenuOpen(false);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToDestinations = useCallback(() => {
    setIsMenuOpen(false);
    document
      .getElementById("destinations")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleLocaleChange = (nextLocale: Locale) => {
    setIsMenuOpen(false);
    router.push(localePath(nextLocale));
  };

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  const contextValue = useMemo(
    () => ({
      locale,
      scrollToContact,
      scrollToDestinations,
    }),
    [locale, scrollToContact, scrollToDestinations],
  );

  return (
    <HomePageContext.Provider value={contextValue}>
      <main className="min-h-screen overflow-x-clip bg-[var(--ivory)] text-[var(--charcoal)]">
        <SiteHeader
          closeMenuLabel={closeMenuLabel}
          content={content}
          isMenuOpen={isMenuOpen}
          locale={locale}
          menuLabel={menuLabel}
          onLocaleChange={handleLocaleChange}
          onMenuToggle={() => setIsMenuOpen((current) => !current)}
          onNavigate={() => setIsMenuOpen(false)}
          scrollToContact={scrollToContact}
        />
        {children}
        <MobileFloatingContact content={content} locale={locale} />
      </main>
    </HomePageContext.Provider>
  );
}
