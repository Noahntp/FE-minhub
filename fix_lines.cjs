const fs = require('fs');
const path = 'c:/DATN/MindHub-Frontend/src/components/InstructorDashboard.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Find the line index of "      })" and "  }, [currentUser.id]);"
let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('      })') && lines[i+1].includes('      .finally(() => setQuotaLoading(false));')) {
    startIndex = i;
  }
  if (lines[i].includes('  }, [currentUser.id]);') && startIndex !== -1 && endIndex === -1) {
    endIndex = i;
  }
}

if (startIndex !== -1 && endIndex !== -1) {
  lines.splice(startIndex, endIndex - startIndex + 1);
  fs.writeFileSync(path, lines.join('\n'), 'utf8');
  console.log('Fixed lines!');
} else {
  console.log('Could not find lines');
}

// Also fix the EOF issue: `InstructorDashboard.tsx(2306,1): error TS1128: Declaration or statement expected.`
let content = fs.readFileSync(path, 'utf8');
if (content.endsWith('}')) {
  // Check if there's an extra bracket or missing bracket
}
