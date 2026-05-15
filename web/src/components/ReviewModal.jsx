import React, { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useReviews } from '@/hooks/useReviews.js';

const ReviewModal = ({ isOpen, onClose, reviewee, existingReview = null, onSuccess }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState(existingReview?.feedbackText || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createReview, updateReview } = useReviews();

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      if (existingReview) {
        await updateReview(existingReview.id, rating, feedback);
      } else {
        await createReview(reviewee.id, rating, feedback);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-white/10 text-foreground">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {existingReview ? 'Edit Review' : `Review ${reviewee?.name || 'User'}`}
          </DialogTitle>
          <DialogDescription>
            Share your experience exchanging skills with this person.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Rating</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star 
                    className={`h-8 w-8 transition-colors ${
                      (hoverRating || rating) >= star 
                        ? 'fill-[hsl(var(--star-active))] text-[hsl(var(--star-active))]' 
                        : 'fill-transparent text-[hsl(var(--star-inactive))]'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="feedback" className="text-sm font-medium text-muted-foreground">
              Feedback (Optional)
            </label>
            <Textarea
              id="feedback"
              placeholder="How was your skill exchange?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="bg-input border-white/10 resize-none h-24 focus-visible:ring-primary"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="border-white/10">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || isSubmitting} className="bg-primary text-white hover:bg-primary/90">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;