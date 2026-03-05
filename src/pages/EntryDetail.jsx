import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, ArrowUp, Bookmark, BookmarkCheck, Eye, Calendar, Tag, Download, ExternalLink, Trash2
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { categoryLabels, categoryColors } from "@/components/entries/EntryCard";

export default function EntryDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const entryId = urlParams.get("id");

  const [user, setUser] = useState(null);
  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: entry, isLoading } = useQuery({
    queryKey: ["entry", entryId],
    queryFn: async () => {
      const entries = await base44.entities.TeamEntry.filter({ id: entryId });
      const e = entries[0];
      // increment view count
      base44.entities.TeamEntry.update(e.id, { view_count: (e.view_count || 0) + 1 });
      return e;
    },
    enabled: !!entryId,
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["bookmarks", user?.email],
    queryFn: () => base44.entities.Bookmark.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const isBookmarked = bookmarks.some((b) => b.entry_id === entryId);
  const hasUpvoted = entry?.upvoted_by?.includes(user?.email);

  const upvoteMutation = useMutation({
    mutationFn: async () => {
      if (!user?.email) return;
      const upvoted_by = entry.upvoted_by || [];
      if (hasUpvoted) {
        await base44.entities.TeamEntry.update(entry.id, {
          upvotes: Math.max(0, (entry.upvotes || 0) - 1),
          upvoted_by: upvoted_by.filter((e) => e !== user.email),
        });
      } else {
        await base44.entities.TeamEntry.update(entry.id, {
          upvotes: (entry.upvotes || 0) + 1,
          upvoted_by: [...upvoted_by, user.email],
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["entry", entryId] }),
  });

  const isAdmin = user?.role === "admin";

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.TeamEntry.delete(entry.id),
    onSuccess: () => navigate(createPageUrl("Home")),
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user?.email) return;
      if (isBookmarked) {
        const bm = bookmarks.find((b) => b.entry_id === entryId);
        if (bm) await base44.entities.Bookmark.delete(bm.id);
      } else {
        await base44.entities.Bookmark.create({ entry_id: entryId, user_email: user.email });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookmarks", user?.email] }),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32 bg-slate-800" />
        <Skeleton className="h-10 w-3/4 bg-slate-800" />
        <Skeleton className="h-64 w-full bg-slate-800 rounded-xl" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Entry not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Badge className={`${categoryColors[entry.category]} border text-xs font-medium`}>
            {categoryLabels[entry.category] || entry.category}
          </Badge>
          {entry.season && (
            <Badge className="bg-slate-700/50 text-slate-300 border-slate-600/50 text-xs">
              {entry.season}
            </Badge>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
          {entry.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
          <span className="font-semibold text-orange-400">Team #{entry.team_number}</span>
          {entry.team_name && <span>· {entry.team_name}</span>}
          {entry.created_date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(entry.created_date), "MMM d, yyyy")}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            {(entry.view_count || 0)} views
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <Button
          onClick={() => upvoteMutation.mutate()}
          variant="outline"
          className={`gap-2 rounded-xl border-slate-700/50 ${
            hasUpvoted
              ? "bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20 hover:text-orange-400"
              : "text-slate-400 hover:text-white bg-slate-800/50"
          }`}
        >
          <ArrowUp className="w-4 h-4" />
          {entry.upvotes || 0}
        </Button>
        <Button
          onClick={() => bookmarkMutation.mutate()}
          variant="outline"
          className={`gap-2 rounded-xl border-slate-700/50 ${
            isBookmarked
              ? "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20 hover:text-blue-400"
              : "text-slate-400 hover:text-white bg-slate-800/50"
          }`}
        >
          {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {isBookmarked ? "Saved" : "Save"}
        </Button>

        {isAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-400 ml-auto">
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-800 border-slate-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Delete Entry</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  Are you sure you want to delete "{entry.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Images */}
      {entry.image_urls?.length > 0 && (
        <div className="mb-8 grid gap-3">
          {entry.image_urls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${entry.title} image ${i + 1}`}
              className="w-full rounded-xl border border-slate-700/30 object-cover max-h-96"
            />
          ))}
        </div>
      )}

      {/* Description */}
      {entry.description && (
        <Card className="bg-slate-800/30 border-slate-700/30 mb-6">
          <CardContent className="p-5">
            <p className="text-white leading-relaxed">{entry.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {entry.content && (
        <Card className="bg-slate-800/30 border-slate-700/30 mb-6">
          <CardContent className="p-5 md:p-8">
            <div className="prose prose-invert prose-sm max-w-none prose-p:text-white prose-headings:text-white prose-a:text-orange-400 prose-code:text-orange-300 prose-code:bg-slate-900/80 prose-pre:bg-slate-900/80">
              <ReactMarkdown>{entry.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {entry.tags?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <Tag className="w-4 h-4 text-slate-500" />
          {entry.tags.map((tag) => (
            <Badge key={tag} className="bg-slate-800/50 text-slate-400 border-slate-700/30 text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Files */}
      {entry.file_urls?.length > 0 && (
        <Card className="bg-slate-800/30 border-slate-700/30">
          <CardContent className="p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Attachments</h3>
            <div className="space-y-2">
              {entry.file_urls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-slate-900/50 px-4 py-3 rounded-lg hover:bg-slate-900/80 transition-colors group"
                >
                  <Download className="w-4 h-4 text-slate-500 group-hover:text-orange-400" />
                  <span className="text-slate-300 text-sm flex-1 truncate">{url.split("/").pop()}</span>
                  <ExternalLink className="w-4 h-4 text-slate-600" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}