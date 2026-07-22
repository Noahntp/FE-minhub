import React from 'react';
export const LoadingPage: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        <h2 className="mt-6 text-xl font-semibold text-gray-700">Loading Content</h2>
      </div>
    </div>
);
