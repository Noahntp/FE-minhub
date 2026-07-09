import React, { useState, useEffect, useMemo } from 'react';
import { ApiService } from '../services/api';
import { 
  BarChart2, Filter, Calendar, BookOpen, Clock, 
  TrendingUp, Activity, DollarSign
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar
} from 'recharts';

interface InstructorRevenueChartProps {
  instructorId: string;
  courses: any[];
}

type MetricType = 'instructor' | 'gross' | 'platform';
type ChartType = 'area' | 'line' | 'bar';

export const InstructorRevenueChart: React.FC<InstructorRevenueChartProps> = ({ instructorId, courses }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [timeRange, setTimeRange] = useState<string>('30days'); // 7days, 30days, thisMonth, lastMonth, thisYear, 12months, custom
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [metric, setMetric] = useState<MetricType>('instructor');
  const [chartType, setChartType] = useState<ChartType>('area');
  
  // Custom Time unit fallback if we want to override automatic grouping
  const [timeUnit, setTimeUnit] = useState<'day' | 'month' | 'year'>('day');

  const instructorCourses = courses.filter(c => c.instructorId === instructorId || c.instructorName === courses[0]?.instructorName);

  // Update date ranges based on quick filters
  useEffect(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();
    let unit: 'day' | 'month' | 'year' = 'day';

    switch (timeRange) {
      case '7days':
        start.setDate(now.getDate() - 7);
        unit = 'day';
        break;
      case '30days':
        start.setDate(now.getDate() - 30);
        unit = 'day';
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        unit = 'day';
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        unit = 'day';
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        unit = 'month';
        break;
      case '12months':
        start.setMonth(now.getMonth() - 12);
        unit = 'month';
        break;
      case 'custom':
        // rely on startDate and endDate states
        if (startDate) start = new Date(startDate);
        if (endDate) end = new Date(endDate);
        // auto decide unit based on diff
        const diffDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 180) unit = 'month';
        if (diffDays > 1000) unit = 'year';
        break;
      default:
        start.setDate(now.getDate() - 30);
    }

    if (timeRange !== 'custom') {
      // Fix timezone offsets for the strings
      const startStr = new Date(start.getTime() - (start.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      const endStr = new Date(end.getTime() - (end.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      setStartDate(startStr);
      setEndDate(endStr);
    }
    
    setTimeUnit(unit);
  }, [timeRange]);

  // Generate Static Mock Data
  useEffect(() => {
    if (!startDate || !endDate || !instructorId) return;

    setLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      const mockData: any[] = [];
      const now = new Date();
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : now;
      
      const seededRandom = (seed: string) => {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
          hash = ((hash << 5) - hash) + seed.charCodeAt(i);
          hash |= 0; 
        }
        return Math.abs(hash) / 2147483647;
      };

      let curr = new Date(start);
      while (curr <= end) {
        let key = '';
        if (timeUnit === 'year') {
          key = curr.getFullYear().toString();
        } else if (timeUnit === 'month') {
          key = `${String(curr.getMonth() + 1).padStart(2, '0')}/${curr.getFullYear()}`;
        } else {
          key = `${String(curr.getDate()).padStart(2, '0')}/${String(curr.getMonth() + 1).padStart(2, '0')}/${curr.getFullYear()}`;
        }
        
        const r = seededRandom(key + instructorId + (selectedCourse || 'all'));
        const gross = Math.floor(r * 5 + 1) * 1000000 + Math.floor(r * 10) * 100000;
        const platform = gross * 0.3;
        const instructor = gross - platform;

        if (!mockData.find(d => d.date === key)) {
          mockData.push({ date: key, gross, instructor, platform });
        }

        if (timeUnit === 'year') {
          curr.setFullYear(curr.getFullYear() + 1);
        } else if (timeUnit === 'month') {
          curr.setMonth(curr.getMonth() + 1);
        } else {
          curr.setDate(curr.getDate() + 1);
        }
      }

      setData(mockData);
      setLoading(false);
    }, 400);

  }, [instructorId, startDate, endDate, selectedCourse, timeUnit]);

  // Aggregates for Summary
  const summary = useMemo(() => {
    return data.reduce((acc, curr) => ({
      gross: acc.gross + (curr.gross || 0),
      instructor: acc.instructor + (curr.instructor || 0),
      platform: acc.platform + (curr.platform || 0)
    }), { gross: 0, instructor: 0, platform: 0 });
  }, [data]);

  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  
  const getMetricDataKey = () => {
    switch (metric) {
      case 'gross': return 'gross';
      case 'platform': return 'platform';
      default: return 'instructor';
    }
  };

  const getMetricName = () => {
    switch (metric) {
      case 'gross': return 'Tổng doanh thu (Gross)';
      case 'platform': return 'Phí nền tảng (Platform Fee)';
      default: return 'Thu nhập giảng viên (Net)';
    }
  };

  const getMetricColor = () => {
    switch (metric) {
      case 'gross': return '#0ea5e9'; // sky-500
      case 'platform': return '#f43f5e'; // rose-500
      default: return '#10b981'; // emerald-500
    }
  };

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm mt-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b pb-4">
        <h3 className="text-base font-display font-bold text-stone-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" /> Biểu đồ doanh thu
        </h3>
        
        {/* Metric Selector */}
        <div className="flex bg-stone-100 rounded-lg p-1 w-full lg:w-auto overflow-x-auto shrink-0">
          <button 
            onClick={() => setMetric('instructor')}
            className={`px-4 py-1.5 rounded-md font-bold text-[11px] uppercase transition-all whitespace-nowrap ${metric === 'instructor' ? 'bg-white shadow-sm text-emerald-600' : 'text-stone-500 hover:text-stone-800'}`}
          >
            Thu nhập giảng viên
          </button>
          <button 
            onClick={() => setMetric('gross')}
            className={`px-4 py-1.5 rounded-md font-bold text-[11px] uppercase transition-all whitespace-nowrap ${metric === 'gross' ? 'bg-white shadow-sm text-sky-600' : 'text-stone-500 hover:text-stone-800'}`}
          >
            Tổng Gross
          </button>
          <button 
            onClick={() => setMetric('platform')}
            className={`px-4 py-1.5 rounded-md font-bold text-[11px] uppercase transition-all whitespace-nowrap ${metric === 'platform' ? 'bg-white shadow-sm text-rose-600' : 'text-stone-500 hover:text-stone-800'}`}
          >
            Phí nền tảng
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-4 items-end mb-6 z-10 relative">
        {/* Quick Time Range */}
        <div className="w-full md:w-auto">
          <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Thời gian
          </label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded-lg px-3 py-2 text-xs font-semibold text-stone-700 outline-none focus:ring-2 focus:ring-indigo-500 bg-stone-50 w-full"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="thisMonth">Tháng này</option>
            <option value="lastMonth">Tháng trước</option>
            <option value="thisYear">Năm nay</option>
            <option value="12months">12 tháng gần nhất</option>
            <option value="custom">Tùy chỉnh...</option>
          </select>
        </div>

        {/* Custom Date Range */}
        {timeRange === 'custom' && (
          <div className="flex gap-2 w-full md:w-auto animate-fade-in">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Từ ngày</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-xs font-medium text-stone-700 outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Đến ngày</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-xs font-medium text-stone-700 outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              />
            </div>
          </div>
        )}

        {/* Course Filter */}
        <div className="w-full md:w-64">
          <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Lọc theo khóa học
          </label>
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border rounded-lg px-3 py-2 text-xs font-semibold text-stone-700 outline-none focus:ring-2 focus:ring-indigo-500 bg-stone-50 w-full"
          >
            <option value="all">Tất cả khóa học</option>
            {instructorCourses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        
        {/* Chart Type Selector */}
        <div className="w-full md:w-auto ml-auto">
          <div className="flex bg-stone-100 rounded-lg p-1 border">
            <button 
              title="Area Chart"
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded transition-all ${chartType === 'area' ? 'bg-white shadow-sm text-indigo-600' : 'text-stone-400'}`}
            ><Activity className="w-4 h-4"/></button>
            <button 
              title="Bar Chart"
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded transition-all ${chartType === 'bar' ? 'bg-white shadow-sm text-indigo-600' : 'text-stone-400'}`}
            ><BarChart2 className="w-4 h-4"/></button>
          </div>
        </div>
      </div>

      {/* REVENUE SUMMARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider">Tổng Gross (Khách trả)</span>
          <div className="text-xl font-black text-sky-900 mt-1">{formatVND(summary.gross)}</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl transform scale-105 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10"><DollarSign className="w-24 h-24 text-emerald-600" /></div>
          <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider flex items-center gap-1 relative z-10">Thu Nhập Của Bạn</span>
          <div className="text-2xl font-black text-emerald-700 mt-1 relative z-10">{formatVND(summary.instructor)}</div>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Phí Nền Tảng (MindHub)</span>
          <div className="text-xl font-black text-rose-900 mt-1">{formatVND(summary.platform)}</div>
        </div>
      </div>

      {/* CHART AREA */}
      <div className="h-[350px] w-full relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
              <span className="text-xs font-bold text-stone-500">Đang tải dữ liệu biểu đồ...</span>
            </div>
          </div>
        )}
        
        {data.length === 0 && !loading ? (
          <div className="absolute inset-0 z-10 bg-slate-50 border border-dashed rounded-xl flex items-center justify-center">
            <div className="text-center">
              <BarChart2 className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-500">Không có dữ liệu giao dịch</p>
              <p className="text-xs text-stone-400 mt-1">Vui lòng thử thay đổi khoảng thời gian hoặc khóa học</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#78716c', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#78716c', fontWeight: 600 }}
                  tickFormatter={(val) => `${val / 1000}k`}
                  dx={-10}
                />
                <Tooltip 
                  formatter={(value: number) => [formatVND(value), getMetricName()]}
                  labelStyle={{ fontWeight: 'bold', color: '#1c1917', fontSize: 12, marginBottom: 4 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={getMetricDataKey()} 
                  stroke={getMetricColor()} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMetric)" 
                />
              </AreaChart>
            ) : chartType === 'bar' ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#78716c', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#78716c', fontWeight: 600 }}
                  tickFormatter={(val) => `${val / 1000}k`}
                  dx={-10}
                />
                <Tooltip 
                  formatter={(value: number) => [formatVND(value), getMetricName()]}
                  labelStyle={{ fontWeight: 'bold', color: '#1c1917', fontSize: 12, marginBottom: 4 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar 
                  dataKey={getMetricDataKey()} 
                  fill={getMetricColor()} 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#78716c', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#78716c', fontWeight: 600 }}
                  tickFormatter={(val) => `${val / 1000}k`}
                  dx={-10}
                />
                <Tooltip 
                  formatter={(value: number) => [formatVND(value), getMetricName()]}
                  labelStyle={{ fontWeight: 'bold', color: '#1c1917', fontSize: 12, marginBottom: 4 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey={getMetricDataKey()} 
                  stroke={getMetricColor()} 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
