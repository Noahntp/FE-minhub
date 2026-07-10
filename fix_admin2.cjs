const fs = require('fs');
const path = 'c:/DATN/MindHub-Frontend/src/components/AdminDashboard.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

let packagesStart = -1;
let packagesEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("{/* TAB: PACKAGES MANAGEMENT */}")) {
    packagesStart = i;
    break;
  }
}

if (packagesStart !== -1) {
  // we know payout starts at line 3613 so let's find the end of payouts_requests
  let nestedDivs = 0;
  let foundStart = false;
  for (let i = packagesStart; i < lines.length; i++) {
    if (lines[i].includes("{activeTab === 'packages_management' && (")) {
      foundStart = true;
    }
    
    // Just find the end of the main div for AdminDashboard?
    // Actually, AdminDashboard is huge.
  }
}

// Just regex replace in code string
let content = fs.readFileSync(path, 'utf8');

// The best way is to just write a simple replacer.
content = content.replace(/\{\/\* TAB: PACKAGES MANAGEMENT \*\/\}[\s\S]*?\{\/\* TAB 6: PROCESSING INSTRUCTORS PAYOUTS CLAIMS \*\/\}/, '{/* TAB 6: PROCESSING INSTRUCTORS PAYOUTS CLAIMS */}');

// The payout tab is from {activeTab === 'payouts_requests' && ... until the next TAB or the end of the return statement.
// Let's see what's after TAB 6
content = content.replace(/\{\/\* TAB 6: PROCESSING INSTRUCTORS PAYOUTS CLAIMS \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/, '      </div>\n    </div>\n  </div>\n</div>\n  );\n}');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed AdminDashboard packages & payout tabs');
