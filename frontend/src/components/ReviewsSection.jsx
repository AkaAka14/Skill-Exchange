import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useReviews } from '@/hooks/useReviews';
import { StarRating } from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

/**
 * ReviewsSection
 *
 * Props:
 *   profileUserId  — whose profile this is (the reviewee)
 */
export function ReviewsSection({ profileUserId }) {
  const { currentUser } = useAuth();
  const {
    reviews,
    avgRating,
    count,
    loading,
    error,
    fetchReviews,
    submitReview,
    deleteReview,
  } = useReviews(profileUserId);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Find if current user already left a review
 const myReview = reviews.find((r) => {
  const reviewerId = r.reviewer?._id?.toString() || r.reviewer?.id?.toString();
  const meId = currentUser?.id?.toString() || currentUser?._id?.toString();
  return reviewerId === meId;
});
const meId = currentUser?.id?.toString() || currentUser?._id?.toString();
const isOwnProfile = profileUserId?.toString() === meId;
  // Pre-fill form if editing existing review
  // add right after the isOwnProfile line temporarily:
console.log('isOwnProfile check:', { profileUserId, meId, match: profileUserId?.toString() === meId });
  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment || '');
    }
  }, [myReview]);

  const handleSubmit = async () => {
    if (!rating) {
      setSubmitError('Please select a star rating.');
      return;
    }
    setSubmitError('');
    setSubmitting(true);
    try {
      await submitReview({ rating, comment });
      setRating(0);
      setComment('');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your review?')) return;
    await deleteReview();
    setRating(0);
    setComment('');
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold">Reviews</h2>
        {avgRating && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <StarRating value={Math.round(avgRating)} size="sm" />
            <span className="font-medium text-foreground">{avgRating}</span>
            <span>({count})</span>
          </span>
        )}
        {!avgRating && count === 0 && (
          <span className="text-sm text-muted-foreground">No reviews yet</span>
        )}
      </div>

      {/* Write / edit review form — hidden on own profile */}
      {currentUser && !isOwnProfile && (
        <div className="border rounded-lg p-4 mb-6 bg-muted/30">
          <p className="text-sm font-medium mb-2">
            {myReview ? 'Edit your review' : 'Write a review'}
          </p>
          <StarRating value={rating} onChange={setRating} size="lg" />
          <Textarea
            className="mt-3"
            placeholder="Share your experience (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={1000}
          />
          {submitError && (
            <p className="text-destructive text-sm mt-1">{submitError}</p>
          )}
          <div className="flex gap-2 mt-3">
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {myReview ? 'Update' : 'Submit'}
            </Button>
            {myReview && (
              <Button variant="ghost" onClick={handleDelete} className="text-destructive">
                Delete
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Reviews list */}
      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading reviews…</span>
        </div>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}
      {!loading && reviews.length === 0 && (
        <p className="text-muted-foreground text-sm">
          {isOwnProfile
            ? 'Your reviews will appear here once others rate you.'
            : 'Be the first to leave a review!'}
        </p>
      )}

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r._id} className="flex gap-3">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={r.reviewer?.avatarUrl} />
              <AvatarFallback>{r.reviewer?.name?.[0] ?? '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{r.reviewer?.name}</span>
                <StarRating value={r.rating} size="sm" />
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              {r.comment && (
                <p className="text-sm text-muted-foreground mt-0.5">{r.comment}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
