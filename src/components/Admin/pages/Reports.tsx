
import { initPage } from '../../../assets/js/pages/reports.js';
import React, { useState, useEffect } from 'react';

export default function Reports() {
  useEffect(() => {
    try {
      initPage();
    } catch (err) {
      console.error('Error initializing vanilla JS:', err);
    }
  }, []);
  return (
    <>
      <header className="mb-8">
                    <p className="text-sm text-mid-gray">
                        MindHub Admin
                    </p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                        Báo cáo và thống kê
                    </h1>
                </header>
                <section
                    className="rounded-3xl border border-hairline bg-paper p-6 shadow-sm"
                >
                    <h2 className="text-lg font-semibold">
                        Khung trang đã sẵn sàng
                    </h2>
                    <p className="mt-2 text-sm text-mid-gray">
                        Card thống kê, bộ lọc, bảng dữ liệu và modal sẽ được bổ sung sau.
                    </p>
                </section>
    </>
  );
}
