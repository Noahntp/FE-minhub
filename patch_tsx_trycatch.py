import glob

files = glob.glob("/home/helios29123/src/MindHub/MindHub-Frontend/src/components/Admin/pages/*.tsx")
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the exact string we injected:
    #   useEffect(() => {
    #     initPage();
    #   }, []);
    
    old_code = """  useEffect(() => {
    initPage();
  }, []);"""
  
    new_code = """  useEffect(() => {
    try {
      initPage();
    } catch (err) {
      console.error('Error initializing vanilla JS:', err);
    }
  }, []);"""
  
    if old_code in content:
        content = content.replace(old_code, new_code)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
            print(f"Patched {file}")

print("Done patching try-catch")
