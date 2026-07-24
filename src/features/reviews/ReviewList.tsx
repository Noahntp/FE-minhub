import React, { useState } from 'react';
import { Star, ThumbsUp, MessageCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  createdAt: string;
  likes: number;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    userName: 'Lê Thị B',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    content: 'Giảng viên giảng dạy rất nhiệt tình và dễ hiểu. Nội dung bám sát thực tế, có nhiều bài tập thực hành giúp củng cố kiến thức.',
    createdAt: '2 ngày trước',
    likes: 12
  },
  {
    id: '2',
    userName: 'Trần Văn C',
    userAvatar: 'https://i.pravatar.cc/150?img=12',
    rating: 4,
    content: 'Khóa học chất lượng tốt, tuy nhiên phần nâng cao hơi nhanh, cần xem lại nhiều lần mới hiểu được hết.',
    createdAt: '1 tuần trước',
    likes: 5
  },
  {
    id: '3',
    userName: 'Phạm Thị D',
    userAvatar: 'https://i.pravatar.cc/150?img=20',
    rating: 5,
    content: 'Rất hài lòng với sự hỗ trợ từ giảng viên. Các câu hỏi đều được giải đáp nhanh chóng và chi tiết.',
    createdAt: '2 tuần trước',
    likes: 8
  }
];

export function ReviewList({ targetId, type }: { targetId: string; type: 'course' | 'instructor' }) {
  const [reviews] = useState<Review[]>(MOCK_REVIEWS);
  const [filter, setFilter] = useState<number | null>(null);

  const filteredReviews = filter ? reviews.filter(r => r.rating === filter) : reviews;

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="flex flex-col md:flex-row gap-8 items-center bg-muted/30 p-8 rounded-3xl">
        <div className="text-center">
          <div className="text-5xl font-black mb-2">4.8</div>
          <div className="flex text-amber-500 justify-center mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <div className="text-muted-foreground font-medium">Lượt đánh giá</div>
        </div>
        
        <div className="flex-1 w-full space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter(r => r.rating === star).length;
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setFilter(filter === star ? null : star)}>
                <div className="w-20 text-sm font-bold flex items-center gap-1 justify-end">
                  {star} <Star className="w-4 h-4 text-amber-500 fill-current" />
                </div>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="w-10 text-sm text-muted-foreground text-right">{percentage.toFixed(0)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Review Form */}
      <div className="bg-card border rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Gửi đánh giá của bạn</h3>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium">Chất lượng:</span>
          <div className="flex gap-1 text-amber-500 cursor-pointer">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-6 h-6 hover:fill-current" />
            ))}
          </div>
        </div>
        <textarea 
          placeholder="Chia sẻ trải nghiệm học tập của bạn..." 
          className="w-full p-4 rounded-xl border bg-background mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          rows={3}
        ></textarea>
        <div className="flex justify-end">
          <Button className="rounded-xl px-8">Đăng bài</Button>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Chưa có đánh giá nào cho bộ lọc này.</div>
        ) : (
          filteredReviews.map(review => (
            <div key={review.id} className="bg-card border rounded-3xl p-6 shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <img src={review.userAvatar} alt={review.userName} className="w-12 h-12 rounded-full" />
                <div>
                  <h4 className="font-bold">{review.userName}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                      ))}
                    </div>
                    <span>•</span>
                    <span>{review.createdAt}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-slate-700 leading-relaxed mb-4">{review.content}</p>
              
              <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <ThumbsUp className="w-4 h-4" /> Hữu ích ({review.likes})
                </button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <MessageCircle className="w-4 h-4" /> Phản hồi
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {filteredReviews.length > 0 && (
        <div className="text-center pt-4">
          <Button variant="outline" className="rounded-full px-8">Tải thêm đánh giá</Button>
        </div>
      )}
    </div>
  );
}
