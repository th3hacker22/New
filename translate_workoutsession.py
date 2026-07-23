import re

with open('src/pages/WorkoutSessionPage.tsx', 'r') as f:
    content = f.read()

replacements = {
    '"WORKOUT SESSION"': '"وقت الفورمة 🏋️‍♂️"',
    '"Workout Cancelled"': '"لغينا التمرينة"',
    '"Your active session has been cancelled."': '"التمرينة اتلغت خلاص."',
    '"OK"': '"ماشي"',
    '"Rest Timer"': '"وقت الراحة"',
    '"Settings"': '"الإعدادات"',
    '"Finish"': '"خلصت"',
    '"Cancel Workout"': '"إلغي التمرينة"',
    '"Are you sure you want to cancel?"': '"متأكد إنك عايز تلغي التمرينة؟"',
    '"Yes, Cancel"': '"أيوة، إلغي"',
    '"No, Resume"': '"لأ، كمل"',
    '"Empty Workout"': '"التمرينة فاضية"',
    '"Are you sure you want to finish with no completed sets?"': '"متأكد إنك عايز تخلص ومفيش ولا مجموعة كاملة؟"',
    '"Finish Anyway"': '"خلص وخلاص"',
    '"ADD EXERCISE +"': '"ضيف تمرينة +"',
    '"Add Notes"': '"ضيف ملاحظات"',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/WorkoutSessionPage.tsx', 'w') as f:
    f.write(content)
print("Updated WorkoutSessionPage.tsx")
