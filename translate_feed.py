import re

with open('src/pages/FeedPage.tsx', 'r') as f:
    content = f.read()

replacements = {
    '"Social Feed"': '"الناس في الجيم 👥"',
    '"See what the ReLift community is up to."': '"شوف وحوش ري‌ليفت بيتمرنوا إيه."',
    '"No posts yet."': '"مفيش بوستات لسه."',
    '"Start a workout to share your progress!"': '"ابدا تمرينتك عشان تشير تطورك!"',
    '"Followers"': '"الفولورز"',
    '"Following"': '"بتتابع"',
    '"Workouts"': '"التمارين"',
    '"Kudos"': '"عاش"',
    '"Volume"': '"توتال وزن"',
    '"Share"': '"شير"',
    '"Duration"': '"الوقت"',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/FeedPage.tsx', 'w') as f:
    f.write(content)
print("Updated FeedPage.tsx")
