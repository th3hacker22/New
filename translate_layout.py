import re

with open('src/components/layout/Layout.tsx', 'r') as f:
    content = f.read()

replacements = {
    '"تمرين"': '"التمارين"',
    '"استكشاف"': '"الناس"',
    '"التغذية"': '"أكلك"',
    '"التقدم"': '"تطورك"',
    '"أنت"': '"بروفايلك"',
    '"ابدأ تمريناً جديداً"': '"إبدأ تمرينة جديدة"'
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/components/layout/Layout.tsx', 'w') as f:
    f.write(content)
print("Updated Layout.tsx")
