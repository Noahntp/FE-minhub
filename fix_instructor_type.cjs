const fs = require('fs');
const path = 'c:/DATN/MindHub-Frontend/src/components/InstructorDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix type error for SetStateAction
content = content.replace(/useState<'overview' \| 'analytics' \| 'revenue' \| 'courses' \| 'grading' \| 'qa' \| 'builder' \| 'students' \| 'security' \| 'coupons'>/g, 
"useState<'overview' | 'analytics' | 'revenue' | 'transactions' | 'courses' | 'grading' | 'qa' | 'builder' | 'students' | 'security' | 'coupons'>");

content = content.replace(/useState<\'overview\' \| \'analytics\' \| \'revenue\' \| \'courses\' \| \'grading\' \| \'qa\' \| \'builder\' \| \'students\' \| \'security\' \| \'coupons\'>/g, 
"useState<'overview' | 'analytics' | 'revenue' | 'transactions' | 'courses' | 'grading' | 'qa' | 'builder' | 'students' | 'security' | 'coupons'>");

content = content.replace(/const \[activeTab, setActiveTab\] = useState<\'overview\' \| \'analytics\' \| \'revenue\' \| \'courses\' \| \'grading\' \| \'qa\' \| \'builder\' \| \'students\' \| \'security\' \| \'coupons\'>/g, 
"const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'revenue' | 'transactions' | 'courses' | 'grading' | 'qa' | 'builder' | 'students' | 'security' | 'coupons'>");

content = content.replace(/getInstructorTransactions\(currentUser.id\)/g, "getInstructorTransactions(currentUser.id, {})");

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed activeTab type!');
