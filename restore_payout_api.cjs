const fs = require('fs');
const path = 'c:/DATN/MindHub-Frontend/src/services/api.ts';
let content = fs.readFileSync(path, 'utf8');

const additionalMethods = `
  // ================= PAYOUT & BALANCE API =================
  async getInstructorBalance(instructorId: string): Promise<any> {
    devLog('Instructor', 'Get balance');
    if (config.mode === 'api') {
      return apiFetch<any>(\`/instructor/balance\`);
    }
    return { withdrawableBalance: 15500000, pendingBalance: 2500000 };
  },

  async getInstructorPayoutAccount(instructorId: string): Promise<any> {
    devLog('Instructor', 'Get payout account');
    if (config.mode === 'api') {
      return apiFetch<any>(\`/instructor/payout-account\`);
    }
    return { type: 'bank_transfer', accountName: 'NGUYEN VAN A', accountNumber: '123456789', bankName: 'Vietcombank', branch: 'HCM' };
  },

  async updateInstructorPayoutAccount(instructorId: string, payload: any): Promise<any> {
    devLog('Instructor', 'Update payout account', payload);
    if (config.mode === 'api') {
      return apiFetch<any>(\`/instructor/payout-account\`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    }
    return { success: true, message: 'Đã cập nhật thông tin nhận tiền' };
  },

  async getInstructorWithdrawals(instructorId: string): Promise<any[]> {
    devLog('Instructor', 'Get withdrawals');
    if (config.mode === 'api') {
      return apiFetch<any[]>(\`/instructor/withdrawals\`);
    }
    return [
      { id: 'w1', instructorId, amount: 5000000, status: 'completed', requestedAt: new Date(Date.now() - 86400000 * 5).toISOString(), processedAt: new Date(Date.now() - 86400000 * 4).toISOString(), notes: 'Thanh toán tuần 1', payoutMethod: { type: 'bank_transfer', bankName: 'VCB' } },
      { id: 'w2', instructorId, amount: 2000000, status: 'pending', requestedAt: new Date().toISOString(), payoutMethod: { type: 'bank_transfer', bankName: 'VCB' } }
    ];
  },

  async createInstructorWithdrawal(instructorId: string, amount: number): Promise<any> {
    devLog('Instructor', 'Create withdrawal', { amount });
    if (config.mode === 'api') {
      return apiFetch<any>(\`/instructor/withdrawals\`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
    }
    return { success: true, message: 'Đã tạo yêu cầu rút tiền' };
  },
`;

if (!content.includes('getInstructorWithdrawals')) {
    content = content.replace('// ================= TRANSACTIONS API =================', additionalMethods + '\n  // ================= TRANSACTIONS API =================');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Restored payout APIs!');
