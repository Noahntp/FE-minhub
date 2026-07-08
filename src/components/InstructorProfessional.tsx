import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Briefcase, Award, Star, 
  CheckCircle2, AlertCircle, Save 
} from 'lucide-react';

export interface ProfessionalData {
  bio: string;
  expertise: string;
  experience_years: number;
  level: string;
}

interface InstructorProfessionalProps {
  initialData: ProfessionalData;
  onSubmit: (data: ProfessionalData) => void;
}

export const InstructorProfessional: React.FC<InstructorProfessionalProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<ProfessionalData>(initialData);
  const [isDirty, setIsDirty] = useState(false);

  // Refs cho auto-scroll
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const expertiseRef = useRef<HTMLInputElement>(null);
  const experienceRef = useRef<HTMLInputElement>(null);
  const levelRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
    setIsDirty(isChanged);
  }, [formData, initialData]);

  const calculateProgress = () => {
    const fields = [
      { key: 'bio', label: 'Giới thiệu bản thân (Bio)' },
      { key: 'expertise', label: 'Chuyên môn' },
      { key: 'experience_years', label: 'Kinh nghiệm (Năm)' },
      { key: 'level', label: 'Cấp độ' }
    ];

    const missingFields = fields.filter(f => {
      const val = formData[f.key as keyof ProfessionalData];
      if (f.key === 'experience_years') return val === '' || val === null || val === undefined;
      return !val || String(val).trim() === '';
    });

    const completedCount = 4 - missingFields.length;
    return { completedCount, missingFields };
  };

  const { completedCount, missingFields } = calculateProgress();
  const progressPercent = (completedCount / 4) * 100;

  const handleCompleteProfile = () => {
    if (missingFields.length === 0) return;
    
    const firstMissing = missingFields[0].key;
    const refMap: Record<string, React.RefObject<any>> = {
      bio: bioRef,
      expertise: expertiseRef,
      experience_years: experienceRef,
      level: levelRef
    };

    const targetRef = refMap[firstMissing];
    if (targetRef && targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetRef.current.focus();
    }
  };

  const handleSave = () => {
    if (isDirty) {
      onSubmit(formData);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Khối 2: Form thông tin chi tiết (Cột trái) */}
        <div className="lg:col-span-2 space-y-6 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="border-b border-slate-100 pb-5 mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Hồ sơ chuyên môn</h2>
            <p className="text-slate-500 mt-1">Cập nhật kinh nghiệm và chuyên môn giảng dạy của bạn</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FileText size={18} className="text-indigo-500" />
                Giới thiệu bản thân (Bio)
              </label>
              <textarea
                ref={bioRef}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none font-medium text-slate-700"
                placeholder="Ví dụ: Tôi là giảng viên backend, có kinh nghiệm xây dựng REST API, Laravel và MySQL..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Briefcase size={18} className="text-indigo-500" />
                Chuyên môn
              </label>
              <input
                ref={expertiseRef}
                type="text"
                value={formData.expertise}
                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-slate-700"
                placeholder="Ví dụ: Laravel, PHP, MySQL, API Design"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Star size={18} className="text-indigo-500" />
                  Kinh nghiệm (Năm)
                </label>
                <input
                  ref={experienceRef}
                  type="number"
                  min="0"
                  max="80"
                  value={formData.experience_years === null || formData.experience_years === undefined ? '' : formData.experience_years}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 80) {
                      setFormData({ ...formData, experience_years: val });
                    } else if (e.target.value === '') {
                      setFormData({ ...formData, experience_years: '' as any });
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-slate-700"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Award size={18} className="text-indigo-500" />
                  Cấp độ
                </label>
                <input
                  ref={levelRef}
                  type="text"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-slate-700"
                  placeholder="Ví dụ: Senior Backend Instructor"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                disabled={!isDirty}
                onClick={handleSave}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all
                  ${isDirty 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transform hover:-translate-y-0.5' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                <Save size={18} />
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>

        {/* Khối 1: Trạng thái hồ sơ (Cột phải) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Trạng thái hồ sơ</h3>
            
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-slate-600">Mức độ hoàn thiện</span>
                <span className="text-lg font-bold text-indigo-600">{completedCount}/4</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${completedCount === 4 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                />
              </div>
            </div>

            {missingFields.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                  <div className="flex gap-2 items-start text-orange-800 mb-3">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Bạn cần bổ sung các thông tin sau:</span>
                  </div>
                  <ul className="space-y-2 mb-4 pl-7">
                    {missingFields.map((field, index) => (
                      <li key={index} className="text-sm text-orange-700 list-disc font-medium">
                        {field.label}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleCompleteProfile}
                    className="w-full py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-sm font-bold transition-colors"
                  >
                    Hoàn thiện hồ sơ
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="font-bold text-emerald-800 mb-1">Hồ sơ hoàn hảo!</h4>
                <p className="text-sm text-emerald-600">Hồ sơ chuyên môn của bạn đã đầy đủ thông tin.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
