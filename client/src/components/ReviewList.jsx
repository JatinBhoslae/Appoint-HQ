import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, User } from 'lucide-react';
import { API_URL } from '../config';

const ReviewList = ({ serviceId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Assuming we have an endpoint to get reviews for a service
        // If not, we might need to update the backend.
        // The service object usually contains reviews if populated, 
        // or we can add an endpoint GET /api/services/:id/reviews
        // For now, let's assume the service details endpoint returns reviews or we fetch from service

        // Actually, in many MERN tutorials, reviews are part of the service object.
        // Let's check the Service model or controller.
        // If not, I'll use the service details endpoint which likely includes them.

        const { data } = await axios.get(`${API_URL}/api/services/${serviceId}`);
        if (data.reviews) {
          setReviews(data.reviews);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchReviews();
  }, [serviceId]);

  if (loading) return <div className="h-20 animate-pulse bg-muted rounded"></div>;
  if (reviews.length === 0) return (
    <div className="text-center text-muted-foreground py-8 italic">
      No reviews yet. Be the first to review!
    </div>
  );

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
        Reviews <span className="text-sm font-normal text-muted-foreground">({reviews.length})</span>
      </h3>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="bg-muted/30 p-4 rounded-lg border border-border">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                  {review.name ? review.name.charAt(0) : 'U'}
                </div>
                <span className="font-semibold text-foreground">{review.name}</span>
              </div>
              <div className="flex items-center gap-1 bg-card px-2 py-1 rounded shadow-sm border border-border">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold text-foreground">{review.rating}</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">{review.comment}</p>
            <p className="text-xs text-muted-foreground/80 mt-2">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
