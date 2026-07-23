import re

with open('src/pages/WorkoutResultView.tsx', 'r') as f:
    content = f.read()

replacements = {
    '"WORKOUT SUMMARY"': '"ملخص التمرينة"',
    '"Total Volume"': '"الحجم العضلي التوتال"',
    '"Total Duration"': '"الوقت اللي اخدته"',
    '"Exercises Completed"': '"تمارين خلصتها"',
    '"Workout Volume Progression"': '"تطورك في الوزن التوتال"',
    '"Estimated Recovery"': '"الاستشفاء المتوقع"',
    '"Great job! You\'ll need about"': '"عاش يا بطل! هتحتاج حوالي"',
    '"hours of recovery before hitting these muscles again."': '"ساعة راحة قبل ما تلعب العضلات دي تاني."',
    '"Save & Exit"': '"احفظ واخرج"',
    '"Tonnage"': '"أوزان توتال"',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/WorkoutResultView.tsx', 'w') as f:
    f.write(content)
print("Updated WorkoutResultView.tsx")
