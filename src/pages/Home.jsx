import React, { useState, useMemo } from "react";
import { entryService } from "@/api/firebaseClient";
import { useQuery } from "@tanstack/react-query";
import EntryCard from "@/components/entries/EntryCard";
import CategoryFilter from "@/components/entries/CategoryFilter";
import SearchBar from "@/components/entries/SearchBar";
import EmptyState from "@/components/entries/EmptyState";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["entries"],
    queryFn: () => entryService.getAllEntries(200),
  });

  const filtered = useMemo(() => {
    let result = entries;

    if (category !== "all") {
      result = result.filter((e) => e.category === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.team_number?.toLowerCase().includes(q) ||
          e.team_name?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === "popular") {
      result = [...result].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (sortBy === "views") {
      result = [...result].sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    }

    return result;
  }, [entries, category, search, sortBy]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Explore Resources
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Discover and share knowledge with the FTC community
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40 bg-slate-800/50 border-slate-700/50 text-slate-300 rounded-xl h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="popular">Most Upvoted</SelectItem>
            <SelectItem value="views">Most Viewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <CategoryFilter selected={category} onChange={setCategory} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No entries found"
          description={search || category !== "all" ? "Try adjusting your search or filters" : "Be the first to share a resource with the community!"}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}