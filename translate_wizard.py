import re

with open('src/components/workout/GeneratorWizard.tsx', 'r') as f:
    content = f.read()

replacements = {
    '"AI Workout Generator 🔮"': '"مولد التمارين بالذكاء الاصطناعي 🔮"',
    '"Goal"': '"الهدف"',
    '"Equipment"': '"الأدوات"',
    '"Focus"': '"التركيز"',
    '"Duration"': '"المدة"',
    '"What is your primary fitness goal?"': '"إيه هدفك من التمرين؟"',
    '"Hypertrophy (Muscle Growth)"': '"ضخامة عضلية"',
    '"Strength & Power"': '"قوة العصب والأوزان"',
    '"Endurance & Conditioning"': '"قوة تحمل وتخسيس"',
    '"What equipment do you have access to?"': '"إيه الأدوات اللي معاك؟"',
    '"Full Gym (Machines, Cables, Free Weights)"': '"جيم كامل (أجهزة وكابلات وبارات)"',
    '"Dumbbells & Benches Only"': '"دمبل وبنش بس"',
    '"Bodyweight & Bands"': '"وزن الجسم وأستيك"',
    '"Which muscles do you want to target?"': '"إيه العضلات اللي هتلعبها؟"',
    '"Full Body"': '"جسم كامل"',
    '"Upper Body"': '"نص اللي فوق (بنش، ظهر، دراع)"',
    '"Lower Body (Legs & Glutes)"': '"رجل (أمامي وخلفي وسمانة)"',
    '"Push (Chest, Shoulders, Triceps)"': '"يوم دفع (بنش، كتف، تراي)"',
    '"Pull (Back, Biceps, Forearms)"': '"يوم سحب (ظهر، باي، ريست)"',
    '"How long do you want to work out?"': '"عايز تتمرن قد إيه؟"',
    '"30 Minutes (Quick & Intense)"': '"٣٠ دقيقة (ع السريع)"',
    '"45 Minutes (Standard)"': '"٤٥ دقيقة (المتوسط)"',
    '"60+ Minutes (Comprehensive)"': '"٦٠ دقيقة أو أكتر (فرمة بجد)"',
    '"Generate My Workout"': '"اعملي التمرينة"',
    '"Generating your personalized plan..."': '"بنعملك فورمة على مقاسك..."',
    '"Back"': '"ارجع"',
    '"Cancel"': '"إلغي"',
    '"Start AI Workout"': '"إبدأ تمرينة الذكاء الاصطناعي"',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/components/workout/GeneratorWizard.tsx', 'w') as f:
    f.write(content)
print("Updated GeneratorWizard.tsx")
