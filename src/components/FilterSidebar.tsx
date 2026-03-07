import { useState } from "react";
import { X, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

export interface Filters {
  excludeCountries: string[];
  excludeSkills: string[];
  excludeReviewsBelow: number;
}

interface Props {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function FilterSidebar({ filters, onFiltersChange }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [countryInput, setCountryInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const addCountry = () => {
    const v = countryInput.trim();
    if (v && !filters.excludeCountries.includes(v)) {
      onFiltersChange({ ...filters, excludeCountries: [...filters.excludeCountries, v] });
    }
    setCountryInput("");
  };

  const removeCountry = (c: string) => {
    onFiltersChange({ ...filters, excludeCountries: filters.excludeCountries.filter((x) => x !== c) });
  };

  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !filters.excludeSkills.includes(v)) {
      onFiltersChange({ ...filters, excludeSkills: [...filters.excludeSkills, v] });
    }
    setSkillInput("");
  };

  const removeSkill = (s: string) => {
    onFiltersChange({ ...filters, excludeSkills: filters.excludeSkills.filter((x) => x !== s) });
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-4 gap-2 w-10 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)} className="text-muted-foreground">
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Filter className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card p-4 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Filter className="w-4 h-4" /> Filters
        </h2>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setCollapsed(true)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      <Separator />

      {/* Exclude Countries */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Exclude countries:</label>
        <div className="flex gap-1">
          <Input
            value={countryInput}
            onChange={(e) => setCountryInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCountry()}
            placeholder="e.g. India"
            className="h-8 text-xs"
          />
          <Button variant="secondary" size="sm" className="h-8 px-2 text-xs" onClick={addCountry}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {filters.excludeCountries.map((c) => (
            <Badge key={c} variant="outline" className="text-xs gap-1 pr-1">
              {c}
              <button onClick={() => removeCountry(c)} className="hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Exclude Skills */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Exclude skills:</label>
        <div className="flex gap-1">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
            placeholder="e.g. PHP"
            className="h-8 text-xs"
          />
          <Button variant="secondary" size="sm" className="h-8 px-2 text-xs" onClick={addSkill}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {filters.excludeSkills.map((s) => (
            <Badge key={s} variant="outline" className="text-xs gap-1 pr-1">
              {s}
              <button onClick={() => removeSkill(s)} className="hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Exclude Reviews */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground">
          Exclude reviews below: <span className="text-foreground font-semibold">{filters.excludeReviewsBelow}</span>
        </label>
        <Slider
          value={[filters.excludeReviewsBelow]}
          onValueChange={([v]) => onFiltersChange({ ...filters, excludeReviewsBelow: v })}
          min={0}
          max={100}
          step={1}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0</span>
          <span>100</span>
        </div>
      </div>
    </aside>
  );
}
