import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Coupon } from './types';
import { CouponOverview } from './components/CouponOverview';
import { CouponFilter } from './components/CouponFilter';
import { CouponTable } from './components/CouponTable';
import { CouponForm } from './components/CouponForm';

export const CouponManagement: React.FC = () => {
  // Mock data for initial state visualization
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: '1',
      code: 'SUMMER2024',
      name: 'Giảm giá mùa hè',
      course_id: 'course_1',
      discount_type: 'percent',
      discount_value: 20,
      max_order_amount: 500000,
      usage_limit: 100,
      used_count: 45,
      start_at: '2024-06-01T00:00:00Z',
      end_at: '2024-08-31T23:59:59Z',
      status: 'active'
    },
    {
      id: '2',
      code: 'WELCOME500',
      name: 'Chào bạn mới',
      course_id: 'course_2',
      discount_type: 'fixed',
      discount_value: 500000,
      usage_limit: 50,
      used_count: 50,
      start_at: '2024-01-01T00:00:00Z',
      end_at: '2024-12-31T23:59:59Z',
      status: 'used_up'
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  // Stats derivation
  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.status === 'active').length,
    inactive: coupons.filter(c => c.status === 'inactive').length,
    expired: coupons.filter(c => c.status === 'expired').length,
    usedUp: coupons.filter(c => c.status === 'used_up').length,
  };

  const handleFilterClick = (status: string | null) => {
    setStatusFilter(status || 'all');
  };

  const handleAddClick = () => {
    setSelectedCoupon(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsFormOpen(true);
  };

  const handleViewClick = (coupon: Coupon) => {
    console.log('View coupon', coupon);
  };

  const handleToggleStatus = (coupon: Coupon) => {
    const newStatus = coupon.status === 'active' ? 'inactive' : 'active';
    setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, status: newStatus } : c));
  };

  const handleDelete = (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  const handleSubmitForm = async (data: Partial<Coupon>) => {
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (selectedCoupon) {
          // Update
          setCoupons(prev => prev.map(c => c.id === selectedCoupon.id ? { ...c, ...data } as Coupon : c));
        } else {
          // Create
          const newCoupon: Coupon = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            used_count: 0,
            status: 'active',
          } as Coupon;
          setCoupons(prev => [newCoupon, ...prev]);
        }
        resolve();
      }, 800);
    });
  };

  const filteredCoupons = coupons.filter(c => {
    const matchSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchCourse = courseFilter === 'all' || c.course_id === courseFilter;
    return matchSearch && matchStatus && matchCourse;
  });

  return (
    <div className="w-full">
      {isFormOpen ? (
        <CouponForm 
          onClose={() => setIsFormOpen(false)}
          coupon={selectedCoupon}
          onSubmit={handleSubmitForm}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý mã giảm giá</h1>
              <p className="text-gray-500 text-sm mt-1">Tạo và quản lý các chương trình khuyến mãi cho khóa học của bạn.</p>
            </div>
            <button
              onClick={handleAddClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Tạo mã mới
            </button>
          </div>

          <CouponOverview stats={stats} onFilter={handleFilterClick} />
          
          <CouponFilter 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            courseFilter={courseFilter}
            setCourseFilter={setCourseFilter}
          />

          <CouponTable 
            coupons={filteredCoupons}
            isLoading={isLoading}
            onView={handleViewClick}
            onEdit={handleEditClick}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
};
