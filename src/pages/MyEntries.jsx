import React from "react";
import { entryService } from "@/api/firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import EntryCard from "@/components/entries/EntryCard";
import EmptyState from "@/components/entries/EmptyState";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/AuthContext";

export default function MyEntries() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["my-entries", user?.email],
    queryFn: () => entryService.getEntriesByUser(user?.email),
    enabled: !!user?.email,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => entryService.deleteEntry(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-entries"] }),
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Entries</h1>
        <p className="text-slate-400 text-sm">Manage the resources you've shared</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          title="No entries yet"
          description="You haven't shared any resources with the community yet"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <div key={entry.id} className="relative group">
              <EntryCard entry={entry} />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 bg-red-500/20 hover:bg-red-500/40 text-red-400"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Trash2 className="w-4 h-4" />
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
                      <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate(entry.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}