import React from 'react';
export const NoData: React.FC<{ title?: string; description?: string }> = ({ title = 'No Data', description = 'None' }) => (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-gray-500">{description}</p>
    </div>
);
