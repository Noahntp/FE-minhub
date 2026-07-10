const fs = require('fs');
const path = 'c:/DATN/MindHub-Frontend/src/components/AdminDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove payoutRequests states and effects
content = content.replace(/const \[payoutRequests, setPayoutRequests\] = useState<any\[\]>\(\[\]\);[\s\S]*?fetchPayouts\(\);\n  \}, \[\]\);/m, '');

// Remove coursePackages states and effects
content = content.replace(/const \[coursePackages, setCoursePackages\] = useState<any\[\]>\(\[\]\);[\s\S]*?fetchPackages\(\);\n  \}, \[\]\);/m, '');

// Remove payout handlers
content = content.replace(/const onApprovePayout = async \(id: string\) => \{[\s\S]*?catch \(err\) \{\n      console\.error\(err\);\n    \}\n  \};/g, '');

// Remove activeTab type for packages and payouts
content = content.replace(/'payouts_requests' \| 'packages_management' \| /g, '');
content = content.replace(/ \| 'payouts_requests' \| 'packages_management'/g, '');

// Remove Total Payout Completed
content = content.replace(/const totalPayoutCompleted = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[payoutRequests\]\);/m, '');

// Remove sidebar buttons
content = content.replace(/<button\s*onClick=\{\(\) => setActiveTab\('packages_management'\)\}[\s\S]*?Gói Tạo Khóa Học[\s\S]*?<\/button>/m, '');
content = content.replace(/<button\s*onClick=\{\(\) => setActiveTab\('payouts_requests'\)\}[\s\S]*?Duyệt Đơn Rút tiền[\s\S]*?<\/button>/m, '');

// Remove tab content for packages_management
content = content.replace(/\{\/\* TAB: PACKAGES MANAGEMENT \*\/\}\s*\{activeTab === 'packages_management' && \([\s\S]*?\{/\* TAB 6: PROCESSING INSTRUCTORS PAYOUTS CLAIMS \*\/\}/m, '{/* TAB 6: PROCESSING INSTRUCTORS PAYOUTS CLAIMS */}');

// Remove tab content for payouts_requests
content = content.replace(/\{\/\* TAB 6: PROCESSING INSTRUCTORS PAYOUTS CLAIMS \*\/\}\s*\{activeTab === 'payouts_requests' && \([\s\S]*?\}\s*\)\}\s*<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/m, '</div>\n          </div>\n        )}\n\n      </div>\n    </div>\n  </div>\n</div>\n  );\n}');

fs.writeFileSync(path, content, 'utf8');
console.log('Admin cleanup completed!');
