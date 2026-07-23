import re

with open('src/components/layout/Layout.tsx', 'r') as f:
    content = f.read()

# find:
#             <h1 className="text-xl font-black italic tracking-widest uppercase text-primary drop-shadow-[0_0_8px_rgba(204,255,0,0.4)]">
#               ReLift
#             </h1>
# replace with an img and text

old = r'<h1 className="text-xl font-black italic tracking-widest uppercase text-primary drop-shadow-\[0_0_8px_rgba\(204,255,0,0\.4\)\]">\s*ReLift\s*</h1>'
new = r'''<div className="flex items-center justify-center gap-2">
              <img src="/src/assets/images/relift_logo_1784576563070.jpg" alt="ReLift Logo" className="w-8 h-8 rounded-lg object-cover border border-primary/30" />
              <h1 className="text-xl font-black italic tracking-widest uppercase text-primary drop-shadow-[0_0_8px_rgba(204,255,0,0.4)]">
                ReLift
              </h1>
            </div>'''

content = re.sub(old, new, content)

with open('src/components/layout/Layout.tsx', 'w') as f:
    f.write(content)
print("Done")
