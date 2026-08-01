import React from 'react';
import { CommandCenter } from './components/CommandCenter';
import { RoadmapTimeline } from './components/RoadmapTimeline';
import { SmartDiscovery } from './components/SmartDiscovery';
import { TrendingCourses } from './components/TrendingCourses';
import { NewCourses } from './components/NewCourses';
import { TopInstructors } from './components/TopInstructors';
import { ActivityCalendar } from './components/ActivityCalendar';
import { RecentBadges } from './components/RecentBadges';
import { LearningStatsWidget } from './components/LearningStatsWidget';
import { QuickNavWidget } from './components/QuickNavWidget';
import { RecentlyViewedWidget } from './components/RecentlyViewedWidget';
import { RecommendedCategoriesWidget } from './components/RecommendedCategoriesWidget';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { useHomepageData } from './hooks/useHomepageData';

export default function HomePage() {
  const { data, isLoading } = useHomepageData();

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-muted/20 pt-8 pb-20">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Cột chính (Main content - Current focus & Gamification) */}
            <div className="flex-1 min-w-0">
              {/* Where am I? & What should I do now? */}
              <CommandCenter />
              
              {/* How far have I progressed? */}
              <RoadmapTimeline />
              
              {/* Trending Courses */}
              <TrendingCourses courses={data.trendingCourses} />

              {/* What should I learn next? */}
              <SmartDiscovery courses={data.recommendedCourses} />

              {/* New Courses */}
              <NewCourses courses={data.newCourses} />

              {/* Top Instructors */}
              <TopInstructors instructors={data.topInstructors} />
            </div>
            
            {/* Cột phụ (Sidebar - Assistant Widgets) */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="sticky top-20 flex flex-col">
                {/* Learning Stats */}
                <LearningStatsWidget />

                {/* Daily Goal & Tracking */}
                <ActivityCalendar />
                
                {/* Recently Viewed */}
                <RecentlyViewedWidget />
                
                {/* Recommended Categories */}
                <RecommendedCategoriesWidget categories={data.featuredCategories} />

                {/* Quick Navigation */}
                <QuickNavWidget />
                
                {/* Rewards */}
                <RecentBadges />
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
