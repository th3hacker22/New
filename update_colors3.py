import re

with open('src/index.css', 'r') as f:
    content = f.read()

start_match = re.search(r':root\s*,\s*:root\[data-theme="light"\]\s*\{', content)
if not start_match:
    print("Not found")
    exit(1)

start = start_match.start()
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
