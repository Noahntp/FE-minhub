import React from 'react';
export const ErrorState: React.FC<{ title?: string; message?: string }> = ({ title = 'Error', message = 'Failed' }) => (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-100 rounded-lg">
      <h3 className="text-lg font-semibold text-red-800">{title}</h3>
      <p className="mt-2 text-red-600 text-center">{message}</p>
    </div>
);
