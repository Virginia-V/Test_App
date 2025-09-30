import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";

// Types
interface Review {
  author: string;
  date: string;
  rating: number;
  comment: string;
}

interface ReviewSectionProps {
  reviews: Review[];
  overallRating: number;
  totalReviews: number;
}

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md";
}

interface ReviewCardProps {
  review: Review;
}

// Constants
const STAR_SIZES = {
  sm: "h-4 w-4",
  md: "h-5 w-5"
} as const;

const STARS_COUNT = 5;

// Utility function to get star type
const getStarType = (rating: number, starIndex: number) => {
  const difference = rating - starIndex + 1;

  if (difference >= 1) return "full";
  if (difference > 0) return "partial";
  return "empty";
};

// Star Rating Component
const StarRating: React.FC<StarRatingProps> = ({ rating, size = "sm" }) => {
  const starSize = STAR_SIZES[size];

  const renderStar = (starIndex: number) => {
    const starType = getStarType(rating, starIndex);
    const key = `star-${starIndex}`;

    switch (starType) {
      case "full":
        return (
          <Star
            key={key}
            className={`${starSize} fill-amber-400 text-amber-400`}
          />
        );

      case "partial":
        const fillPercentage = (rating - starIndex + 1) * 100;
        return (
          <div key={key} className="relative">
            <Star className={`${starSize} fill-gray-200 text-gray-200`} />
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star className={`${starSize} fill-amber-400 text-amber-400`} />
            </div>
          </div>
        );

      case "empty":
      default:
        return (
          <Star
            key={key}
            className={`${starSize} fill-gray-200 text-gray-200`}
          />
        );
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: STARS_COUNT }, (_, index) => renderStar(index + 1))}
    </div>
  );
};

// Review Card Component
const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => (
  <Card className="border-none rounded-sm h-full shadow-sm transition-all duration-300 hover:shadow-md">
    <CardContent className="px-2">
      <div className="flex items-center mb-1">
        <Avatar className="mr-2 h-5 w-5">
          <AvatarFallback className="text-[10px] bg-gray-200 text-gray-600">
            {review.author.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold text-[11px] text-gray-700">{review.author}</p>
          <p className="text-[0.55rem] text-gray-500">{review.date}</p>
        </div>
      </div>

      <div className="mb-1">
        <StarRating rating={review.rating} />
      </div>

      <p className="text-[11px] text-gray-600 line-clamp-3">{review.comment}</p>
    </CardContent>
  </Card>
);

// Overall Rating Component
const OverallRating: React.FC<{
  rating: number;
  totalReviews: number;
}> = ({ rating, totalReviews }) => (
  <div className="flex items-center mb-4">
    <StarRating rating={rating} />
    <span className="ml-2 text-xs text-gray-600">
      {rating.toFixed(1)} stars - Over {totalReviews.toLocaleString()} reviews
    </span>
  </div>
);

// Main Component
export const ReviewSection: React.FC<ReviewSectionProps> = ({
  reviews,
  overallRating,
  totalReviews
}) => {
  if (!reviews?.length) {
    return (
      <div className="mb-4 border border-gray-200 rounded-sm shadow-sm p-4">
        <h3 className="font-bold text-base text-gray-800 mb-2">Reviews</h3>
        <p className="text-sm text-gray-500">No reviews available yet.</p>
      </div>
    );
  }

  return (
    <div className="mb-4 border border-gray-200 rounded-sm shadow-sm p-4">
      <h3 className="font-bold text-base text-gray-800 mb-2">Reviews</h3>

      <OverallRating rating={overallRating} totalReviews={totalReviews} />

      <Separator className="mb-4" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {reviews.map((review, index) => (
          <ReviewCard key={`review-${index}`} review={review} />
        ))}
      </div>
    </div>
  );
};
