import glob
import os

files = glob.glob("/home/helios29123/src/MindHub/MindHub-Frontend/src/components/Admin/pages/*.tsx")
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix the corrupted import
    content = content.replace("import React, { useEffect } ; from 'react';", "import React, { useEffect } from 'react';")
    content = content.replace("import React, { useState, useEffect } ; from 'react';", "import React, { useState, useEffect } from 'react';")
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed imports")
