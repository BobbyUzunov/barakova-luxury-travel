"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Locale, SiteContent } from "../../../constants/content";
import { languageOptions } from "../../../constants/content";
import { localePath } from "../../../constants/i18n";
import { lockBodyScroll } from "../../../lib/body-scroll-lock";
import { getFocusableElements } from "../../../lib/focus-trap";
import { getMobileMenuInertAttribute } from "../../../lib/mobile-menu-a11y";
import { useModalAccessibility } from "../../../lib/use-modal-accessibility";

type SiteHeaderProps = {
  closeMenuLabel: string;
  content: SiteContent;
  isMenuOpen: boolean;
  locale: Locale;
  menuLabel: string;
  onLocaleChange: (locale: Locale) => void;
  onMenuClose: () => void;
  onMenuToggle: () => void;
  onNavigate: () => void;
  scrollToContact: () => void;
};

export function SiteHeader({
  closeMenuLabel,
  content,
  isMenuOpen,
  locale,
  menuLabel,
  onLocaleChange,
  onMenuClose,
  onMenuToggle,
  onNavigate,
  scrollToContact,
}: SiteHeaderProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  useModalAccessibility({
    containerRef: menuRef,
    isOpen: isMenuOpen,
    lockScroll: false,
    onClose: onMenuClose,
    restoreFocusRef: menuToggleRef,
  });

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    return lockBodyScroll();
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen || !menuRef.current) {
      return;
    }

    window.requestAnimationFrame(() => {
      getFocusableElements(menuRef.current!)[0]?.focus();
    });
  }, [isMenuOpen]);

  return (
    <header className="site-header-shell fixed inset-x-0 top-0 z-50 px-3 sm:px-6 lg:px-10">
      <nav className="site-header mx-auto max-w-7xl">
        <Link className="brand-lockup" href={localePath(locale)}>
          <span className="brand-name">
            <span className="brand-name-full">{content.brand.name}</span>
            <span className="brand-name-short">{content.brand.shortName}</span>
          </span>
          <small>{content.brand.subtitle}</small>
        </Link>

        <div
          className="header-nav"
          role="navigation"
          aria-label={
            locale === "bg" ? "Основна навигация" : "Primary navigation"
          }
        >
          {content.navItems.map((item) => (
            <a href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
        </div>

        <div className="header-actions">
          <div
            className="language-switcher"
            aria-label={locale === "bg" ? "Избор на език" : "Language"}
          >
            {languageOptions.map((option, index) => (
              <span className="language-option" key={option.locale}>
                {index > 0 && <span className="language-divider">|</span>}
                <button
                  aria-pressed={locale === option.locale}
                  className={locale === option.locale ? "is-active" : ""}
                  onClick={() => onLocaleChange(option.locale)}
                  type="button"
                >
                  <span aria-hidden="true" className="language-flag">
                    {option.flag}
                  </span>
                  {option.label}
                </button>
              </span>
            ))}
          </div>

          <button
            className="btn-primary header-cta"
            onClick={scrollToContact}
            type="button"
          >
            {content.headerCta}
          </button>

          <button
            aria-controls="mobile-menu"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? closeMenuLabel : menuLabel}
            className="menu-toggle"
            onClick={onMenuToggle}
            ref={menuToggleRef}
            type="button"
          >
            <span />
            <span />
          </button>
        </div>

        <div
          className={`mobile-menu ${isMenuOpen ? "is-open" : ""}`}
          id="mobile-menu"
          inert={getMobileMenuInertAttribute(isMenuOpen)}
          ref={menuRef}
        >
          {content.navItems.map((item) => (
            <a href={item.href} key={item.label} onClick={onNavigate}>
              {item.label}
            </a>
          ))}
          <button
            className="btn-primary mobile-menu-cta"
            onClick={scrollToContact}
            type="button"
          >
            {content.headerCta}
          </button>
        </div>
      </nav>
    </header>
  );
}
