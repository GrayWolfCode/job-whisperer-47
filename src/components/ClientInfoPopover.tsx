import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Star, MapPin, CheckCircle } from "lucide-react";
import type { FreelancerProject } from "@/lib/freelancer-api";

interface Props {
  project: FreelancerProject;
  children: React.ReactNode;
}

export function ClientInfoPopover({ project, children }: Props) {
  const owner = project.owner_info;
  const rep = owner?.reputation?.entire_history ?? owner?.employer_reputation?.entire_history;
  const rating = rep?.overall ?? 0;
  const reviews = rep?.all ?? 0;
  const country = owner?.country?.name ?? "Unknown";
  const paymentVerified = owner?.status?.payment_verified ?? false;

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64 p-4 space-y-3 bg-card border-border shadow-lg">
        <div className="text-sm font-semibold text-card-foreground">Client Info</div>

        {paymentVerified && (
          <div className="flex items-center gap-1.5 text-xs text-success">
            <CheckCircle className="w-3.5 h-3.5" />
            Payment verified
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < Math.round(rating) ? "fill-stars text-stars" : "text-muted-foreground"}`}
            />
          ))}
          <span className="text-xs text-muted-foreground">
            {rating.toFixed(1)} of {reviews} reviews
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          {country}
        </div>
      </PopoverContent>
    </Popover>
  );
}
