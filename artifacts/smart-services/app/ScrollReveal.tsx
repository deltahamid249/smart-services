"use client";

import { useEffect } from "react";

const REVEAL_TARGETS =
  ".ss-service-card, .ss-process-step, .ss-promise-item, .ss-faq-list details";

export default function ScrollReveal() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".ss-home");
    if (
      !root ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const targets = Array.from(
      root.querySelectorAll<HTMLElement>(REVEAL_TARGETS),
    );
    if (targets.length === 0) return;

    root.classList.add("ss-motion-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ss-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" },
    );

    targets.forEach((target, index) => {
      target.classList.add("ss-reveal");
      target.style.setProperty(
        "--ss-reveal-delay",
        `${(index % 3) * 65}ms`,
      );
      observer.observe(target);
    });

    return () => {
      observer.disconnect();
      root.classList.remove("ss-motion-ready");
      targets.forEach((target) => {
        target.classList.remove("ss-reveal", "ss-visible");
        target.style.removeProperty("--ss-reveal-delay");
      });
    };
  }, []);

  return null;
}