import re

with open('src/pages/ExerciseDetailPage.tsx', 'r') as f:
    content = f.read()

replacements = {
    '"Instructions"': '"إزاي تتمرنها"',
    '"Muscles Worked"': '"العضلات اللي بتشغلها"',
    '"Alternative Exercises"': '"بادلها بتمرين تاني"',
    '"No alternatives found for this exercise."': '"مفيش بدايل للتمرين ده."',
    '"Equipment"': '"الأداة"',
    '"Primary Muscle"': '"العضلة الأساسية"',
    '"Target"': '"المستهدف"',
    '"Video Tutorial"': '"فيديو توضيحي"',
    '"Image"': '"صورة"',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/ExerciseDetailPage.tsx', 'w') as f:
    f.write(content)
print("Updated ExerciseDetailPage.tsx")
