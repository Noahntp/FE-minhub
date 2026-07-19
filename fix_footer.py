import re

with open("src/OldApp.bak", "r") as f:
    old_content = f.read()

match = re.search(r"(<footer className=\"bg-\[#1c1410\].*?</footer+>)", old_content, re.DOTALL)
if match:
    footer_jsx = match.group(1)
    
    with open("src/components/FooterLegal.tsx", "r") as f:
        footer_content = f.read()
    
    # We want to replace the return statement of FooterLegal.tsx
    # FooterLegal has props `onClose` which might be used inside it, but the old footer doesn't have it.
    footer_content = re.sub(r"return \(\n\s*<footer className=\"bg-white border-t border-stone-200.*?</footer+>\n\s*\);", f"return (\n    {footer_jsx}\n  );", footer_content, flags=re.DOTALL)
    
    with open("src/components/FooterLegal.tsx", "w") as f:
        f.write(footer_content)
    print("Extracted footer JSX to FooterLegal.tsx")
else:
    print("Could not find footer JSX")
