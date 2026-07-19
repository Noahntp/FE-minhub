import re

with open("src/OldApp.bak", "r") as f:
    old_content = f.read()

# Extract the header from old_content
match = re.search(r"(<header className=\"bg-white border-b border-brand-light-active.*?</header>)", old_content, re.DOTALL)
if match:
    header_jsx = match.group(1)
    
    # We will replace the return statement of src/layouts/Navbar.tsx with this header_jsx
    with open("src/layouts/Navbar.tsx", "r") as f:
        navbar_content = f.read()
    
    # Replace the return statement
    navbar_content = re.sub(r"return \(\n\s*<header className=\"bg-white border-b border-stone-200.*?</header>\n\s*\);", f"return (\n    {header_jsx}\n  );", navbar_content, flags=re.DOTALL)
    
    with open("src/layouts/Navbar.tsx", "w") as f:
        f.write(navbar_content)
    
    print("Extracted header JSX to Navbar.tsx")
else:
    print("Could not find header JSX")
