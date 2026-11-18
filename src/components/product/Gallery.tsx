"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Img = { id: string; url: string; alt: string };

export default function Gallery({ images, thumbLabel }: { images: Img[]; thumbLabel: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const goTo = (i: number) => {
    const slide = track.current?.children[i] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setActive(i);
  };

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const i = Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
    if (i !== active) setActive(i);
  };

  if (!images.length) return <div className="aspect-[4/5] rounded-[24px] bg-sand" />;

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse">
      <div className="relative w-full">
      {images.length > 1 && (
        <span className="pointer-events-none absolute bottom-3 end-3 z-10 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold tabular-nums text-paper" aria-hidden="true" dir="ltr">
          {active + 1}/{images.length}
        </span>
      )}
      <div
        ref={track}
        onScroll={onScroll}
        className="flex aspect-[4/5] w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-[24px] bg-sand shadow-soft [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img, i) => (
          <div key={img.id} className="relative h-full w-full shrink-0 snap-start">
            <Image
              src={img.url}
              alt={img.alt}
              fill
              preload={i === 0}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      </div>
      {images.length > 1 && (
        <ul className="-mx-1 flex shrink-0 gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:thin] lg:mx-0 lg:max-h-[min(70vh,640px)] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:px-1">
          {images.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={thumbLabel.replace("{n}", String(i + 1))}
                aria-current={active === i ? "true" : undefined}
                className={`relative block h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-sand ring-2 transition ${active === i ? "ring-ink" : "ring-transparent hover:ring-line"}`}
              >
                <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
