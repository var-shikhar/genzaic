"use client";
import { cn } from "@/lib/utils";
import React from "react";

export function GridBackground({
  children,
  className,
  containerClassName,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <div className={cn("relative w-full", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 dark:bg-grid-white/[0.03] bg-grid-black/[0.03]",
          className
        )}
      />
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      {children}
    </div>
  );
}

export function DotBackground({
  children,
  className,
  containerClassName,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <div className={cn("relative w-full", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 dark:bg-dot-white/[0.15] bg-dot-black/[0.15]",
          className
        )}
      />
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      {children}
    </div>
  );
}
