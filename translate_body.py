import re

with open('src/pages/BodyPage.tsx', 'r') as f:
    content = f.read()

replacements = {
    '"My Body"': '"جسمك 🧍‍♂️"',
    '"Body Measurements"': '"مقاساتك"',
    '"Progress Photos"': '"صور التطور"',
    '"Track your transformation."': '"تابع تطورك خطوة بخطوة."',
    '"Measurements"': '"القياسات"',
    '"Weight & Fat"': '"الوزن والدهون"',
    '"Body Proportions"': '"مقاسات العضلات"',
    '"Weight"': '"الوزن"',
    '"Body Fat"': '"الدهون"',
    '"Waist"': '"الوسط"',
    '"Chest"': '"الصدر"',
    '"Left Arm"': '"دراع شمال"',
    '"Right Arm"': '"دراع يمين"',
    '"Left Leg"': '"رجل شمال"',
    '"Right Leg"': '"رجل يمين"',
    '"Log Measurements"': '"سجل قياساتك"',
    '"View Photo History"': '"شوف صورك القديمة"',
    '"Compare"': '"قارن"',
    '"Before & After"': '"قبل وبعد"',
    '"Save"': '"إحفظ"',
    '"Cancel"': '"إلغي"',
    '"No measurements logged yet."': '"لسه مسجلتش أي مقاسات."',
    '"No photos yet."': '"لسه مفيش صور."',
    '"Upload a photo to see it here."': '"ارفع صورة عشان تشوفها هنا."',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/BodyPage.tsx', 'w') as f:
    f.write(content)
print("Updated BodyPage.tsx")
