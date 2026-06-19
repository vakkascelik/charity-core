/**
 * Renders a schema.org JSON-LD block. Safe to use in server components.
 * The `<` escape prevents a stray `</script>` in the data from breaking out.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
