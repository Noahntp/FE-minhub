const fs = require('fs');
const path = 'c:/DATN/MindHub-Frontend/src/services/api.ts';
let content = fs.readFileSync(path, 'utf8');

const regex = /\/\*\* GET \/packages \*\/[\s\S]*?\/\/ ================= Q&A API =================/m;

const replacement = `// ================= TRANSACTIONS API =================
  async getInstructorTransactions(instructorId: string, params: any): Promise<any> {
    devLog('Instructor', 'Get transaction history');
    const query = new URLSearchParams(params).toString();
    if (config.mode === 'api') {
      return apiFetch<any>(\`/instructor/transactions?\${query}\`);
    }
    return { data: { stats: { total: 0, success: 0, pending: 0, failed: 0, total_revenue: 0 }, list: { data: [], total: 0, last_page: 1 } } };
  },

  async getInstructorTransactionDetails(transactionId: string | number): Promise<any> {
    devLog('Instructor', 'Get transaction details');
    if (config.mode === 'api') {
      return apiFetch<any>(\`/instructor/transactions/\${transactionId}/details\`);
    }
    return { data: null };
  },

  // ================= Q&A API =================`;

content = content.replace(regex, replacement);

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced successfully');
