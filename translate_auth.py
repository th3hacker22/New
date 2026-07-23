import re

with open('src/pages/AuthPage.tsx', 'r') as f:
    content = f.read()

replacements = {
    '"Sign in to ReLift"': '"ادخل على ري‌ليفت"',
    '"Your personal fitness journey awaits."': '"فورمتك بتبدأ من هنا يا بطل."',
    '"Continue as Guest"': '"كمل كزائر"',
    '"No sign up required"': '"مش لازم تسجل"',
    '"By continuing, you agree to our Terms of Service and Privacy Policy."': '"لو كملت، ده معناه إنك موافق على الشروط والأحكام."',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/AuthPage.tsx', 'w') as f:
    f.write(content)
print("Updated AuthPage.tsx")
