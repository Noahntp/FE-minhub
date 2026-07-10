const fs = require('fs');
const path = 'c:/DATN/MindHub-Frontend/src/components/InstructorDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove InstructorWithdrawal import
content = content.replace(/import \{ InstructorWithdrawal \} from '\.\/InstructorWithdrawal';\n/g, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed InstructorWithdrawal import!');
