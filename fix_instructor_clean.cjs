const fs = require('fs');
const path = 'c:/DATN/MindHub-Frontend/src/components/InstructorDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove InstructorPackagesTab and InstructorWithdrawal imports
content = content.replace(/import \{ InstructorWithdrawal \} from '\.\/InstructorWithdrawal';\n/g, '');
content = content.replace(/import \{ InstructorPackagesTab \} from '\.\/InstructorPackagesTab';\n/g, '');

// 2. Add TransactionManagement import
if (!content.includes('import TransactionManagement from')) {
    content = content.replace(/import \{ InstructorRevenueChart \} from '\.\/InstructorRevenueChart';/, "import { InstructorRevenueChart } from './InstructorRevenueChart';\nimport TransactionManagement from './InstructorDashboard/TransactionManagement';");
}

// 3. Remove fetchQuota, getCoursePackages
content = content.replace(/\s*const fetchQuota = \(\) => \{[\s\S]*?\.finally\(\(\) => setQuotaLoading\(false\)\);\s*\};\s*useEffect\(\(\) => \{\s*fetchQuota\(\);\s*ApiService\.getCoursePackages\(\)\.then\(setPackages\)\.catch\(console\.error\);\s*\}, \[currentUser\.id\]\);/g, '');

// 4. Remove quota from startBuilderForCreate
content = content.replace(/if \(quota\.remaining <= 0\) \{\s*alert\('Bạn đã hết lượt tạo khóa học\. Vui lòng mua Gói Khởi Tạo Khóa Học để tiếp tục\.'\);\s*setActiveTab\('packages'\);\s*return;\s*\}/g, '');
content = content.replace(/\/\/ Refresh lại quota sau khi push course\s*fetchQuota\(\);/g, '');

// 5. Remove getInstructorBalance
content = content.replace(/\s*\/\/ Fetch new widgets stats\s*ApiService\.getInstructorBalance\(currentUser\.id\)\.then\(res => \{\s*setOverviewBalance\(res\.withdrawableBalance\);\s*\}\)\.catch\(err => console\.error\("Error fetching balance", err\)\);/g, '');

// 6. Fix tab payout -> transactions
content = content.replace(/onClick=\{\(\) => \{ setActiveTab\('payout'\); \}\}/g, "onClick={() => { setActiveTab('transactions'); }}");

// 7. Remove payout tab render
content = content.replace(/\{\/\* WITHDRAWAL TAB \*\/\}\s*\{activeTab === 'payout' && \(\s*<InstructorWithdrawal instructorId=\{currentUser\?\.id\} \/>\s*\)\}/g, '');

// 8. Add TransactionManagement tab render
const transactionTab = `
        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <TransactionManagement instructorId={currentUser?.id || ''} />
        )}
`;
content = content.replace(/\{\/\* STUDENTS MANAGEMENT DASHBOARD \*\/\}/g, transactionTab + '\n        {/* STUDENTS MANAGEMENT DASHBOARD */}');

// 9. Remove packages tab render
content = content.replace(/\{\/\* TAB 8: PACKAGES \*\/\}\s*\{activeTab === 'packages' && \(\s*<InstructorPackagesTab[\s\S]*?\/>\s*\)\}/g, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed InstructorDashboard cleanly!');
