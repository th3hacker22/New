import re

with open('src/pages/StatsPage.tsx', 'r') as f:
    content = f.read()

replacements = {
    '"Activity Level"': '"مستوى نشاطك"',
    '"Weekly Volume"': '"التوتال في الأسبوع"',
    '"Total Sets"': '"عدد المجاميع"',
    '"Goal: "': '"هدفك: "',
    '" sets"': '" مجاميع"',
    '"Edit Goal"': '"غير الهدف"',
    '"Save"': '"إحفظ"',
    '"Active Muscles This Week"': '"عضلات فرمتها الأسبوع ده"',
    '"Based on completed sets"': '"على حسب اللي لعبته"',
    '"Weekly Volume Progression"': '"تطورك في الأسبوع"',
    '"Daily Tonnage (KG)"': '"الأوزان كل يوم (كجم)"',
    '"Achievements & Milestones"': '"إنجازاتك"',
    '"Workout Frequency"': '"أيام التمرين"',
    '"Days this month"': '"أيام في الشهر"',
    '"Muscle Recovery Status"': '"استشفاء العضلات"',
    '"Red = Sore/Worked, Green = Recovered"': '"أحمر = مجهدة، أخضر = مستريحة"',
    '"Select Exercise"': '"اختار تمرينة"',
    '"No history for this exercise yet."': '"العب التمرينة دي عشان تشوف تطورك."',
    '"Estimated 1RM"': '"أقصى وزن لعدة واحدة (1RM)"',
    '"Progression: "': '"التطور: "',
    '"Progress Photos"': '"صور التطور"',
    '"No photos yet."': '"لسه مفيش صور."',
    '"Upload a progress photo to track your transformation."': '"ارفع صورة ليك عشان تتابع مستواك."',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/StatsPage.tsx', 'w') as f:
    f.write(content)
print("Updated StatsPage.tsx")
