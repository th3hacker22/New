import re

with open('src/pages/ProfilePage.tsx', 'r') as f:
    content = f.read()

replacements = {
    '"Level"': '"المستوى"',
    '"Current split: "': '"النظام الحالي: "',
    '"Achievements"': '"إنجازاتك 🏆"',
    '"Earned "': '"كسبت "',
    '" out of "': '" من "',
    '" trophies"': '" كاس"',
    '"Activity History"': '"تاريخ بطولاتك 📅"',
    '"All Workouts"': '"كل التمارين"',
    '"WORKOUT"': '"تمرينة"',
    '"No workouts yet"': '"لسه متمرنتش يا بطل"',
    '"Start a workout to see your history here."': '"ابدأ تمرينتك وهتلاقيها هنا متسجلة."',
    '"Lifetime Stats"': '"تاريخك كلو 📊"',
    '"Total Volume"': '"الحجم الكلي"',
    '"Total Workouts"': '"عدد التمارين"',
    '"Current Streak"': '"الاستمرارية (ستريك)"',
    '"Max Streak"': '"أعلى ستريك"',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/ProfilePage.tsx', 'w') as f:
    f.write(content)
print("Updated ProfilePage.tsx")
