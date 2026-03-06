import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categoryLabels = {
  robot_design: "Robot Design",
  programming: "Programming",
  strategy: "Strategy",
  outreach: "Outreach",
  engineering_notebook: "Engineering Notebook",
  cad: "CAD",
  autonomous: "Autonomous",
  teleop: "TeleOp",
  other: "Other",
};

const categoryColors = {
  robot_design: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  programming: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  strategy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  outreach: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  engineering_notebook: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  cad: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  autonomous: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  teleop: "bg-red-500/10 text-red-400 border-red-500/20",
  other: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function EntryCard({ entry }) {
  return (
    <Link to={createPageUrl("EntryDetail") + `?id=${entry.id}`}>
      <Card className="bg-slate-800/50 border-slate-700/50 hover:border-orange-500/30 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer group overflow-hidden">
        {entry.image_urls?.[0] && (
          <div className="h-40 overflow-hidden">
            <img
              src={entry.image_urls[0]}
              alt={entry.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Badge className={`${categoryColors[entry.category]} border text-xs font-medium`}>
                {categoryLabels[entry.category] || entry.category}
              </Badge>
              {entry.is_official && (
                <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs font-medium">
                  Official
                </Badge>
              )}
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              #{entry.team_number}
            </span>
          </div>

          <h3 className="text-white font-semibold text-lg leading-tight mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">
            {entry.title}
          </h3>

          {entry.description && (
            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">
              {entry.description}
            </p>
          )}

          {entry.team_name && (
            <p className="text-slate-500 text-xs mb-4">{entry.team_name}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ArrowUp className="w-3.5 h-3.5" />
              {entry.upvotes || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              {entry.view_count || 0}
            </span>
            {entry.tags?.length > 0 && (
              <div className="flex gap-1 ml-auto overflow-hidden">
                {entry.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="bg-slate-700/50 px-2 py-0.5 rounded-full text-slate-400 truncate max-w-[80px]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export { categoryLabels, categoryColors };