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

export default function HomePage() {
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
              <TrendingCourses />

              {/* What should I learn next? */}
              <SmartDiscovery />

              {/* New Courses */}
              <NewCourses />

              {/* Top Instructors */}
              <TopInstructors />
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
                <RecommendedCategoriesWidget />

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
