const fs = require('fs');
const path = 'c:/DATN/MindHub-Frontend/src/components/InstructorDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// State variables for quota and packages
content = content.replace(/const \[quota, setQuota\] = useState.*?;\n/g, '');
content = content.replace(/const \[quotaLoading, setQuotaLoading\] = useState.*?;\n/g, '');
content = content.replace(/const \[quotaError, setQuotaError\] = useState.*?;\n/g, '');
content = content.replace(/const \[packages, setPackages\] = useState.*?;\n/g, '');

// Tabs type fix (remove 'payout' and 'packages', add 'transactions')
content = content.replace(/\| 'payout'/g, '');
content = content.replace(/'payout' \|/g, '');
content = content.replace(/\| 'packages'/g, '');
content = content.replace(/'packages' \|/g, '');

// If 'transactions' is not in the activeTab, add it.
if (!content.includes("'transactions'")) {
    content = content.replace(/const \[activeTab, setActiveTab\] = useState<\'overview\'/g, "const [activeTab, setActiveTab] = useState<'overview' | 'transactions'");
}

fs.writeFileSync(path, content, 'utf8');
console.log('Appended fixes!');
