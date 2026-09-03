import React from 'react';
import { AlertCircle } from 'lucide-react';
import { InstructorImageUploader, InstructorVideoUploader } from './InstructorUploaders';

interface CourseMediaStepProps {
  image: string;
  setImage: (url: string) => void;
  introVideoUrl: string;
  setIntroVideoUrl: (url: string) => void;
  imageError?: string;
}

export default function CourseMediaStep({ image, setImage, introVideoUrl, setIntroVideoUrl, imageError }: CourseMediaStepProps) {
  return (
    <div className="space-y-6">
      <div className="border-b pb-2 mb-2">
        <h2 className="text-sm font-black text-stone-850">Hình ảnh & video giới thiệu</h2>
        <p className="text-[10.5px] text-stone-400 font-medium mt-1">Đăng tải ảnh bìa quảng bá và video trailer học thử.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Thumbnail */}
        <div id="focus-thumbnail" data-focus-id="thumbnail" className={`bg-slate-50/20 border rounded-2xl p-5 space-y-4 transition-all duration-300 ${
          imageError ? 'border-red-400 bg-red-50/10' : 'border-slate-100'
        }`}>
          <div className="border-b pb-2">
            <h4 className="text-[11.5px] font-black text-stone-850">1. Ảnh bìa đại diện khóa học (Thumbnail) *</h4>
            <p className="text-[9.5px] text-stone-400 mt-0.5">Xuất hiện tại trang danh sách & chi tiết khóa học.</p>
          </div>
          <InstructorImageUploader 
            value={image} 
            onChange={(url) => setImage(url)}
            label="Tải lên file ảnh (jpg, png, webp)"
          />
          <div className="space-y-1.5 text-left">
            <label className="block text-[10px] font-bold text-stone-600">Hoặc nhập liên kết URL ảnh bìa:</label>
            <input 
              type="text" 
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className={`w-full text-[11px] font-bold text-stone-700 border rounded-xl px-3 py-2.5 focus:outline-none bg-white transition-colors ${
                imageError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-emerald-500'
              }`}
            />
            {imageError && (
              <p className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" /> {imageError}
              </p>
            )}
          </div>
        </div>

        {/* Card 2: Intro Video */}
        <div id="focus-intro_video" data-focus-id="intro_video" className="bg-slate-50/20 border border-slate-100 rounded-2xl p-5 space-y-4 transition-all duration-300">
          <div className="border-b pb-2">
            <h4 className="text-[11.5px] font-black text-stone-850">2. Video giới thiệu khóa học (Intro Video) *</h4>
            <p className="text-[9.5px] text-stone-400 mt-0.5">Video ngắn giới thiệu nội dung chương trình học.</p>
          </div>
          <InstructorVideoUploader 
            value={introVideoUrl} 
            onChange={(url) => setIntroVideoUrl(url)}
            type="course_intro_video"
            label="Tải lên file video trailer (mp4, mov, webm)"
          />
          <div className="space-y-1.5 text-left">
            <label className="block text-[10px] font-bold text-stone-600">Hoặc nhập liên kết URL video:</label>
            <input 
              type="text" 
              value={introVideoUrl}
              onChange={(e) => setIntroVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/embed/..."
              className="w-full text-[11px] font-bold text-stone-700 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none bg-white focus:border-emerald-500"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
