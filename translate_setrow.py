import re

with open('src/components/workout/SetRow.tsx', 'r') as f:
    content = f.read()

replacements = {
    '"normal"': '"عادي"',
    '"warmup"': '"تسخين"',
    '"right"': '"يمين"',
    '"left"': '"شمال"',
    '"failure"': '"للفشل"',
    '"drop"': '"دروب سيت"',
    '"negative"': '"سلبي"',
    '"partial"': '"جزئي"',
    '"myoreps"': '"مايو ريبس"',
    '"feeder"': '"تجهيز"',
    '"top"': '"أعلى وزن"',
    '"backoff"': '"تخفيف وزن"',
    '>Normal Set<': '>مجموعة عادية<',
    '>Warm-up (W)<': '>تسخين (W)<',
    '>Right Arm/Leg (R)<': '>إيد/رجل يمين (R)<',
    '>Left Arm/Leg (L)<': '>إيد/رجل شمال (L)<',
    '>To Failure (F)<': '>لحد الفشل (F)<',
    '>Drop Set (D)<': '>دروب سيت (D)<',
    '>Negative Reps (N)<': '>تكرار سلبي (N)<',
    '>Partial Reps (P)<': '>تكرار جزئي (P)<',
    '>Myo-reps (M)<': '>مايو ريبس (M)<',
    '>Feeder Set (Fe)<': '>مجموعة تجهيز (Fe)<',
    '>Top Set (T)<': '>أعلى وزن (T)<',
    '>Back-off Set (B)<': '>تخفيف وزن (B)<',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/components/workout/SetRow.tsx', 'w') as f:
    f.write(content)
print("Updated SetRow.tsx")
