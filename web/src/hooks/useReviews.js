import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

export const useReviews = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const getReviewsForUser = useCallback(async (userId) => {
    if (!userId) return [];
    setIsLoading(true);
    try {
      const records = await pb.collection('reviews').getFullList({
        filter: `revieweeId = "${userId}"`,
        sort: '-created',
        expand: 'reviewerId',
        $autoCancel: false
      });
      return records;
    } catch (err) {
      console.error('Error fetching reviews:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAverageRating = useCallback(async (userId) => {
    const reviews = await getReviewsForUser(userId);
    if (reviews.length === 0) return { average: 0, count: 0 };
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return {
      average: (sum / reviews.length).toFixed(1),
      count: reviews.length
    };
  }, [getReviewsForUser]);

  const createReview = async (revieweeId, rating, text) => {
    if (!currentUser) return null;
    try {
      const record = await pb.collection('reviews').create({
        reviewerId: currentUser.id,
        revieweeId,
        rating,
        feedbackText: text
      }, { $autoCancel: false });
      toast.success('Review submitted successfully');
      return record;
    } catch (err) {
      console.error('Error creating review:', err);
      toast.error('Failed to submit review');
      throw err;
    }
  };

  const updateReview = async (reviewId, rating, text) => {
    try {
      const record = await pb.collection('reviews').update(reviewId, {
        rating,
        feedbackText: text
      }, { $autoCancel: false });
      toast.success('Review updated');
      return record;
    } catch (err) {
      console.error('Error updating review:', err);
      toast.error('Failed to update review');
      throw err;
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await pb.collection('reviews').delete(reviewId, { $autoCancel: false });
      toast.success('Review deleted');
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error('Failed to delete review');
      throw err;
    }
  };

  return {
    isLoading,
    getReviewsForUser,
    getAverageRating,
    createReview,
    updateReview,
    deleteReview
  };
};