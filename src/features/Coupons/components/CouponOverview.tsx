import React from 'react';
import { Tag, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface Props {
  stats: {
    total: number;
    active: number;
    inactive: number;
    expired: number;
    usedUp: number;
  };
  onFilter: (status: string | null) => void;
}

export const CouponOverview: React.FC<Props> = ({ stats, onFilter }) => {
  const cards = [
    { title: 'Tổng mã', value: stats.total, icon: Tag, color: 'text-blue-600', bg: 'bg-blue-100', filter: null },
    { title: 'Đang hoạt động', value: stats.active, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', filter: 'active' },
    { title: 'Đã tắt', value: stats.inactive, icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100', filter: 'inactive' },
    { title: 'Hết hạn', value: stats.expired, icon: Clock, color: 'text-red-600', bg: 'bg-red-100', filter: 'expired' },
    { title: 'Hết lượt dùng', value: stats.usedUp, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', filter: 'used_up' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            onClick={() => onFilter(card.filter)}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all flex items-center gap-4"
          >
            <div className={`p-3 rounded-lg ${card.bg}`}>
              <Icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};
