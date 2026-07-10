const fs = require('fs');
const path = 'c:/DATN/MindHub-Frontend/src/components/InstructorDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove analytics from activeTab type
content = content.replace(
  /'overview' \| 'analytics' \| 'revenue' \| 'transactions' \| 'courses'/g,
  "'overview' | 'revenue' | 'transactions' | 'courses'"
);

// Remove the Phân Tích KPIs button
const buttonRegex = /<button\s+onClick=\{\(\) => setActiveTab\('analytics'\)\}\s+className=\{`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all \$\{activeTab === 'analytics' \? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'\}`\}\s+>\s+<BarChart2 className="w-4 h-4 text-stone-700" \/> Phân Tích KPIs\s+<\/button>/g;
content = content.replace(buttonRegex, '');

// Remove the ANALYTICS TAB SUBPANELS content block
const contentRegex = /\{\/\* ANALYTICS TAB SUBPANELS \*\/\}[\s\S]*?(?=\{\/\* REVENUE TAB \*\/|\{\/\* LIST OF COURSES TAB)/;
content = content.replace(contentRegex, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Removed analytics successfully!');
