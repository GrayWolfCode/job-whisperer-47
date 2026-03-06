import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/lib/freelancer-api";
import { JobRow } from "@/components/JobRow";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchProjects(100),
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container max-w-5xl py-4">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Lancer</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Live freelance projects</p>
        </div>
      </header>

      <main className="container max-w-5xl py-4">
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

          {projects?.map((project) => (
            <JobRow key={project.id} project={project} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
