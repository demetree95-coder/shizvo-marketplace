import { HiStar } from "react-icons/hi2";
import { ReviewType } from "@/types";
import { formatDate } from "@/lib/utils";

interface Props {
  review: ReviewType;
}

export default function ReviewCard({ review }: Props) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary">
          {review.user.fullName.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-sm">{review.user.fullName}</p>
          <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
        </div>
      </div>
      <div className="flex items-center gap-0.5 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <HiStar key={star} className={`w-4 h-4 ${star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-200"}`} />
        ))}
      </div>
      {review.comment && <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
    </div>
  );
}
