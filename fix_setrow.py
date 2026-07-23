import re

with open('src/components/workout/SetRow.tsx', 'r') as f:
    content = f.read()

replacements = {
    '"عادي"': '"normal"',
    '"تسخين"': '"warmup"',
    '"يمين"': '"right"',
    '"شمال"': '"left"',
    '"للفشل"': '"failure"',
    '"دروب سيت"': '"drop"',
    '"سلبي"': '"negative"',
    '"جزئي"': '"partial"',
    '"مايو ريبس"': '"myoreps"',
    '"تجهيز"': '"feeder"',
    '"أعلى وزن"': '"top"',
    '"تخفيف وزن"': '"backoff"',
    
    # Wait, some display texts might have been translated to just "عادي", etc. if they were printed directly?
    # Let's check SetRow.tsx
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/components/workout/SetRow.tsx', 'w') as f:
    f.write(content)
print("Updated SetRow.tsx")
