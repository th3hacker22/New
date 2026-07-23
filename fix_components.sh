#!/bin/bash
for file in src/components/layout/*.tsx src/components/stats/*.tsx src/components/extras/*.tsx; do
  sed -i 's/border-zinc-[0-9]\{3\}\(\/[0-9]\{2\}\)\?/border-border/g' "$file"
  sed -i 's/bg-zinc-[0-9]\{3\}\(\/[0-9]\{2\}\)\?/bg-bg-surface-hover/g' "$file"
  sed -i 's/text-zinc-500/text-text-muted/g' "$file"
  sed -i 's/text-zinc-400/text-text-secondary/g' "$file"
  sed -i 's/text-zinc-600/text-text-secondary/g' "$file"
  sed -i 's/text-zinc-700/text-text-primary/g' "$file"
  sed -i 's/text-zinc-300/text-text-primary/g' "$file"
  sed -i 's/from-zinc-[0-9]\{3\}\(\/[0-9]\{2\}\)\?/from-bg-surface/g' "$file"
  sed -i 's/to-zinc-[0-9]\{3\}\(\/[0-9]\{2\}\)\?/to-bg-surface-hover/g' "$file"
  sed -i 's/via-zinc-[0-9]\{3\}\(\/[0-9]\{2\}\)\?/via-bg-surface/g' "$file"
  sed -i 's/ring-zinc-[0-9]\{3\}\(\/[0-9]\{2\}\)\?/ring-border/g' "$file"
done
