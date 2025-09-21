"use client";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Carousel({ children }: { children: React.ReactNode }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">{children}</div>
      </div>
      <button
        onClick={prev}
        className="absolute top-1/2 left-0 -translate-y-1/2 bg-white border rounded-full shadow p-2 hover:bg-gray-50"
        aria-label="Prev"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute top-1/2 right-0 -translate-y-1/2 bg-white border rounded-full shadow p-2 hover:bg-gray-50"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
