import React from "react";
import { Calendar, Video, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const EVENTS = [
  {
    id: 1,
    title: "Q&A System Design với anh Tùng",
    time: "20:00 - Tối nay",
    type: "livestream"
  },
  {
    id: 2,
    title: "Deadline: Project E-commerce",
    time: "23:59 - Ngày mai",
    type: "deadline"
  }
];

export function UpcomingEventsWidget() {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          Sự kiện sắp tới
        </h3>
      </div>

      <div className="space-y-3">
        {EVENTS.map((event) => (
          <Link 
            key={event.id}
            to="/my-courses"
            className="block p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${event.type === 'livestream' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                {event.type === 'livestream' ? <Video className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-1">{event.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
