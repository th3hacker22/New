import re

with open('src/pages/ExercisesPage.tsx', 'r') as f:
    content = f.read()

replacements = {
    '"Exercises Library"': '"مكتبة التمارين"',
    '"Search exercises, muscles, equipment..."': '"دور على تمرينة، عضلة، أو أداة..."',
    '"Body Part"': '"العضلة"',
    '"Equipment"': '"الأداة"',
    '"Target"': '"العضلة المستهدفة"',
    '"Clear Filters"': '"امسح الفلاتر"',
    '"{filteredExercises.length} Exercises"': '"{filteredExercises.length} تمرين"',
    '"Body Parts"': '"العضلات"',
    '"Muscles"': '"العضلات"',
    '"No Exercises Found"': '"مفيش تمارين لسه"',
    '"Try adjusting your filters or search query to find more exercises."': '"جرب تدور بكلمة تانية أو تعدل الفلاتر."',
    '"Load More"': '"وريني كمان"'
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/ExercisesPage.tsx', 'w') as f:
    f.write(content)
print("Updated ExercisesPage.tsx")
