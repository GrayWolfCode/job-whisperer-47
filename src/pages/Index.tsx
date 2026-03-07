import { useMemo, useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { fetchProjects, type FreelancerProject } from "@/lib/freelancer-api";
import { JobRow } from "@/components/JobRow";
import { JobPagination } from "@/components/JobPagination";
import { FilterSidebar, type Filters } from "@/components/FilterSidebar";
import { Loader2 } from "lucide-react";

const ITEMS_PER_PAGE = 10;

function readFiltersFromParams(params: URLSearchParams): Filters {
  const countries = params.get("xc");
  const skills = params.get("xs");
  const reviews = params.get("xr");
  return {
    excludeCountries: countries ? countries.split(",").filter(Boolean) : [],
    excludeSkills: skills ? skills.split(",").filter(Boolean) : [],
    excludeReviewsBelow: reviews ? Number(reviews) : 0,
  };
}

function writeFiltersToParams(filters: Filters, params: URLSearchParams) {
  if (filters.excludeCountries.length) params.set("xc", filters.excludeCountries.join(","));
  else params.delete("xc");
  if (filters.excludeSkills.length) params.set("xs", filters.excludeSkills.join(","));
  else params.delete("xs");
  if (filters.excludeReviewsBelow > 0) params.set("xr", String(filters.excludeReviewsBelow));
  else params.delete("xr");
}

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Number(searchParams.get("p")) || 1;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filters, setFilters] = useState<Filters>(() => readFiltersFromParams(searchParams));

  // Fetch 100 projects with offset based on current page
  // We fetch a "window" of 100, offset by page batches
  const batchIndex = Math.floor((currentPage - 1) / 10); // each batch = 10 pages * 10 items = 100
  const batchOffset = batchIndex * 100;

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects", batchOffset],
    queryFn: () => fetchProjects(100, batchOffset),
    refetchInterval: 30000,
  });

  const projects = data?.projects ?? [];
  const totalCount = data?.totalCount ?? 0;

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (filters.excludeCountries.length > 0) {
        const country = p.owner_info?.country?.name?.toLowerCase() ?? "";
        if (filters.excludeCountries.some((c) => country.includes(c.toLowerCase()))) return false;
      }
      if (filters.excludeSkills.length > 0) {
        const skills = p.jobs.map((j) => j.name.toLowerCase());
        if (filters.excludeSkills.some((s) => skills.some((sk) => sk.includes(s.toLowerCase())))) return false;
      }
      if (filters.excludeReviewsBelow > 0) {
        const reviews = p.owner_info?.reputation?.entire_history?.all ??
          p.owner_info?.employer_reputation?.entire_history?.all ?? 0;
        if ((reviews ?? 0) < filters.excludeReviewsBelow) return false;
      }
      return true;
    });
  }, [projects, filters]);

  // Within current batch, calculate local pagination
  const localPageIndex = (currentPage - 1) % 10;
  const paginatedProjects = filteredProjects.slice(
    localPageIndex * ITEMS_PER_PAGE,
    (localPageIndex + 1) * ITEMS_PER_PAGE
  );

  // Total pages estimate
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  // Sync state to URL
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (currentPage > 1) newParams.set("p", String(currentPage));
    else newParams.delete("p");
    writeFiltersToParams(filters, newParams);
    setSearchParams(newParams, { replace: true });
  }, [currentPage, filters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFiltersChange = (f: Filters) => {
    setFilters(f);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="px-4 py-4 max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Lancer</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Live freelance projects</p>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto min-h-[calc(100vh-73px)]">
        <FilterSidebar filters={filters} onFiltersChange={handleFiltersChange} />

        <main className="flex-1 py-4 px-4">
          <div className="text-xs text-muted-foreground mb-2">
            {totalCount.toLocaleString()} total projects · Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border bg-secondary/50 rounded-t-lg">
            <span className="w-4" />
            <span className="flex-1">Job Title</span>
            <span className="hidden sm:block min-w-[80px] text-right">Bids</span>
            <span className="min-w-[100px] text-right">Budget</span>
            <span className="hidden md:block min-w-[90px] text-right">Published</span>
            <span className="w-8" />
          </div>

          <div className="bg-card border border-t-0 border-border rounded-b-lg shadow-sm">
            {isLoading && (
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading projects…
              </div>
            )}

            {error && (
              <div className="text-center py-20 text-destructive text-sm">
                Failed to load projects. Please try again.
              </div>
            )}

            {!isLoading && !error && paginatedProjects.length === 0 && (
              <div className="text-center py-20 text-muted-foreground text-sm">
                No projects match your filters.
              </div>
            )}

            {paginatedProjects.map((project) => (
              <JobRow key={project.id} project={project} />
            ))}
          </div>

          <JobPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </main>
      </div>
    </div>
  );
};

export default Index;
