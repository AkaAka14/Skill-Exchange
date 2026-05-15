import React, { useEffect, useState } from 'react';
import { Star, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useReviews } from '@/hooks/useReviews.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import ReviewModal from './ReviewModal.jsx';

const ReviewSection = ({ user }) => {
  const { currentUser } = useAuth();
  const { getReviewsForUser, getAverageRating, isLoading } = useReviews();
  
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userExistingReview, setUserExistingReview] = useState(null);

  const loadReviews = async () => {
    if (!user?.id) return;
    const [revs, st] = await Promise.all([
      getReviewsForUser(user.id),
      getAverageRating(user.id)
    ]);
    setReviews(revs);
    setStats(st);
    
    if (currentUser) {
      const existing = revs.find(r => r.reviewerId === currentUser.id);
      setUserExistingReview(existing || null);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [user?.id, currentUser?.id]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const isOwner = currentUser?.id === user?.id;

  return (
    <Card className="bg-card border-white/10 mt-8">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-heading text-white">Reviews</CardTitle>
        {!isOwner && currentUser && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsModalOpen(true)}
            className="border-white/10 hover:bg-white/5"
          >
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            {userExistingReview ? 'Edit Review' : 'Leave Review'}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {/* Stats Summary */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-secondary/30 rounded-xl border border-white/5">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
            <span className="text-2xl font-bold font-heading">{stats.average}</span>
          </div>
          <div>
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  className={`h-4 w-4 ${star <= Math.round(stats.average) ? 'fill-[hsl(var(--star-active))] text-[hsl(var(--star-active))]' : 'fill-transparent text-[hsl(var(--star-inactive))]'}`} 
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Based on {stats.count} review{stats.count !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {isLoading ? (
            Array(2).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/5" />
                    <Skeleton className="h-3 w-16 bg-white/5" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full bg-white/5" />
              </div>
            ))
          ) : reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} className="p-4 rounded-xl bg-background border border-white/5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {getInitials(review.expand?.reviewerId?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white">{review.expand?.reviewerId?.name || 'Anonymous'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.created).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        className={`h-3 w-3 ${star <= review.rating ? 'fill-[hsl(var(--star-active))] text-[hsl(var(--star-active))]' : 'fill-transparent text-[hsl(var(--star-inactive))]'}`} 
                      />
                    ))}
                  </div>
                </div>
                {review.feedbackText && (
                  <p className="text-sm text-muted-foreground mt-2">{review.feedbackText}</p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No reviews yet.</p>
            </div>
          )}
        </div>
      </CardContent>

      {isModalOpen && (
        <ReviewModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          reviewee={user}
          existingReview={userExistingReview}
          onSuccess={loadReviews}
        />
      )}
    </Card>
  );
};

export default ReviewSection;