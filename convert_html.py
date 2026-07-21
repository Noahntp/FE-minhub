import re
import glob
import os

files = glob.glob("/home/helios29123/src/MindHub/mindhub-frrontend-adminUI/pages/*.html")
out_dir = "/home/helios29123/src/MindHub/MindHub-Frontend/src/components/Admin/pages"
os.makedirs(out_dir, exist_ok=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    match = re.search(r'<main[^>]*>(.*?)</main>', content, re.DOTALL)
    if not match:
        continue
    main_content = match.group(1).strip()
    
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

    name = os.path.basename(file).replace('.html', '').replace('-', ' ').title().replace(' ', '')
    
    if name == 'Dashboard': name = 'DashboardOverview'
    if name == 'Users': name = 'UsersManagement'
    if name == 'Courses': name = 'CoursesManagement'
    if name == 'Revenues': name = 'RevenuesManagement'
    if name == 'Orders': name = 'OrdersManagement'
    if name == 'Withdrawals': name = 'WithdrawalsManagement'
    
    component_code = f"import React from 'react';\n\nexport default function {name}() {{\n  return (\n    <>\n      {jsx}\n    </>\n  );\n}}\n"
    with open(f"{out_dir}/{name}.tsx", 'w', encoding='utf-8') as f:
        f.write(component_code)

print("Done")
