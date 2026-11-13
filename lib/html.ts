import "server-only";
import sanitizeHtml from "sanitize-html";
import { contentToHtml } from "./utils";

/** Untrusted editor/import HTML is filtered before storage and before rendering. */
export function articleHtml(value: string) {
  return sanitizeHtml(contentToHtml(value), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "iframe", "figure", "figcaption"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class"],
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      iframe: ["src", "title", "width", "height", "allowfullscreen", "frameborder"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"], iframe: ["https"] },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
    allowProtocolRelative: false,
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }) },
  });
}
