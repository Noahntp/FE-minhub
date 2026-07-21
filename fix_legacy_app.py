import re
import subprocess
import sys

def get_file_content(rev, path):
    result = subprocess.run(['git', 'show', f'{rev}:{path}'], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Failed to get {path} from {rev}")
        sys.exit(1)
    return result.stdout

original_content = get_file_content("1dcac40", "src/App.tsx")
current_content = get_file_content("HEAD", "src/App.tsx")

with open("src/App.tsx", "r", encoding="utf-8") as f:
    current_content = f.read()

# Extract header from original
header_match_orig = re.search(r'<header.*?</header>', original_content, re.DOTALL)
header_orig = header_match_orig.group(0)

# Replace header in current
header_match_curr = re.search(r'<header.*?</header>', current_content, re.DOTALL)
if header_match_curr:
    current_content = current_content[:header_match_curr.start()] + header_orig + current_content[header_match_curr.end():]
else:
    print("Could not find header in current")
    
# Extract footer from original
footer_match_orig = re.search(r'<footer.*?</footer>', original_content, re.DOTALL)
footer_orig = footer_match_orig.group(0)

# Replace footer in current
footer_match_curr = re.search(r'<footer.*?</footer>', current_content, re.DOTALL)
if footer_match_curr:
    current_content = current_content[:footer_match_curr.start()] + footer_orig + current_content[footer_match_curr.end():]
else:
    print("Could not find footer in current")
    
with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(current_content)
    
print("Replaced Header and Footer successfully!")
