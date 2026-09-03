import React from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { useHomepageData } from './hooks/useHomepageData';
import { HeroSection } from './components/HeroSection';
import { StatsBarSection } from './components/StatsBarSection';
import { FeaturedCategoriesSection } from './components/FeaturedCategoriesSection';
import { FeaturedCoursesSection } from './components/FeaturedCoursesSection';
import { NewCoursesSection } from './components/NewCoursesSection';
import { DiscountedCoursesSection } from './components/DiscountedCoursesSection';
import { FeaturedInstructorsSection } from './components/FeaturedInstructorsSection';

import { WhyChooseUsSection } from './components/WhyChooseUsSection';
import { StudentTestimonialsSection } from './components/StudentTestimonialsSection';
import { HomeFaqSection } from './components/HomeFaqSection';
import { HomeCtaBannerSection } from './components/HomeCtaBannerSection';

export default function HomePage() {
  const { data, isLoading } = useHomepageData();

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
        
        {/* Hero Section */}
        <HeroSection />

        {/* Stats Bar */}
        <StatsBarSection stats={data.stats} />

        {/* Featured Categories */}
        <FeaturedCategoriesSection categories={data.featuredCategories} />

        {/* Section: Khóa học nổi bật */}
        <FeaturedCoursesSection courses={data.featuredCourses} />

        {/* Section [YÊU CẦU BỔ SUNG 1]: Khóa học mới nhất */}
        <NewCoursesSection courses={data.newCourses} />

        {/* Section [YÊU CẦU BỔ SUNG 2]: Khóa học giảm giá */}
        <DiscountedCoursesSection courses={data.discountedCourses} />

        {/* Section [YÊU CẦU BỔ SUNG 3]: Giảng viên tiêu biểu & Khóa học tương ứng */}
        <FeaturedInstructorsSection 
          instructors={data.topInstructors} 
          allCourses={[...(data.featuredCourses || []), ...(data.newCourses || []), ...(data.discountedCourses || [])]} 
        />


        {/* Why Choose Us */}
        <WhyChooseUsSection />

        {/* Testimonials */}
        <StudentTestimonialsSection testimonials={data.testimonials} />

        {/* FAQ Accordion */}
        <HomeFaqSection faqs={data.faqs} />

        {/* CTA Banner */}
        <HomeCtaBannerSection />

      </div>
    </PageTransition>
  );
}
