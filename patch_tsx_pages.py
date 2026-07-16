import glob
import re
import os

files = glob.glob("/home/helios29123/src/MindHub/MindHub-Frontend/src/components/Admin/pages/*.tsx")
for file in files:
    filename = os.path.basename(file)
    basename = filename.replace('.tsx', '')
    
    # Map React component names back to JS file names
    # e.g. CategoriesManagement -> categories.js
    # UsersManagement -> users.js
    # DashboardOverview -> dashboard.js
    # CourseReviews -> course-reviews.js
    # InstructorUpgrades -> instructor-upgrades.js
    
    js_filename = basename.lower().replace('management', '').replace('overview', '')
    if js_filename == 'coursereviews': js_filename = 'course-reviews'
    if js_filename == 'instructorupgrades': js_filename = 'instructor-upgrades'
    if js_filename == 'payoutaccounts': js_filename = 'payout-accounts'
    
    if js_filename == 'categories': js_filename = 'categories'
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add useEffect to React import
    if 'useEffect' not in content:
        content = re.sub(r'import React(?:, \{.*?\})? from \'react\';', lambda m: m.group(0).replace('from \'react\'', '').replace('React', 'React, { useEffect }') + " from 'react';", content, count=1)
        # fix if it became import React, { useState }, { useEffect } ... just a simple replacement is safer
        # Let's do it simply:
        if 'useState' in content:
            content = content.replace('import React, { useState } from \'react\';', 'import React, { useState, useEffect } from \'react\';')
        else:
            content = content.replace('import React from \'react\';', 'import React, { useEffect } from \'react\';')
    
    # 2. Add import { initPage }
    import_stmt = f"\nimport {{ initPage }} from '../../../assets/js/pages/{js_filename}.js';\n"
    if import_stmt not in content:
        content = content.replace("import React", import_stmt + "import React")

    # 3. Add useEffect hook inside component
    hook = "  useEffect(() => {\n    initPage();\n  }, []);\n"
    if 'initPage();' not in content:
        content = re.sub(r'(export default function \w+\(\) \{\n)', r'\1' + hook, content, count=1)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done")
