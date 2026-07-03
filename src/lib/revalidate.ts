import { revalidatePath } from "next/cache";

/**
 * Drop the ISR cache for every page under the root layout. Called from admin
 * mutation routes so content edits show on the public site immediately, instead
 * of waiting out the per-page `revalidate` window.
 */
export function revalidatePublic() {
  revalidatePath("/", "layout");
}
