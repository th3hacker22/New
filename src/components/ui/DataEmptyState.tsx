import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/utils/cn";
import { Button } from "./Button";

interface Props {
  icon?: LucideIcon;
  imageSrc?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function DataEmptyState({
  icon: Icon,
  imageSrc,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-[24px] border border-border/40 bg-bg-surface/30 backdrop-blur-sm relative overflow-hidden group shadow-lg min-h-[300px] w-full",
        className
      )}
    >
      {/* Background Decorative Grid Pattern or Lights */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,255,0,0.04)_0%,transparent_65%)] pointer-events-none" />

      {/* Fitness-themed holographic vector illustration wrapper */}
      <div className="relative flex items-center justify-center w-28 h-28 mb-6">
        {/* Animated Rings for holographic sci-fi tech aesthetic */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-dashed border-primary/20 opacity-40 scale-100"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border border-dotted border-cyan-500/20 opacity-30 scale-95"
        />
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-4 rounded-full bg-primary/5 border border-primary/15 filter blur-[2px]"
        />
        
        {/* Central visual piece: either custom image or a beautiful pulsing icon wrapper */}
        {imageSrc ? (
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-border/50 shadow-md bg-bg-surface z-10">
            <img
              src={imageSrc}
              alt={title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : Icon ? (
          <motion.div
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-elevated border border-border/80 text-primary shadow-xl z-10"
          >
            {/* Subtle glow behind the icon */}
            <div className="absolute inset-0 bg-primary/10 rounded-2xl filter blur-md opacity-75 group-hover:bg-primary/20 transition-colors" />
            <Icon className="h-8 w-8 text-primary drop-shadow-[0_0_8px_rgba(204,255,0,0.5)] z-10" />
          </motion.div>
        ) : null}

        {/* Small floating accents */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1 -right-1 text-xs select-none filter drop-shadow-[0_0_4px_rgba(204,255,0,0.3)] opacity-70"
        >
          ✨
        </motion.div>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute -bottom-1 -left-1 text-[10px] select-none opacity-50"
        >
          ⚡
        </motion.div>
      </div>

      {/* Typography */}
      <h3 className="text-base font-black italic uppercase tracking-tight text-text-primary mb-2 max-w-[280px]">
        {title}
      </h3>
      <p className="text-xs text-text-muted/80 max-w-[280px] mb-6 leading-relaxed font-semibold">
        {description}
      </p>

      {/* Call to action */}
      {actionLabel && onAction ? (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onAction}
            variant="primary"
            className="rounded-xl font-black text-xs uppercase tracking-wider py-2 px-5 min-h-[38px] cursor-pointer"
          >
            {actionLabel}
          </Button>
        </motion.div>
      ) : null}
    </div>
  );
}
