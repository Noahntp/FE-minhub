const fs = require('fs');
const path = 'c:/DATN/MindHub-Frontend/src/components/InstructorDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Use simple replaces to fix the leftover codes without regex where possible.

content = content.replace(/\s*\})\s*\.finally\(\(\) => setQuotaLoading\(false\)\);\s*\};\s*useEffect\(\(\) => \{\s*fetchQuota\(\);\s*ApiService\.getCoursePackages\(\)\.then\(setPackages\)\.catch\(console\.error\);\s*\}, \[currentUser\.id\]\);/g, '');

content = content.replace(/if \(quota\.remaining <= 0\) \{\s*alert\('Bạn đã hết lượt tạo khóa học\. Vui lòng mua Gói Khởi Tạo Khóa Học để tiếp tục\.'\);\s*setActiveTab\('packages'\);\s*return;\s*\}/g, '');

content = content.replace(/\/\/ Refresh lại quota sau khi push course\s*fetchQuota\(\);/g, '');

content = content.replace(/const handleRequestPayout = \(e: React\.FormEvent\) => \{\s*e\.preventDefault\(\);\s*alert\('Hồ sơ yêu cầu rút tiền đã khởi tạo thành công! Admin MindHub đang tiến hành kiểm tra giao dịch\.'\);\s*\};/g, '');

content = content.replace(/onClick=\{\(\) => \{ setActiveTab\('payout'\); \}\}/g, "onClick={() => { setActiveTab('transactions'); }}");

content = content.replace(/\{\/\* WITHDRAWAL TAB \*\/\}\s*\{activeTab === 'payout' && \([\s\S]*?<InstructorWithdrawal instructorId=\{currentUser\?\.id\} \/>\s*\)\}/g, '');

content = content.replace(/\{\/\* TAB 8: PACKAGES \*\/\}\s*\{activeTab === 'packages' && \([\s\S]*?<InstructorPackagesTab\s*currentUser=\{currentUser\}\s*quota=\{quota\}\s*quotaLoading=\{quotaLoading\}\s*quotaError=\{quotaError\}\s*fetchQuota=\{fetchQuota\}\s*\/>\s*\)\}/g, '');

content = content.replace(/import \{ InstructorWithdrawal \} from '\.\/InstructorWithdrawal';/g, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed InstructorDashboard');
