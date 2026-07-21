import glob
import re

files = glob.glob("/home/helios29123/src/MindHub/MindHub-Frontend/src/components/Admin/pages/*.tsx")
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Generic fix for all broken React imports:
    content = re.sub(r'import React.*?from \'react\';', "import React, { useState, useEffect } from 'react';", content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed imports 2")
