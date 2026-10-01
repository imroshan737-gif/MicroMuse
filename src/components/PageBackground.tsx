import bg from "@/assets/home-bg.png.asset.json";

/** Fixed full-page photo background, shown at 70% opacity so text stays readable. */
export default function PageBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-70"
      style={{ backgroundImage: `url(${bg.url})` }}
    />
  );
}
