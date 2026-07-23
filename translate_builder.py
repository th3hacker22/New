import re

with open('src/pages/BuilderPage.tsx', 'r') as f:
    content = f.read()

replacements = {
    '"Routine Builder"': '"اعمل تمرينة"',
    '"Routine Name"': '"اسم التمرينة"',
    '"e.g., Push Day, Upper Body..."': '"مثلا: يوم دفع، بنش وتراي..."',
    '"Select Muscle Groups"': '"اختار العضلات"',
    '"Notes / Instructions"': '"نصايحك لنفسك / ملاحظات"',
    '"Add Exercise"': '"ضيف تمرينة"',
    '"No exercises added yet. Tap the + button to add some!"': '"لسه مضفتش تمارين. دوس على علامة + عشان تبدأ!"',
    '"Save Routine"': '"احفظ التمرينة"',
    '"Add Exercises"': '"اختار التمرين"',
    '"Search exercises..."': '"دور على تمرينة..."',
    '"SETS"': '"مجاميع"',
    '"Done"': '"خلصت"',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/BuilderPage.tsx', 'w') as f:
    f.write(content)
print("Updated BuilderPage.tsx")
