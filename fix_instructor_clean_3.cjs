const fs = require('fs');
const path = 'c:/DATN/MindHub-Frontend/src/components/InstructorDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove InstructorWithdrawal import
content = content.replace(/import \{ InstructorWithdrawal \} from '\.\/InstructorWithdrawal';\n/g, '');

// 2. Fix getInstructorCreditTransactions -> getInstructorTransactions
content = content.replace(/getInstructorCreditTransactions/g, 'getInstructorTransactions');

// 3. Fix payout and packages tabs
content = content.replace(/'payout'/g, "'transactions'");
content = content.replace(/'packages'/g, "'transactions'");

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed remaining errors!');
