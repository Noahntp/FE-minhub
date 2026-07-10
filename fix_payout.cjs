const fs = require('fs');
const path = 'c:/DATN/MindHub-Frontend/src/components/InstructorDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add InstructorWithdrawal import
if (!content.includes("import { InstructorWithdrawal }")) {
    content = content.replace(
        "import TransactionManagement from './InstructorDashboard/TransactionManagement';",
        "import TransactionManagement from './InstructorDashboard/TransactionManagement';\nimport { InstructorWithdrawal } from './InstructorWithdrawal';"
    );
}

// 2. Add 'payout' to activeTab type
content = content.replace(
    /useState<'overview' \| 'analytics' \| 'revenue' \| 'transactions' \| 'courses' \| 'grading'  \| 'qa' \| 'builder' \| 'students' \| 'security'  \| 'coupons'>/g,
    "useState<'overview' | 'analytics' | 'revenue' | 'transactions' | 'courses' | 'grading'  | 'qa' | 'builder' | 'students' | 'security'  | 'coupons' | 'payout'>"
);

// 3. Fix the buttons in Sidebar
// First, replace the "Yêu cầu Rút tiền" block to use 'payout'
content = content.replace(
    /<button\s+onClick=\{\(\) => setActiveTab\('transactions'\)\}\s+className=\{`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all \$\{activeTab === 'transactions' \? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'\}`\}\s+>\s+<DollarSign className="w-4 h-4 text-stone-700" \/> Yêu cầu Rút tiền\s+<\/button>/,
    `<button 
            onClick={() => setActiveTab('payout')}
            className={\`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all \${activeTab === 'payout' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}\`}
          >
            <DollarSign className="w-4 h-4 text-stone-700" /> Yêu cầu Rút tiền
          </button>`
);

// Second, replace "Gói Tạo Khóa Học" with "Lịch sử Giao dịch"
content = content.replace(
    /<button\s+onClick=\{\(\) => setActiveTab\('transactions'\)\}\s+className=\{`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all \$\{activeTab === 'transactions' \? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'\}`\}\s+>\s+<Sparkles className="w-4 h-4 text-stone-700" \/> Gói Tạo Khóa Học\s+<\/button>/,
    `<button 
            onClick={() => setActiveTab('transactions')}
            className={\`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all \${activeTab === 'transactions' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}\`}
          >
            <Activity className="w-4 h-4 text-stone-700" /> Lịch sử Giao dịch
          </button>`
);

// 4. Add the rendering logic for payout tab at the end of the file.
// We will insert it before {/* TRANSACTIONS TAB */}
if (!content.includes("{activeTab === 'payout' && (")) {
    content = content.replace(
        /\{\/\* TRANSACTIONS TAB \*\/\}/,
        `{/* WITHDRAWAL TAB */}
        {activeTab === 'payout' && (
          <InstructorWithdrawal instructorId={currentUser?.id} />
        )}

        {/* TRANSACTIONS TAB */}`
    );
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed buttons and layout!');
