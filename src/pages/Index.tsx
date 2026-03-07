import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects, type FreelancerProject } from "@/lib/freelancer-api";
import { JobRow } from "@/components/JobRow";
import { JobPagination } from "@/components/JobPagination";
import { FilterSidebar, type Filters } from "@/components/FilterSidebar";
import { Loader2 } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    excludeCountries: [],
    excludeSkills: [],
    excludeReviewsBelow: 0,
  });

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchProjects(100),
    refetchInterval: 30000,
  });

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      // Exclude countries
      if (filters.excludeCountries.length > 0) {
        const country = p.owner_info?.country?.name?.toLowerCase() ?? "";
        if (filters.excludeCountries.some((c) => country.includes(c.toLowerCase()))) return false;
      }
      // Exclude skills
      if (filters.excludeSkills.length > 0) {
        const skills = p.jobs.map((j) => j.name.toLowerCase());
        if (filters.excludeSkills.some((s) => skills.some((sk) => sk.includes(s.toLowerCase())))) return false;
      }
      // Exclude reviews below threshold
      if (filters.excludeReviewsBelow > 0) {
        const reviews = p.owner_info?.reputation?.entire_history?.all ??
          p.owner_info?.employer_reputation?.entire_history?.all ?? 0;
        if ((reviews ?? 0) < filters.excludeReviewsBelow) return false;
      }
      return true;
    });
  }, [projects, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProjects = filteredProjects.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset to page 1 when filters change
  const handleFiltersChange = (f: Filters) => {
    setFilters(f);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="px-4 py-4 max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Lancer</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Live freelance projects</p>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto min-h-[calc(100vh-73px)]">
        <FilterSidebar filters={filters} onFiltersChange={handleFiltersChange} />

        <main className="flex-1 py-4 px-4">
          {/* Results count */}
          <div className="text-xs text-muted-foreground mb-2">
            {filteredProjects.length} projects · Page {safePage} of {totalPages}
          </div>

          {/* Table header */}
          <div className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border bg-secondary/50 rounded-t-lg">
            <span className="w-4" />
            <span className="flex-1">Job Title</span>
            <span className="hidden sm:block min-w-[80px] text-right">Bids</span>
            <span className="min-w-[100px] text-right">Budget</span>
            <span className="hidden md:block min-w-[90px] text-right">Published</span>
            <span className="w-8" />
          </div>

          {/* Content */}
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

          {/* Pagination */}
          <JobPagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </main>
      </div>
    </div>
  );
};

export default Index;
