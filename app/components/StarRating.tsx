'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
}

export default function StarRating({ rating, maxRating = 5, size = 16 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(maxRating)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= rating;
        const isHalfFilled = !isFilled && starValue - 0.5 <= rating;
        
        return (
          <Star
            key={i}
            size={size}
            className={
              isFilled
                ? 'fill-yellow-400 text-yellow-400'
                : isHalfFilled
                ? 'fill-yellow-400/50 text-yellow-400'
                : 'fill-zinc-200 dark:fill-zinc-700 text-zinc-200 dark:text-zinc-700'
            }
          />
        );
      })}
    </div>
  );
}
