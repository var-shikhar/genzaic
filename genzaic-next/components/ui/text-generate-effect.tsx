"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export function TextGenerateEffect({
  words,
  className,
  highlightWords = [],
  highlightClassName = "gradient-text",
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  highlightWords?: string[];
  highlightClassName?: string;
  filter?: boolean;
  duration?: number;
}) {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span.word",
      { opacity: 1, filter: filter ? "blur(0px)" : "none" },
      { duration, delay: stagger(0.06) }
    );
  }, [scope, animate, filter, duration]);

  return (
    <div className={cn("font-bold", className)}>
      <div ref={scope}>
        {wordsArray.map((word, idx) => {
          const isHighlighted = highlightWords.includes(word.replace(/[.,!?]/g, ""));
          return (
            <motion.span
              key={word + idx}
              className={cn(
                "word opacity-0 inline-block mr-[0.25em]",
                isHighlighted && highlightClassName
              )}
              style={{ filter: filter ? "blur(8px)" : "none" }}
            >
              {word}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}
