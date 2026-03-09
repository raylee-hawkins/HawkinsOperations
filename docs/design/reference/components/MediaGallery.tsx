"use client";

import { useState } from "react";

type MediaItem = {
  src: string;
  alt: string;
  caption: string;
};

type MediaGalleryProps = {
  items: MediaItem[];
};

// WHY: The gallery must stay keyboard-friendly and light enough for a static-first
// portfolio, so it uses simple state and avoids a dependency-heavy carousel.
export default function MediaGallery({ items }: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex];

  return (
    <section aria-label="Media gallery" className="space-y-4">
      <figure className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft dark:border-neutral-800 dark:bg-neutral-800">
        <img src={active.src} alt={active.alt} className="h-auto w-full" />
        <figcaption className="border-t border-neutral-200 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
          {active.caption}
        </figcaption>
      </figure>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((item, index) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`rounded-xl border p-3 text-left transition ${
              index === activeIndex
                ? "border-primary-700 bg-primary-50 dark:border-primary-500 dark:bg-neutral-800"
                : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            }`}
          >
            <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Slide {index + 1}
            </span>
            <span className="mt-1 block text-sm text-neutral-600 dark:text-neutral-300">
              {item.caption}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
