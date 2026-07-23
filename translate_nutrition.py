import re

with open('src/pages/NutritionPage.tsx', 'r') as f:
    content = f.read()

replacements = {
    '"Nutrition & Macros"': '"أكلك والماكروز 🍎"',
    '"Daily Goals"': '"أهدافك اليومية"',
    '"Calories"': '"سعرات"',
    '"Protein"': '"بروتين"',
    '"Carbs"': '"كارب"',
    '"Fat"': '"دهون"',
    '"Log Food"': '"سجل أكل"',
    '"Meal History"': '"تاريخ الأكل"',
    '"Breakfast"': '"فطار"',
    '"Lunch"': '"غدا"',
    '"Dinner"': '"عشا"',
    '"Snacks"': '"سناكس"',
    '"Water Intake"': '"الميه"',
    '"glasses"': '"كوبايات"',
    '"Edit Goals"': '"غير أهدافك"',
    '"Save Goals"': '"إحفظ أهدافك"',
    '"No food logged today."': '"لسه مسجلتش أكل النهاردة."',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/NutritionPage.tsx', 'w') as f:
    f.write(content)
print("Updated NutritionPage.tsx")
