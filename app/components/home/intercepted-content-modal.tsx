"use client";

import { useRouter } from "next/navigation";
import type { Destination, Locale, SiteContent } from "../../../constants/content";
import { localizedHash } from "../../../constants/i18n";
import { ContentModal } from "./content-modal";

const contentModalLabelId = "content-modal-title";

type InterceptedContentModalProps = {
  content: SiteContent;
  item: Destination;
  locale: Locale;
};

export function InterceptedContentModal({
  content,
  item,
  locale,
}: InterceptedContentModalProps) {
  const router = useRouter();

  return (
    <ContentModal
      content={content}
      item={item}
      labelId={contentModalLabelId}
      onClose={() => router.back()}
      onContact={() => router.push(localizedHash(locale, "#contact"))}
    />
  );
}
