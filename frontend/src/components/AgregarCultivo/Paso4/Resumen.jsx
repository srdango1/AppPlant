import React from 'react';

function SummaryItem({ label, value }) {
  return (
    <div className="flex flex-col gap-1 py-2">
      <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">{label}</p>
      <p className="text-[#333333] dark:text-white text-sm font-medium leading-normal">{value}</p>
    </div>
  );
}

export default SummaryItem;