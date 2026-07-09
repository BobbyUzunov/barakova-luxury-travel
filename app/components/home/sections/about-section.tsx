import Image from "next/image";
import type { SiteContent } from "../../../../constants/content";
import {
  profileMainImage,
  profileSecondaryImage,
} from "../../../../constants/images";

type AboutSectionProps = {
  content: SiteContent;
};

export function AboutSection({ content }: AboutSectionProps) {
  return (
    <section className="section-shell" id="about">
      <div className="about-panel profile-panel grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <div className="profile-gallery">
          <div className="profile-photo profile-photo-main">
            <Image
              src={profileMainImage}
              alt={content.imageAlts.profileMain}
              fill
              sizes="(min-width: 1024px) 42vw, (min-width: 640px) 82vw, 92vw"
              className="profile-image"
            />
          </div>
          <div className="profile-photo profile-photo-secondary">
            <Image
              src={profileSecondaryImage}
              alt={content.imageAlts.profileSecondary}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 82vw, 0vw"
              className="profile-image"
            />
          </div>
        </div>
        <div className="profile-content">
          <p className="eyebrow">{content.about.eyebrow}</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            {content.about.title}
          </h2>
          <p className="about-intro mt-5">{content.about.intro}</p>
          <div className="about-copy mt-5 space-y-4 text-base leading-7 text-[rgba(45,42,38,0.72)] sm:text-lg sm:leading-8">
            {content.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mission-card mt-7">
            <p>{content.about.mission}</p>
          </div>
          <div className="profile-stats mt-7">
            {content.profileStats.map((stat) => (
              <div className="profile-stat" key={stat}>
                <span />
                <p>{stat}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {content.about.tags.map((tag) => (
              <span className="about-pill" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
