"use client";

import { useRouter } from "next/navigation";
import type { BlogPost, SiteContent } from "../../../constants/content";
import { BlogModal } from "./blog-modal";

const blogModalLabelId = "blog-modal-title";

type InterceptedBlogModalProps = {
  content: SiteContent;
  post: BlogPost;
};

export function InterceptedBlogModal({ content, post }: InterceptedBlogModalProps) {
  const router = useRouter();

  return (
    <BlogModal
      content={content}
      labelId={blogModalLabelId}
      onClose={() => router.back()}
      post={post}
    />
  );
}
