import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, User, Clock, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClientInfoPopover } from "@/components/ClientInfoPopover";
import type { FreelancerProject } from "@/lib/freelancer-api";
import { getProjectUrl, formatTimeAgo } from "@/lib/freelancer-api";

interface Props {
  project: FreelancerProject;
}

export function JobRow({ project }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { title, budget, currency, description, jobs, bid_stats, id, time_submitted, type } = project;
  const isHourly = type === "hourly";

  return (
    <div className="border-b border-border last:border-b-0">
      {/* Summary row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-muted-foreground">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>

        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{title}</span>
          <Badge variant="outline" className="text-[10px] shrink-0 gap-1 px-1.5 py-0">
            {isHourly ? <Clock className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
            {isHourly ? "Hourly" : "Fixed"}
          </Badge>
        </div>

        {/* Bids info */}
        <div className="hidden sm:flex flex-col items-end text-xs text-muted-foreground min-w-[80px]">
          <span>{bid_stats.bid_count} bids</span>
          {bid_stats.bid_avg !== null && (
            <span>Avg: {currency.sign}{Math.round(bid_stats.bid_avg)}</span>
          )}
        </div>

        {/* Budget */}
        <div className="text-sm font-semibold text-budget min-w-[100px] text-right">
          {currency.sign}{budget.minimum} - {currency.sign}{budget.maximum}
        </div>

        {/* Time */}
        <div className="text-xs text-muted-foreground min-w-[90px] text-right hidden md:block">
          {formatTimeAgo(time_submitted)}
        </div>

        {/* Client info trigger */}
        <ClientInfoPopover project={project}>
          <button
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <User className="w-4 h-4" />
          </button>
        </ClientInfoPopover>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pl-11 space-y-3 bg-card/50">
          <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
            {description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {jobs.map((job) => (
              <Badge key={job.id} variant="secondary" className="text-xs font-normal">
                {job.name}
              </Badge>
            ))}
          </div>

          <a
            href={getProjectUrl(id)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1.5 text-link border-link hover:bg-primary/5">
              Open project <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}
