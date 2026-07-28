export interface WithdrawalRequestMock {
  id: string;
  createdAt: string;
  amount: number;
  accountNumberSnapshot: string;
  status: 'pending' | 'completed' | 'rejected';
  rejectedReason: string;
}

export interface InstructorWithdrawMockData {
  balance: {
    withdrawableBalance: number;
    totalPendingWithdrawal: number;
    totalWithdrawn: number;
    totalRejected: number;
  };
  payoutAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    status: string;
    verifiedLast: string;
  };
  withdrawals: WithdrawalRequestMock[];
}

export const INSTRUCTOR_WITHDRAW_MOCK: InstructorWithdrawMockData = {
  balance: {
    withdrawableBalance: 12450000,
    totalPendingWithdrawal: 3200000,
    totalWithdrawn: 28750000,
    totalRejected: 1000000
  },
  payoutAccount: {
    bankName: "Techcombank - Ngân hàng TMCP Kỹ thương Việt Nam",
    accountNumber: "1903 **** **** 1234",
    accountName: "NGUYỄN VĂN A",
    status: "verified",
    verifiedLast: "20/05/2024"
  },
  withdrawals: [
    {
      id: "w-01",
      createdAt: "2024-05-20T14:32:00.000Z",
      amount: 3200000,
      accountNumberSnapshot: "Techcombank 1903 **** **** 1234",
      status: "pending",
      rejectedReason: "-"
    },
    {
      id: "w-02",
      createdAt: "2024-04-18T09:15:00.000Z",
      amount: 5000000,
      accountNumberSnapshot: "Techcombank 1903 **** **** 1234",
      status: "completed",
      rejectedReason: "Đã chuyển ngày 08/05/2024"
    },
    {
      id: "w-03",
      createdAt: "2024-03-15T11:20:00.000Z",
      amount: 4500000,
      accountNumberSnapshot: "Techcombank 1903 **** **** 1234",
      status: "completed",
      rejectedReason: "Đã chuyển ngày 05/04/2024"
    },
    {
      id: "w-04",
      createdAt: "2024-02-16T16:45:00.000Z",
      amount: 5000000,
      accountNumberSnapshot: "Techcombank 1903 **** **** 1234",
      status: "rejected",
      rejectedReason: "Sai thông tin tài khoản nhận tiền"
    },
    {
      id: "w-05",
      createdAt: "2024-01-18T10:05:00.000Z",
      amount: 6000000,
      accountNumberSnapshot: "Techcombank 1903 **** **** 1234",
      status: "completed",
      rejectedReason: "Đã chuyển ngày 07/02/2024"
    }
  ]
};
