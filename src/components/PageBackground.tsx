/** Fixed full-page photo background shown at full strength (no white wash), with a light neutral tint for text readability. */

// Lovable-style asset paths (/__l5e/assets-v1/<id>/<name>.png) only exist on Lovable's hosting.
// This maps them to the real file in /public (e.g. /landing-bg.png) so Vercel can serve it.
const resolveSrc = (url: string) =>
  url.startsWith("/__l5e/") ? `/${url.split("/").pop()}` : url;

export default function PageBackground({
  src = "/landing-bg.png",
  opacity = "opacity-100",
}: {
  src?: string;
  opacity?: string;
}) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${opacity}`}
        style={{
          backgroundImage: `url(${resolveSrc(src)})`,
          filter: "brightness(0.82) contrast(1.08) saturate(1.05)",
        }}
      />
      <div className="absolute inset-0 bg-foreground/10" />
    </div>
  );
}