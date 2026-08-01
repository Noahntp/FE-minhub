import re

with open('src/features/auth/components/AuthScreens.tsx', 'r') as f:
    content = f.read()

# 1. max-w-4xl -> max-w-md
content = content.replace('max-w-4xl', 'max-w-md')

# 2. Login Mode Grid -> flex column
content = content.replace('<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">', '<div>')

# 3. Login form col-span-7 -> just normal
content = content.replace('<form onSubmit={handleLogin} className="space-y-4 lg:col-span-7 text-left">', '<form onSubmit={handleLogin} className="space-y-4 text-left">')

# 4. Remove right column
# The right column starts at {/* Right Column: Previously Logged-in Accounts on this device & Seed Database Accounts */}
# And ends before </div>\n            </div>\n          )}
# Let's use regex
pattern = r'\{\/\* Right Column: Previously Logged-in Accounts on this device & Seed Database Accounts \*\/\}[\s\S]*?(?=<\/div>\s*<\/div>\s*\)\})'
content = re.sub(pattern, '', content)

# 5. Register mode 2 columns -> 1 column
content = content.replace('<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">', '<div className="grid grid-cols-1 gap-4">')
content = content.replace('<div className="grid grid-cols-1 md:grid-cols-2 gap-3">', '<div className="grid grid-cols-1 gap-3">')

with open('src/features/auth/components/AuthScreens.tsx', 'w') as f:
    f.write(content)
