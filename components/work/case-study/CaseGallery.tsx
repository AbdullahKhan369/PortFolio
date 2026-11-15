// Screens and video for one project. Desktop shots sit in laptop frames, phone shots in phone frames.
import Image from "next/image";
import { mediaUrl } from "@/lib/media";
import { pick } from "@/lib/i18n";
import type { Lang, ProjectMedia } from "@/lib/content/types";
import { LaptopFrame, PhoneFrame } from "../DeviceFrame";
import styles from "../work.module.css";
import { accentVar, cssVars, cx, fill } from "../utils";
import type { Messages, ProjectView } from "../types";

export default function CaseGallery({ project, lang, m }: { project: ProjectView; lang: Lang; m: Messages }) {
  const media = [...(project.media ?? [])]
    .sort((a, b) => a.order_index - b.order_index)
    .filter((x) => !!mediaUrl(x.url));
  const by = (kind: ProjectMedia["kind"]) => media.filter((x) => x.kind === kind);
  const desktop = by("desktop");
  const mobile = by("mobile");
  const video = by("video");
  const other = by("other");

  const caption = (x: ProjectMedia) => pick(x, "caption", lang);

  return (
    <section aria-labelledby="case-gallery-title" style={cssVars({ "--accent": accentVar(project.accent) })}>
      <h2 id="case-gallery-title" className={cx(styles.caseSectionTitle, "font-display")}>
        {m.case_gallery}
      </h2>

      {media.length === 0 ? (
        <p className="font-body text-muted">{m.case_gallery_empty}</p>
      ) : (
        <div className={styles.gallery}>
          {desktop.length > 0 && (
            <div className={styles.galleryDesktop}>
              {desktop.map((x) => (
                <figure className={styles.figure} key={x.id}>
                  <LaptopFrame
                    src={mediaUrl(x.url)}
                    alt={caption(x) || fill(m.laptop_alt, { title: project.title })}
                    pendingLabel={m.screenshot_pending}
                    sizes="(min-width: 1280px) 1100px, 92vw"
                  />
                  {caption(x) && <figcaption>{caption(x)}</figcaption>}
                </figure>
              ))}
            </div>
          )}

          {mobile.length > 0 && (
            <div className={styles.galleryPhones}>
              {mobile.map((x) => (
                <figure className={styles.figure} key={x.id}>
                  <PhoneFrame
                    src={mediaUrl(x.url)}
                    alt={caption(x) || fill(m.phone_alt, { title: project.title })}
                    pendingLabel={m.screenshot_pending}
                    sizes="(min-width: 768px) 220px, 46vw"
                  />
                  {caption(x) && <figcaption>{caption(x)}</figcaption>}
                </figure>
              ))}
            </div>
          )}

          {video.map((x) => (
            <figure className={styles.figure} key={x.id}>
              <div className={styles.videoWrap}>
                <video src={mediaUrl(x.url) ?? undefined} controls playsInline preload="metadata" aria-label={caption(x) || `${m.media_video}: ${project.title}`} />
              </div>
              {caption(x) && <figcaption>{caption(x)}</figcaption>}
            </figure>
          ))}

          {other.map((x) => (
            <figure className={styles.figure} key={x.id}>
              <div className={styles.plainShot}>
                <Image src={mediaUrl(x.url) as string} alt={caption(x) || `${m.media_other}: ${project.title}`} fill sizes="(min-width: 1280px) 1100px, 92vw" className={styles.screenImg} />
              </div>
              {caption(x) && <figcaption>{caption(x)}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
