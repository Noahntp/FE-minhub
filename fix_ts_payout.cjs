const fs = require('fs');
const path = 'c:/DATN/MindHub-Frontend/src/services/api.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `async getInstructorWithdrawals(instructorId: string): Promise<any[]> {
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
  }`,
  `async getInstructorWithdrawals(instructorId: string, params?: any): Promise<{ data: any[], meta: any }> {
    devLog('Instructor', 'Get withdrawals');
    const query = new URLSearchParams(params).toString();
    if (config.mode === 'api') {
      return apiFetch<{ data: any[], meta: any }>(\`/instructor/withdrawals?\${query}\`);
    }
    return {
      data: [
        { id: 'w1', instructorId, amount: 5000000, status: 'completed', requestedAt: new Date(Date.now() - 86400000 * 5).toISOString(), processedAt: new Date(Date.now() - 86400000 * 4).toISOString(), notes: 'Thanh toán tuần 1', payoutMethod: { type: 'bank_transfer', bankName: 'VCB' } },
        { id: 'w2', instructorId, amount: 2000000, status: 'pending', requestedAt: new Date().toISOString(), payoutMethod: { type: 'bank_transfer', bankName: 'VCB' } }
      ],
      meta: { current_page: 1, last_page: 1, total: 2 }
    };
  },

  async createInstructorWithdrawal(instructorId: string, payload: any): Promise<any> {
    devLog('Instructor', 'Create withdrawal', payload);
    if (config.mode === 'api') {
      return apiFetch<any>(\`/instructor/withdrawals\`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return { success: true, message: 'Đã tạo yêu cầu rút tiền' };
  }`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed typescript signature in api.ts!');
