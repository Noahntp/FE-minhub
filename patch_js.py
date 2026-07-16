import glob
import re

files = glob.glob("/home/helios29123/src/MindHub/MindHub-Frontend/src/assets/js/pages/*.js")
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace document.addEventListener("DOMContentLoaded", function() { or () => {
    # with export function initPage() {
    content = re.sub(r'document\.addEventListener\(\s*["\']DOMContentLoaded["\']\s*,\s*(?:function\s*\(\)\s*\{|\(\)\s*=>\s*\{)', r'export function initPage() {', content, count=1)
    
    # We need to replace the first }); that follows the init block.
    # Since it's usually closed before the first function declaration or at the end of the file,
    # we can find the first '});' that is alone on a line.
    content = re.sub(r'\}\s*\)\s*;', r'}', content, count=1)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done")
