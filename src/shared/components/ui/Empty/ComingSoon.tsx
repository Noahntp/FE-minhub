import React from 'react';
export const ComingSoon: React.FC<{ title?: string }> = ({ title = 'Coming Soon' }) => (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <h3 className="text-xl font-medium text-gray-800">{title}</h3>
    </div>
);
