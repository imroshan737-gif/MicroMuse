import bg from "@/assets/home-bg.png.asset.json";

/** Fixed full-page photo background, shown at 60% opacity so text stays readable. */
export default function PageBackground({ src = bg.url, opacity = "opacity-60" }: { src?: string; opacity?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat ${opacity}`}
      style={{ backgroundImage: `url(${src})` }}
    />
  );
}
