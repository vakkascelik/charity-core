import { Btn } from "./Btn";
import { videoHostLabel } from "../lib/video";

/**
 * "Watch on YouTube" call-to-action for a content item's video link.
 * Renders nothing when there's no URL, so callers can drop it in
 * unconditionally. Opens in a new tab; see lib/video for why we link
 * rather than embed.
 */
export function VideoLink({
  url,
  kind = "secondary",
  size = "md",
}: {
  url: string | null | undefined;
  kind?: "primary" | "secondary" | "teal" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  if (!url) return null;
  return (
    <Btn kind={kind} size={size} icon="play" href={url} target="_blank">
      Watch on {videoHostLabel(url)}
    </Btn>
  );
}
