import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Filter, Users, UserPlus, Activity, Eye, PlayCircle, Layers } from 'lucide-react';
import { Course } from '../types';

interface InstructorEnrollmentChartProps {
  instructorId: string;
  courses: Course[];
}

export const InstructorEnrollmentChart: React.FC<InstructorEnrollmentChartProps> = ({ instructorId, courses }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>('30days');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [metric, setMetric] = useState<'unique' | 'total'>('unique');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [timeUnit, setTimeUnit] = useState<'day' | 'month' | 'year'>('day');

  const [topCourses, setTopCourses] = useState<any[]>([]);

  const summary = useMemo(() => {
    return data.reduce((acc, curr) => ({
      uniqueStudents: acc.uniqueStudents + (curr.uniqueStudents || 0),
      newEnrollments: acc.newEnrollments + (curr.newEnrollments || 0),
    }), { uniqueStudents: 0, newEnrollments: 0 });
  }, [data]);

  useEffect(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();
    let unit: 'day' | 'month' | 'year' = 'day';

    switch (timeRange) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case '7days':
        start.setDate(now.getDate() - 7);
        break;
      case '30days':
        start.setDate(now.getDate() - 30);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        unit = 'month';
        break;
      case '12months':
        start.setFullYear(now.getFullYear() - 1);
        unit = 'month';
        break;
      case 'all':
        start = new Date(2020, 0, 1);
        unit = 'year';
        break;
      default:
        start.setDate(now.getDate() - 30);
    }

    if (timeRange !== 'custom') {
      const startStr = new Date(start.getTime() - (start.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      const endStr = new Date(end.getTime() - (end.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      setStartDate(startStr);
      setEndDate(endStr);
    }
    
    setTimeUnit(unit);
  }, [timeRange]);

  useEffect(() => {
    if (!startDate || !endDate || !instructorId) return;

    setLoading(true);
    
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
          key = String(curr.getMonth() + 1).padStart(2, '0') + '/' + curr.getFullYear();
        } else {
          key = String(curr.getDate()).padStart(2, '0') + '/' + String(curr.getMonth() + 1).padStart(2, '0') + '/' + curr.getFullYear();
        }
        
        const r = seededRandom(key + instructorId + (selectedCourse || 'all'));
        const newEnrollments = Math.floor(r * 20);
        const uniqueStudents = Math.floor(newEnrollments * 0.85);

        if (!mockData.find(d => d.date === key)) {
          mockData.push({ date: key, newEnrollments, uniqueStudents });
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

      const mockTopCourses = courses.map((c, index) => {
        const base = seededRandom(c.id + instructorId) * 100;
        return {
          id: c.id,
          title: c.title,
          total: Math.floor(base + 50),
          unique: Math.floor((base + 50) * 0.8)
        };
      }).sort((a, b) => b.unique - a.unique).slice(0, 5);

      setTopCourses(mockTopCourses);
      setLoading(false);
    }, 400);

  }, [instructorId, startDate, endDate, selectedCourse, timeUnit, courses]);

  const getMetricDataKey = () => {
    return metric === 'unique' ? 'uniqueStudents' : 'newEnrollments';
  };

  const getMetricName = () => {
    return metric === 'unique' ? 'Học viên duy nhất' : 'Lượt ghi danh';
  };

  const formatNumber = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm mb-8">
      <div className="p-5 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-800 text-lg">Biểu đồ học viên / Enrollment</h3>
        </div>

        <div className="flex bg-stone-100 p-1 rounded-lg border border-stone-200">
          <button
            onClick={() => setMetric('unique')}
            className={"px-4 py-1.5 text-xs font-bold rounded-md transition-all " + (metric === 'unique' ? 'bg-white text-indigo-600 shadow-sm' : 'text-stone-500 hover:text-stone-700')}
          >
            HỌC VIÊN DUY NHẤT
          </button>
          <button
            onClick={() => setMetric('total')}
            className={"px-4 py-1.5 text-xs font-bold rounded-md transition-all " + (metric === 'total' ? 'bg-white text-indigo-600 shadow-sm' : 'text-stone-500 hover:text-stone-700')}
          >
            LƯỢT GHI DANH
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Thời gian
              </label>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-sm bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-stone-700"
              >
                <option value="today">Hôm nay</option>
                <option value="7days">7 ngày qua</option>
                <option value="30days">30 ngày qua</option>
                <option value="thisMonth">Tháng này</option>
                <option value="lastMonth">Tháng trước</option>
                <option value="thisYear">Năm nay</option>
                <option value="12months">12 tháng gần nhất</option>
                <option value="custom">Tùy chỉnh...</option>
              </select>
            </div>

            {timeRange === 'custom' && (
              <div className="flex items-center gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Từ ngày</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-sm bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-stone-700"
                  />
                </div>
                <div className="text-stone-400 mt-6">-</div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Đến ngày</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-sm bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-stone-700"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                <Filter className="w-3.5 h-3.5" /> Lọc theo khóa học
              </label>
              <select 
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="text-sm bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-stone-700 w-64"
              >
                <option value="all">Tất cả khóa học</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex bg-stone-50 p-1 rounded-lg border border-stone-200">
            <button
              onClick={() => setChartType('line')}
              className={"p-1.5 rounded transition-all " + (chartType === 'line' ? 'bg-white text-indigo-600 shadow-sm' : 'text-stone-400 hover:text-stone-600')}
              title="Biểu đồ đường"
            >
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={"p-1.5 rounded transition-all " + (chartType === 'bar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-stone-400 hover:text-stone-600')}
              title="Biểu đồ cột"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 text-indigo-100 opacity-50 group-hover:scale-110 transition-transform">
              <UserPlus className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 block">TỔNG HỌC VIÊN (DUY NHẤT)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-900">{formatNumber(summary.uniqueStudents)}</span>
                <span className="text-sm font-semibold text-indigo-600 border border-indigo-200 bg-white px-2 py-0.5 rounded-full">+ {formatNumber(Math.floor(summary.uniqueStudents * 0.15))} mới</span>
              </div>
            </div>
          </div>
          
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 text-emerald-100 opacity-50 group-hover:scale-110 transition-transform">
              <Layers className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 block">TỔNG LƯỢT GHI DANH (ENROLLMENTS)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-900">{formatNumber(summary.newEnrollments)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-80 w-full bg-white rounded-xl border border-stone-100 p-4 border-dashed relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 rounded-xl">
              <div className="flex gap-1 mb-3">
                <div className="w-2 h-8 bg-indigo-200 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-12 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-6 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm font-bold text-stone-500">Đang phân tích dữ liệu...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 z-10 rounded-xl">
              <div className="flex gap-1 mb-3 opacity-20">
                <div className="w-2 h-8 bg-stone-500 rounded-full"></div>
                <div className="w-2 h-12 bg-stone-500 rounded-full"></div>
                <div className="w-2 h-6 bg-stone-500 rounded-full"></div>
              </div>
              <span className="text-sm font-bold text-stone-600">Không có dữ liệu học viên</span>
              <span className="text-xs text-stone-400 mt-1">Vui lòng thử thay đổi khoảng thời gian hoặc khóa học</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={metric === 'unique' ? "#6366f1" : "#10b981"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={metric === 'unique' ? "#6366f1" : "#10b981"} stopOpacity={0}/>
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
                    dx={-10}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatNumber(value), getMetricName()]}
                    labelStyle={{ fontWeight: 'bold', color: '#1c1917', fontSize: 12, marginBottom: 4 }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={getMetricDataKey()} 
                    stroke={metric === 'unique' ? "#6366f1" : "#10b981"} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorMetric)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: metric === 'unique' ? "#4f46e5" : "#059669" }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                    dx={-10}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatNumber(value), getMetricName()]}
                    labelStyle={{ fontWeight: 'bold', color: '#1c1917', fontSize: 12, marginBottom: 4 }}
                    cursor={{ fill: '#f5f5f4' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar 
                    dataKey={getMetricDataKey()} 
                    fill={metric === 'unique' ? "#6366f1" : "#10b981"} 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={50}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-stone-100">
          <h4 className="font-bold text-sm text-stone-800 mb-4 flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-rose-500" /> TOP KHÓA HỌC THU HÚT NHẤT
          </h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] uppercase font-bold text-stone-400 border-b border-stone-100">
                  <th className="pb-3 font-semibold">Tên khóa học</th>
                  <th className="pb-3 text-right">Học viên duy nhất</th>
                  <th className="pb-3 text-right">Lượt ghi danh</th>
                </tr>
              </thead>
              <tbody>
                {topCourses.map((c, idx) => {
                  let cls = 'bg-stone-100 text-stone-500';
                  if (idx === 0) cls = 'bg-amber-100 text-amber-700';
                  else if (idx === 1) cls = 'bg-slate-100 text-slate-700';
                  else if (idx === 2) cls = 'bg-orange-100 text-orange-700';
                  return (
                    <tr key={c.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                      <td className="py-3 font-semibold text-stone-700 flex items-center gap-3">
                        <span className={"w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold " + cls}>
                          {idx + 1}
                        </span>
                        <span className="truncate max-w-[200px] md:max-w-md">{c.title}</span>
                      </td>
                      <td className="py-3 text-right font-bold text-indigo-600">{formatNumber(c.unique)}</td>
                      <td className="py-3 text-right font-bold text-emerald-600">{formatNumber(c.total)}</td>
                    </tr>
                  )
                })}
                {topCourses.length === 0 && !loading && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-stone-400 text-sm font-medium">Chưa có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
