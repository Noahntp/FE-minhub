import re
import os

file = "/home/helios29123/src/MindHub/mindhub-frrontend-adminUI/pages/categories.html"
out_file = "/home/helios29123/src/MindHub/MindHub-Frontend/src/components/Admin/pages/CategoriesManagement.tsx"

with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract from <main to the end before scripts
start = content.find('<main')
end = content.find('<!-- Scripts -->')
if end == -1: end = content.find('<script')

main_content = content[start:end].strip()

jsx = main_content
jsx = jsx.replace('class=', 'className=')
jsx = jsx.replace('for=', 'htmlFor=')
jsx = jsx.replace('stroke-width=', 'strokeWidth=')
jsx = jsx.replace('stroke-linecap=', 'strokeLinecap=')
jsx = jsx.replace('stroke-linejoin=', 'strokeLinejoin=')
jsx = jsx.replace('clip-rule=', 'clipRule=')
jsx = jsx.replace('fill-rule=', 'fillRule=')
jsx = jsx.replace('tabindex=', 'tabIndex=')

# Self-closing tags: input, img, hr, br
jsx = re.sub(r'<(input|img|hr|br)([^>]*?)(?<!/)>', r'<\1\2 />', jsx)

# Comments: <!-- ... --> to {/* ... */}
jsx = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', jsx, flags=re.DOTALL)

def style_replacer(m):
    style_str = m.group(1).strip()
    parts = style_str.split(';')
    rules = []
    for p in parts:
        if not p.strip(): continue
        if ':' in p:
            k, v = p.split(':', 1)
            k = k.strip()
            v = v.strip()
            # camelCase keys
            k = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)
            rules.append(f"{k}: '{v}'")
    return "style={{" + ", ".join(rules) + "}}"

jsx = re.sub(r'style="([^"]*)"', style_replacer, jsx)

component_code = f"import React from 'react';\n\nexport default function CategoriesManagement() {{\n  return (\n    <>\n      {jsx}\n    </>\n  );\n}}\n"
with open(out_file, 'w', encoding='utf-8') as f:
    f.write(component_code)

print("Done")
