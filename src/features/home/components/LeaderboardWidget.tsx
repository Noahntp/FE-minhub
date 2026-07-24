import React from "react";
import { Trophy, Medal } from "lucide-react";
import { Link } from "react-router-dom";

const LEADERBOARD = [
  { id: 1, name: "Thanh Tùng", xp: "12,450", avatar: "https://i.pravatar.cc/150?u=1", rank: 1 },
  { id: 2, name: "Minh Anh", xp: "11,200", avatar: "https://i.pravatar.cc/150?u=2", rank: 2 },
  { id: 3, name: "Hải Đăng", xp: "10,800", avatar: "https://i.pravatar.cc/150?u=3", rank: 3 },
  { id: 4, name: "Bạn", xp: "8,950", avatar: "https://i.pravatar.cc/150?u=me", rank: 12, isMe: true },
];

export function LeaderboardWidget() {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold">Bảng Xếp Hạng</h3>
        </div>
        <Link to="/achievements" className="text-xs text-primary hover:underline font-medium">Chi tiết</Link>
      </div>

      <div className="space-y-4">
        {LEADERBOARD.map((user) => (
          <div 
            key={user.id} 
            className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${user.isMe ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/50'}`}
          >
            <div className="w-6 text-center font-bold text-sm text-muted-foreground shrink-0">
              {user.rank === 1 ? <Medal className="w-5 h-5 text-yellow-500 mx-auto" /> : 
               user.rank === 2 ? <Medal className="w-5 h-5 text-slate-400 mx-auto" /> : 
               user.rank === 3 ? <Medal className="w-5 h-5 text-amber-700 mx-auto" /> : 
               user.rank}
            </div>
            
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${user.isMe ? 'text-primary' : ''}`}>
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground">{user.xp} XP</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
