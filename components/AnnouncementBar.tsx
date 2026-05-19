"use client";

import { useState } from "react";
import { gradients } from "../lib/tokens";
import { ChevronLeft, ChevronRight } from "./icons";

const announcements = [
  "ONLINE COURSES JUST LANDED",
  "FREE TRACKED DELIVERY ON LAUNCH ORDERS",
  "SECURE CHECKOUT POWERED BY STRIPE",
];

const AnnouncementBar = () => {
  const [index, setIndex] = useState(0);

  const showPrevious = () => {
    setIndex((current) =>
      current === 0 ? announcements.length - 1 : current - 1
    );
  };

  const showNext = () => {
    setIndex((current) => (current + 1) % announcements.length);
  };

  return (
    <div
      className="w-full"
      style={{ backgroundImage: gradients.accent }}
      role="region"
      aria-label="Announcement"
    >
      <div className="mx-auto flex h-8 max-w-[1280px] items-center justify-between px-4 text-[11px] uppercase tracking-[0.35em] text-black/75 sm:h-9 sm:px-6 sm:text-xs">
        <button
          className="grid h-7 w-7 place-items-center rounded-full text-black/70 transition hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label="Previous announcement"
          type="button"
          onClick={showPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-center font-medium">{announcements[index]}</span>
        <button
          className="grid h-7 w-7 place-items-center rounded-full text-black/70 transition hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label="Next announcement"
          type="button"
          onClick={showNext}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
