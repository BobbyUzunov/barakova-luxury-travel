"use client";

import Image from "next/image";
import { useRef } from "react";
import type { BlogPost, SiteContent } from "../../../constants/content";
import { useModalAccessibility } from "../../../lib/use-modal-accessibility";

type BlogModalProps = {
  content: SiteContent;
  labelId: string;
  onClose: () => void;
  post: BlogPost;
};

export function BlogModal({
  content,
  labelId,
  onClose,
  post,
}: BlogModalProps) {
  const modalRef = useRef<HTMLElement>(null);
  useModalAccessibility(true, onClose, modalRef, labelId);

  return (
    <div
      aria-labelledby={labelId}
      aria-modal="true"
      className="destination-modal-backdrop"
      onClick={onClose}
      role="dialog"
    >
      <article
        className="blog-modal"
        onClick={(event) => event.stopPropagation()}
        ref={modalRef}
      >
        <button
          aria-label={content.blog.closeLabel}
          className="destination-modal-close"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        <div className="blog-modal-image">
          <Image
            alt={post.title}
            className="destination-modal-image"
            fill
            sizes="(min-width: 1024px) 56vw, 94vw"
            src={post.image}
          />
        </div>

        <div className="blog-modal-body">
          <div className="blog-modal-meta">
            <span>{post.category}</span>
            <small>
              {post.date} · {post.readTime}
            </small>
          </div>
          <h2 id={labelId}>{post.title}</h2>
          <p className="blog-modal-excerpt">{post.excerpt}</p>
          <div className="blog-modal-copy">
            {post.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
