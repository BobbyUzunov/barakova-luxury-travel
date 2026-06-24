"use client";

import Link from "next/link";
import type { Locale, SiteContent } from "../../../constants/content";
import { languageOptions } from "../../../constants/content";
import { localePath } from "../../../constants/i18n";

type SiteHeaderProps = {
  closeMenuLabel: string;
  content: SiteContent;
  isMenuOpen: boolean;
  locale: Locale;
  menuLabel: string;
  onLocaleChange: (locale: Locale) => void;
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
  onMenuToggle,
  onNavigate,
  scrollToContact,
}: SiteHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4 lg:px-10">
      <nav className="site-header mx-auto max-w-7xl">
        <Link className="brand-lockup" href={localePath(locale)}>
          <span>{content.brand.name}</span>
          <small>{content.brand.subtitle}</small>
        </Link>

        <div
          className="header-nav"
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
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? closeMenuLabel : menuLabel}
            className="menu-toggle"
            onClick={onMenuToggle}
            type="button"
          >
            <span />
            <span />
          </button>
        </div>

        <div
          className={`mobile-menu ${isMenuOpen ? "is-open" : ""}`}
          id="mobile-menu"
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
