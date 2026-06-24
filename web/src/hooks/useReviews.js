import { useState, useCallback } from 'react';
import apiServerClient from '@/lib/apiServerClient';

/**
 * useReviews(userId)
 *
 * Fetches all reviews for a user, lets you submit or delete your own.
 * Call with the profile owner's ID, not the logged-in user's ID.
 */
export function useReviews(userId) {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiServerClient.get(`/reviews/${userId}`);
      setReviews(data.reviews);
      setAvgRating(data.avgRating);
      setCount(data.count);
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const submitReview = useCallback(
    async ({ rating, comment }) => {
      try {
        const newReview = await apiServerClient.post(`/reviews/${userId}`, {
          rating,
          comment,
        });
       
        await fetchReviews();
        return newReview;
      } catch (err) {
        throw new Error(err.message || 'Failed to submit review');
      }
    },
    [userId, fetchReviews]
  );

  const deleteReview = useCallback(async () => {
    try {
      await apiServerClient.delete(`/reviews/${userId}`);
      await fetchReviews();
    } catch (err) {
      throw new Error(err.message || 'Failed to delete review');
    }
  }, [userId, fetchReviews]);

  return {
    reviews,
    avgRating,
    count,
    loading,
    error,
    fetchReviews,
    submitReview,
    deleteReview,
  };
}
