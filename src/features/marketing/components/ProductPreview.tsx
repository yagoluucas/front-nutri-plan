import Image from "next/image";

export default function ProductPreview() {
  return (
    <figure className="overflow-hidden rounded-lg border border-border-default bg-surface-default shadow-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
      <Image
        src="/images/marketing/dashboard-preview.png"
        alt="Dashboard oficial do Nutri Plan com indicadores de pacientes e prazos do primeiro plano"
        width={1853}
        height={849}
        sizes="(min-width: 1152px) 1152px, calc(100vw - 3rem)"
        className="h-auto w-full"
        quality={95}
      />
    </figure>
  );
}
