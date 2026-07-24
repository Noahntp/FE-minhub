import React from "react";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function RoadmapTimeline() {
  const steps = [
    { id: 1, title: "HTML & CSS Cơ bản", status: "completed" },
    { id: 2, title: "JavaScript Cơ bản", status: "completed" },
    { id: 3, title: "React JS", status: "in-progress", progress: 68 },
    { id: 4, title: "Next.js", status: "pending" },
    { id: 5, title: "Project Thực tế", status: "pending" },
  ];

  return (
    <div className="mb-8 p-6 pb-16 bg-card rounded-2xl border border-border/50 shadow-sm">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Frontend Developer Roadmap</h2>
          <p className="text-sm text-muted-foreground">Bạn đã hoàn thành 40% chặng đường</p>
        </div>
        <Link to="/roadmaps/frontend" className="text-sm font-bold text-primary hover:underline flex items-center">
          Xem chi tiết <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="relative px-2 md:px-8">
        {/* Track Line */}
        <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-muted -translate-y-1/2 rounded-full hidden md:block"></div>
        <div className="absolute top-1/2 left-4 h-1.5 bg-primary -translate-y-1/2 rounded-full hidden md:block" style={{ width: '50%' }}></div>

        {/* Steps */}
        <div className="flex flex-col md:flex-row justify-between relative gap-6 md:gap-0">
          {steps.map((step, index) => (
            <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-3 relative z-10 group cursor-pointer">
              {/* Icon */}
              <div className="bg-card p-1.5 rounded-full">
                {step.status === "completed" ? (
                  <CheckCircle2 className="w-6 h-6 md:w-10 md:h-10 text-primary fill-primary/10" />
                ) : step.status === "in-progress" ? (
                  <div className="relative flex items-center justify-center w-6 h-6 md:w-10 md:h-10">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"></div>
                    <div className="w-full h-full rounded-full border-2 border-primary flex items-center justify-center bg-card z-10">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-primary"></div>
                    </div>
                  </div>
                ) : (
                  <Circle className="w-6 h-6 md:w-10 md:h-10 text-muted-foreground" />
                )}
              </div>
              
              {/* Text */}
              <div className="flex-1 md:flex-none md:text-center md:absolute md:top-14 md:left-1/2 md:-translate-x-1/2 md:w-32">
                <p className={`text-sm font-bold ${
                  step.status === "completed" ? "text-primary" : 
                  step.status === "in-progress" ? "text-foreground" : "text-muted-foreground"
                } group-hover:text-primary transition-colors line-clamp-2 leading-tight`}>
                  {step.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
