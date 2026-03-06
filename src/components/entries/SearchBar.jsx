import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search posts..." }) {
  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-orange-500/20 h-11 rounded-xl"
      />
    </div>
  );
}