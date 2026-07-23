import os
import re

directory = 'src/pages'

replacements = [
    (r'bg-zinc-950', r'bg-bg-surface'),
    (r'border-zinc-850', r'border-border'),
    (r'border-zinc-800', r'border-border'),
    (r'border-zinc-750', r'border-border'),
    (r'bg-zinc-900/30', r'bg-bg-surface-hover'),
    (r'bg-zinc-900/50', r'bg-bg-elevated'),
    (r'bg-zinc-900', r'bg-bg-surface-hover'),
    (r'text-zinc-500', r'text-text-muted'),
    (r'text-zinc-400', r'text-text-secondary'),
    (r'text-white', r'text-text-primary'),
]

for filename in os.listdir(directory):
    if filename.endswith(".tsx"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r') as file:
            content = file.read()
            
        original_content = content
        
        # We need to be careful with text-white on colored backgrounds
        # Let's do a naive replacement first, except for bg-red-500 and bg-primary
        # Actually, let's just replace all and then fix specific ones if they look weird,
        # but text-text-primary on bg-red-500 might be dark in light mode, which is bad.
        # Let's do a more targeted approach.
        
        for old, new in replacements:
            content = re.sub(old, new, content)
            
        # Revert text-text-primary on specific backgrounds
        content = re.sub(r'bg-red-500(/90)?\s+text-text-primary', r'bg-red-500\1 text-white', content)
        content = re.sub(r'bg-primary(/90)?\s+text-text-primary', r'bg-primary\1 text-white', content)
        content = re.sub(r'bg-blue-500(/90)?\s+text-text-primary', r'bg-blue-500\1 text-white', content)
        
        if original_content != content:
            with open(filepath, 'w') as file:
                file.write(content)
            print(f"Updated {filename}")

