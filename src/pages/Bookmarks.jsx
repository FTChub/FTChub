import React from "react";
import { entryService, bookmarkService } from "@/api/firebaseClient";
import { useQuery } from "@tanstack/react-query";
import EntryCard from "@/components/entries/EntryCard";
import EmptyState from "@/components/entries/EmptyState";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function Bookmarks() {
  const { user } = useAuth();

  const { data: bookmarks = [], isLoading: loadingBm } = useQuery({
    queryKey: ["bookmarks", user?.email],
    queryFn: () => bookmarkService.getBookmarksByUser(user?.email),
    enabled: !!user?.email,
  });

  const { data: allEntries = [], isLoading: loadingEntries } = useQuery({
    queryKey: ["entries-for-bookmarks"],
    queryFn: () => entryService.getAllEntries(500),
    enabled: bookmarks.length > 0,
  });

  const bookmarkedEntries = allEntries.filter((e) =>
    bookmarks.some((b) => b.entry_id === e.id)
  );

  const isLoading = loadingBm || (bookmarks.length > 0 && loadingEntries);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Bookmarks</h1>
        <p className="text-slate-400 text-sm">Resources you've saved for later</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      ) : bookmarkedEntries.length === 0 ? (
        <EmptyState
          title="No bookmarks yet"
          description="Save posts you find useful and they'll appear here"
          showCreate={false}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarkedEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}