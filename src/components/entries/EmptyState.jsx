import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Inbox } from "lucide-react";

export default function EmptyState({ title, description, showCreate = true }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-6">
        <Inbox className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-sm mb-6">{description}</p>
      {showCreate && (
        <Link to={createPageUrl("CreateEntry")}>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2 rounded-xl">
            <Plus className="w-4 h-4" />
            Create Entry
          </Button>
        </Link>
      )}
    </div>
  );
}