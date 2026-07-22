import React from 'react';
export const NoResults: React.FC<{ query?: string }> = ({ query }) => (
    <div className="py-16 text-center">
      <h3 className="text-lg font-medium text-gray-900">No results found</h3>
    </div>
);
