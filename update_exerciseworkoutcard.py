import re

with open('src/components/workout/ExerciseWorkoutCard.tsx', 'r') as f:
    content = f.read()

# translate English strings
replacements = {
    '"Image"': '"صورة"',
    '"Anim"': '"فيديو"',
    '"CAPTAIN\'S TIP"': '"نصيحة الكابتن 💡"',
    '"ADD NOTES"': '"ملاحظاتك"',
    '"ADD SET +"': '"ضيف مجموعة +"',
    '"REPS"': '"عدات"',
    '"KG"': '"كجم"',
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Make button text white for contrast on the white image background
content = content.replace('bg-bg/80 px-2.5 py-1.5 text-[10px] font-semibold text-text-primary', 'bg-black/50 px-2.5 py-1.5 text-[10px] font-semibold text-white')
content = content.replace('bg-bg/80 px-2.5 py-1 text-[10px] font-bold text-primary', 'bg-black/50 px-2.5 py-1 text-[10px] font-bold text-primary')

with open('src/components/workout/ExerciseWorkoutCard.tsx', 'w') as f:
    f.write(content)
print("Done")
