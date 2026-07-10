const fs = require('fs');
const path = 'c:/DATN/MindHub-Frontend/src/components/InstructorDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix TransactionManagement import
content = content.replace(
  "import TransactionManagement from './TransactionManagement';",
  "import TransactionManagement from './InstructorDashboard/TransactionManagement';"
);

// 2. Add payout to activeTab type
content = content.replace(
  /useState<'overview' \| 'revenue' \| 'transactions' \| 'courses' \| 'grading' \| 'qa' \| 'builder' \| 'students' \| 'security' \| 'coupons'>/g,
  "useState<'overview' | 'revenue' | 'transactions' | 'courses' | 'grading' | 'qa' | 'builder' | 'students' | 'security' | 'coupons' | 'payout'>"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed final types!');
