import bg from "@/assets/home-bg.png.asset.json";

/** Fixed full-page photo background shown at full strength (no white wash), with a light neutral tint for text readability. */
export default function PageBackground({ src = bg.url, opacity = "opacity-100" }: { src?: string; opacity?: string }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${opacity}`}
        style={{ backgroundImage: `url(${src})`, filter: "brightness(0.82) contrast(1.08) saturate(1.05)" }}
      />
      <div className="absolute inset-0 bg-foreground/10" />
    </div>
  );
}
