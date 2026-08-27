"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function SlideNav({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        if (current < total) {
          router.push(`/${current + 1}`);
        }
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        if (current > 0) {
          router.push(current === 1 ? "/" : `/${current - 1}`);
        }
      } else if (e.key === "Home") {
        e.preventDefault();
        router.push("/");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, total, router]);

  return null;
}

export function NavArrows({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const prevHref = current <= 1 ? "/" : `/${current - 1}`;
  const nextHref = current < total ? `/${current + 1}` : null;
  const prevLabel =
    current === 0 ? "" : current === 1 ? "Title" : `${current - 1}`;
  const nextLabel = nextHref ? `${current + 1}` : "";

  return (
    <>
      {current > 0 && (
        <a
          href={prevHref}
          className="group fixed bottom-8 left-8 z-20 flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
          {prevLabel && (
            <span className="font-mono text-xs tabular-nums">{prevLabel}</span>
          )}
        </a>
      )}
      {nextHref && (
        <a
          href={nextHref}
          className="group fixed bottom-8 right-8 z-20 flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Next slide"
        >
          {nextLabel && (
            <span className="font-mono text-xs tabular-nums">{nextLabel}</span>
          )}
          <ChevronRight className="size-5 transition-transform group-hover:translate-x-0.5" />
        </a>
      )}
    </>
  );
}
