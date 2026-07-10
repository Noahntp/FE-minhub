const fs = require('fs');
const path = 'c:/DATN/MindHub-Frontend/src/components/InstructorDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove InstructorPackagesTab
content = content.replace(/function InstructorPackagesTab\([\s\S]*?function LaptopIcon/m, 'function LaptopIcon');

// Update activeTab type
content = content.replace(/useState<'overview' \| 'analytics' \| 'revenue' \| 'courses' \| 'grading' \| 'payout' \| 'qa' \| 'builder' \| 'students' \| 'security' \| 'packages' \| 'coupons'>\('overview'\);/, "useState<'overview' | 'analytics' | 'revenue' | 'transactions' | 'courses' | 'grading' | 'qa' | 'builder' | 'students' | 'security' | 'coupons'>('overview');");

// Update Tabs comment
content = content.replace(/\/\/ Tabs: 'overview'.*/, "// Tabs: 'overview' | 'analytics' | 'revenue' | 'transactions' | 'courses' | 'grading' | 'qa' | 'builder' | 'students' | 'security' | 'coupons'");

// Remove quota, packages states
content = content.replace(/const \[quota, setQuota\] =[\s\S]*?setPackages\] = useState<any\[\]>\(\[\]\);/m, '');

// Remove fetchQuota and useEffect
content = content.replace(/const fetchQuota = \(\) => {[\s\S]*?catch\(console\.error\);\n  \}, \[currentUser\.id\]\);/m, '');

// Remove MOCK TRANSITIONS & HISTORY TRACERS
content = content.replace(/\/\/ --- MOCK TRANSITIONS & HISTORY TRACERS ---[\s\S]*?setIsUpdatingBank\] = useState<boolean>\(false\);/m, '');

// Remove handleRequestPayout
content = content.replace(/const handleRequestPayout = \([\s\S]*?\}\n    \}, 1500\);\n  \};/m, '');

// Replace sidebar menus
const sidebarRegex = /<a[\s\S]*?onClick=\{\(\) => setActiveTab\('payout'\)\}[\s\S]*?Yêu cầu Rút tiền\s*<\/a>\s*<a[\s\S]*?onClick=\{\(\) => setActiveTab\('packages'\)\}[\s\S]*?Gói Tạo Khóa Học\s*<\/a>/m;
const transactionMenu = `
          <a 
            href="#transactions"
            onClick={(e) => { e.preventDefault(); setActiveTab('transactions'); }}
            className={\`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all \${activeTab === 'transactions' ? 'bg-brand-normal text-white shadow-brand/30 shadow-lg' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'}\`}
          >
            <Activity className={\`w-5 h-5 \${activeTab === 'transactions' ? 'text-white' : 'text-stone-400'}\`} />
            Lịch sử giao dịch
          </a>
`;
content = content.replace(sidebarRegex, transactionMenu);

// Replace mobile tab menus
const mobileSidebarRegex = /<button\s*onClick=\{\(\) => setActiveTab\('payout'\)\}[\s\S]*?Yêu cầu Rút tiền\s*<\/button>\s*<button\s*onClick=\{\(\) => setActiveTab\('packages'\)\}[\s\S]*?Gói Tạo Khóa Học\s*<\/button>/m;
const mobileTransactionMenu = `
          <button 
            onClick={() => setActiveTab('transactions')}
            className={\`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all \${activeTab === 'transactions' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}\`}
          >
            <Activity className="w-4 h-4" /> Lịch sử Giao dịch
          </button>
`;
content = content.replace(mobileSidebarRegex, mobileTransactionMenu);

// Remove the payout and packages tab content blocks
const tabContentRegex = /\{\/\* TAB 7: PAYOUT \*\/\}\s*\{activeTab === 'payout' && \([\s\S]*?<InstructorWithdrawal instructorId=\{currentUser\?\.id\} \/>\s*\)\}\s*\{\/\* TAB 8: PACKAGES \*\/\}\s*\{activeTab === 'packages' && \([\s\S]*?<InstructorPackagesTab[\s\S]*?fetchQuota=\{fetchQuota\}\s*\/>\s*\)\}/m;
const transactionContent = `
        {/* TAB 7: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div>
             <TransactionManagement instructorId={currentUser.id} />
          </div>
        )}
`;
content = content.replace(tabContentRegex, transactionContent);

// Add import for TransactionManagement at top
content = content.replace(/import \{ InstructorRevenueChart \} from '\.\/InstructorRevenueChart';/, "import { InstructorRevenueChart } from './InstructorRevenueChart';\nimport TransactionManagement from './TransactionManagement';");

fs.writeFileSync(path, content, 'utf8');
console.log('Cleanup completed!');
