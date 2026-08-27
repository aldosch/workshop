import { notFound } from "next/navigation";
import { NavArrows, SlideNav } from "@/components/slide-nav";
import {
  CATEGORY_STYLES,
  type Category,
  slides,
  TOTAL_SLIDES,
} from "@/data/slides";

export function generateStaticParams() {
  return slides.map((_, i) => ({ n: String(i + 1) }));
}

export default async function SlidePage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n } = await params;
  const index = Number(n) - 1;

  if (index < 0 || index >= slides.length) {
    notFound();
  }

  const slide = slides[index];
  const slideNum = index + 1;

  return (
    <>
      <SlideNav current={slideNum} total={TOTAL_SLIDES} />
      <div className="slide-canvas flex min-h-svh flex-col px-12 py-16 sm:px-20 lg:px-32 xl:px-40 xl:py-20">
        <div className="flex items-start gap-4">
          <div className="flex flex-wrap gap-2">
            {slide.categories.map((c: Category) => (
              <span
                key={c}
                className={`font-mono text-[11px] uppercase tracking-wider ${CATEGORY_STYLES[c]}`}
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        <h1 className="mt-6 text-balance font-semibold text-3xl tracking-tight sm:text-4xl xl:text-5xl">
          {slide.title}
        </h1>

        <div className="mt-10 flex-1 space-y-6 text-base leading-relaxed sm:text-lg xl:text-xl">
          {slide.content}
        </div>
      </div>
      <NavArrows current={slideNum} total={TOTAL_SLIDES} />
    </>
  );
}
