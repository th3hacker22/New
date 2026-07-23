import re

with open('index.html', 'r') as f:
    content = f.read()

# Replace <link rel="icon" type="image/svg+xml" href="/vite.svg" />
old = r'<link rel="icon" type="image/svg\+xml" href="[^"]+" />'
new = r'<link rel="icon" type="image/jpeg" href="/src/assets/images/relift_logo_1784576563070.jpg" />'

content = re.sub(old, new, content)

with open('index.html', 'w') as f:
    f.write(content)
print("Done")
