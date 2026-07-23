import React, { useEffect, useState, useRef } from "react";
import { animate } from "framer-motion";

interface Props {
  value: number;
  duration?: number;
  formatter?: (val: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.2,
  formatter = (v) => Math.round(v).toString(),
  className,
}: Props) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const controls = animate(previousValue.current, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });

    return () => {
      controls.stop();
      previousValue.current = value;
    };
  }, [value, duration]);

  return <span className={className}>{formatter(displayValue)}</span>;
}
