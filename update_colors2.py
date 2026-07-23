import re

with open('src/index.css', 'r') as f:
    content = f.read()

old_block = """:root,
:root[data-theme="light"] {
  --c-bg: #f9fafb;
  --c-bg-surface: #ffffff;
  --c-bg-surface-hover: #f3f4f6;
  --c-bg-elevated: #ffffff;
  --c-primary: #ccff00;
  --c-primary-hover: #b8e600;
  --c-primary-dim: rgba(204, 255, 0, 0.15);
  --c-primary-glow: rgba(204, 255, 0, 0.4);
  --c-primary-text: #050505;
  --c-secondary: #00d0df;
  --c-secondary-dim: rgba(0, 208, 223, 0.1);
  --c-secondary-glow: rgba(0, 208, 223, 0.3);
  --c-success: #00c853;
  --c-warning: #f57c00;
  --c-danger: #d32f2f;
  --c-text-primary: #111827;
  --c-text-secondary: #4b5563;
  --c-text-muted: #9ca3af;
  --c-border: rgba(0, 0, 0, 0.1);
  --c-border-hover: rgba(0, 0, 0, 0.15);
  --c-border-active: rgba(204, 255, 0, 0.8);
  --s-card: 0 4px 20px rgba(0, 0, 0, 0.08);
  --s-card-hover: 0 8px 30px rgba(0, 0, 0, 0.12);
  --s-glow-primary: 0 0 20px rgba(204, 255, 0, 0.4);
  --s-glow-secondary: 0 0 20px rgba(0, 208, 223, 0.3);
  --s-inset: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  --glass-bg: rgba(255, 255, 255, 0.8);
  --glass-border: rgba(0, 0, 0, 0.08);
  --skeleton-base: rgba(0, 0, 0, 0.05);
  --skeleton-highlight: rgba(0, 0, 0, 0.1);
}"""

# The file was minified by prettier or something
import sys

# Just find the block starting with :root,:root[data-theme="light"] { and ending with }
start = content.find(':root,:root[data-theme="light"] {')
if start == -1:
    print("Not found")
    sys.exit(1)
end = content.find('}', start) + 1

new_block = """:root,
:root[data-theme="light"] {
  --c-bg: #f9fafb;
  --c-bg-surface: #ffffff;
  --c-bg-surface-hover: #f3f4f6;
  --c-bg-elevated: #ffffff;
  --c-primary: #65a30d;
  --c-primary-hover: #4d7c0f;
  --c-primary-dim: rgba(101, 163, 13, 0.15);
  --c-primary-glow: rgba(101, 163, 13, 0.4);
  --c-primary-text: #ffffff;
  --c-secondary: #0284c7;
  --c-secondary-dim: rgba(2, 132, 199, 0.1);
  --c-secondary-glow: rgba(2, 132, 199, 0.3);
  --c-success: #16a34a;
  --c-warning: #d97706;
  --c-danger: #dc2626;
  --c-text-primary: #111827;
  --c-text-secondary: #4b5563;
  --c-text-muted: #6b7280;
  --c-border: rgba(0, 0, 0, 0.15);
  --c-border-hover: rgba(0, 0, 0, 0.25);
  --c-border-active: rgba(101, 163, 13, 0.8);
  --s-card: 0 4px 20px rgba(0, 0, 0, 0.05);
  --s-card-hover: 0 8px 30px rgba(0, 0, 0, 0.08);
  --s-glow-primary: 0 0 20px rgba(101, 163, 13, 0.4);
  --s-glow-secondary: 0 0 20px rgba(2, 132, 199, 0.3);
  --s-inset: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  --glass-bg: rgba(255, 255, 255, 0.9);
  --glass-border: rgba(0, 0, 0, 0.1);
  --skeleton-base: rgba(0, 0, 0, 0.05);
  --skeleton-highlight: rgba(0, 0, 0, 0.1);
}"""

content = content[:start] + new_block + content[end:]
with open('src/index.css', 'w') as f:
    f.write(content)

print("Updated")
