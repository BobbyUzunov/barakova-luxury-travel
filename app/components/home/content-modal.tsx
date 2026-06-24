"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Destination, SiteContent } from "../../../constants/content";
import { useModalAccessibility } from "../../../lib/use-modal-accessibility";

type ContentModalProps = {
  content: SiteContent;
  item: Destination;
  labelId: string;
  onClose: () => void;
  onContact: () => void;
};

export function ContentModal({
  content,
  item,
  labelId,
  onClose,
  onContact,
}: ContentModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalAccessibility(true, onClose, modalRef, labelId);

  return (
    <div
      aria-labelledby={labelId}
      aria-modal="true"
      className="destination-modal-backdrop"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="destination-modal"
        onClick={(event) => event.stopPropagation()}
        ref={modalRef}
      >
        <button
          aria-label={content.destinationModal.closeLabel}
          className="destination-modal-close"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        <div className="destination-modal-hero">
          <Image
            alt={item.name}
            className="destination-modal-image"
            fill
            sizes="(min-width: 1024px) 58vw, 94vw"
            src={item.image}
          />
          <div className="destination-modal-overlay" />
          <div className="destination-modal-title">
            <span>{content.destinationModal.eyebrow}</span>
            <h2 id={labelId}>{item.name}</h2>
            <p>{item.description}</p>
          </div>
        </div>

        <div className="destination-modal-body">
          <div className="destination-modal-copy">
            <p>{item.detail}</p>
            <div className="destination-modal-highlights">
              <h3>{content.destinationModal.highlightsTitle}</h3>
              <ul>
                {item.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
            <button
              className="btn-primary destination-modal-cta"
              onClick={onContact}
              type="button"
            >
              {content.destinationModal.cta}
            </button>
          </div>

          <div className="destination-modal-gallery">
            <h3>{content.destinationModal.galleryTitle}</h3>
            <div>
              {item.gallery.map((image, index) => (
                <div className="destination-gallery-item" key={image}>
                  <Image
                    alt={`${item.name} ${index + 1}`}
                    className="destination-modal-image"
                    fill
                    sizes="(min-width: 1024px) 16vw, (min-width: 640px) 28vw, 44vw"
                    src={image}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
