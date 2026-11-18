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
      {images.length > 1 && (
        <ul className="flex gap-2 lg:flex-col">
          {images.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={thumbLabel.replace("{n}", String(i + 1))}
                aria-current={active === i ? "true" : undefined}
                className={`relative block h-20 w-16 overflow-hidden rounded-xl bg-sand ring-2 transition ${active === i ? "ring-ink" : "ring-transparent hover:ring-line"}`}
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
