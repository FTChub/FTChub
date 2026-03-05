import React from "react";
import { Button } from "@/components/ui/button";
import {
  Cpu, Code, Target, Heart, BookOpen, Box, Zap, Gamepad2, MoreHorizontal, LayoutGrid
} from "lucide-react";

const categories = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "robot_design", label: "Robot Design", icon: Cpu },
  { value: "programming", label: "Programming", icon: Code },
  { value: "strategy", label: "Strategy", icon: Target },
  { value: "cad", label: "CAD", icon: Box },
  { value: "autonomous", label: "Autonomous", icon: Zap },
  { value: "teleop", label: "TeleOp", icon: Gamepad2 },
  { value: "engineering_notebook", label: "Notebook", icon: BookOpen },
  { value: "outreach", label: "Outreach", icon: Heart },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

export default function CategoryFilter({ selected, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          onClick={() => onChange(value)}
          className={`shrink-0 gap-2 rounded-full px-4 transition-all ${
            selected === value
              ? "bg-orange-500/15 text-orange-400 hover:bg-orange-500/20 hover:text-orange-400"
              : "text-slate-400 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm">{label}</span>
        </Button>
      ))}
    </div>
  );
}