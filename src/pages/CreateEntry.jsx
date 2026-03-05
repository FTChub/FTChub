import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, X, Loader2, Plus, Send } from "lucide-react";

const categories = [
  { value: "robot_design", label: "Robot Design" },
  { value: "programming", label: "Programming" },
  { value: "strategy", label: "Strategy" },
  { value: "outreach", label: "Outreach" },
  { value: "engineering_notebook", label: "Engineering Notebook" },
  { value: "cad", label: "CAD" },
  { value: "autonomous", label: "Autonomous" },
  { value: "teleop", label: "TeleOp" },
  { value: "other", label: "Other" },
];

export default function CreateEntry() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    team_number: "",
    team_name: "",
    title: "",
    description: "",
    category: "",
    season: "",
    tags: [],
    content: "",
    image_urls: [],
    file_urls: [],
  });

  const updateField = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      updateField("tags", [...form.tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    updateField("tags", form.tags.filter((t) => t !== tag));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    updateField("image_urls", [...form.image_urls, ...urls]);
    setUploading(false);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    updateField("file_urls", [...form.file_urls, ...urls]);
    setUploading(false);
  };

  const handleSubmit = async () => {
    setSaving(true);
    await base44.entities.TeamEntry.create({
      ...form,
      upvotes: 0,
      upvoted_by: [],
      view_count: 0,
    });
    navigate(createPageUrl("Home"));
  };

  const isValid = form.team_number && form.title && form.category;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-white mb-2">Share a Resource</h1>
      <p className="text-slate-400 text-sm mb-8">Help the FTC community by sharing your team's knowledge</p>

      <div className="space-y-6">
        {/* Team Info */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-base">Team Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-sm">Team Number *</Label>
                <Input
                  value={form.team_number}
                  onChange={(e) => updateField("team_number", e.target.value)}
                  placeholder="e.g. 12345"
                  className="mt-1.5 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-600"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Team Name</Label>
                <Input
                  value={form.team_name}
                  onChange={(e) => updateField("team_name", e.target.value)}
                  placeholder="e.g. Tech Titans"
                  className="mt-1.5 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-600"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Season</Label>
              <Input
                value={form.season}
                onChange={(e) => updateField("season", e.target.value)}
                placeholder="e.g. INTO THE DEEP 2024-2025"
                className="mt-1.5 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Entry Details */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-base">Entry Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300 text-sm">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Give your entry a clear title"
                className="mt-1.5 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-600"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Category *</Label>
              <Select value={form.category} onValueChange={(v) => updateField("category", v)}>
                <SelectTrigger className="mt-1.5 bg-slate-900/50 border-slate-700/50 text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Short Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Brief summary of your resource"
                rows={2}
                className="mt-1.5 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-600"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Full Content</Label>
              <Textarea
                value={form.content}
                onChange={(e) => updateField("content", e.target.value)}
                placeholder="Share detailed information, instructions, tips..."
                rows={8}
                className="mt-1.5 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-base">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-600"
              />
              <Button onClick={addTag} variant="ghost" size="icon" className="text-slate-400 hover:text-white shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <Badge key={tag} className="bg-slate-700/50 text-slate-300 border-slate-600/50 gap-1.5 pr-1.5">
                    {tag}
                    <button onClick={() => removeTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Uploads */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-base">Attachments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">Images</Label>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-700/50 rounded-xl py-6 cursor-pointer hover:border-orange-500/30 transition-colors">
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-slate-500" />
                    <span className="text-slate-500 text-sm">Click to upload images</span>
                  </>
                )}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>
              {form.image_urls.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {form.image_urls.map((url, i) => (
                    <div key={i} className="relative shrink-0">
                      <img src={url} alt="" className="w-20 h-20 rounded-lg object-cover" />
                      <button
                        onClick={() => updateField("image_urls", form.image_urls.filter((_, j) => j !== i))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">Files</Label>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-700/50 rounded-xl py-6 cursor-pointer hover:border-orange-500/30 transition-colors">
                <Upload className="w-5 h-5 text-slate-500" />
                <span className="text-slate-500 text-sm">Click to upload files</span>
                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
              </label>
              {form.file_urls.length > 0 && (
                <div className="space-y-2 mt-3">
                  {form.file_urls.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-lg">
                      <span className="text-slate-400 text-sm flex-1 truncate">{url.split("/").pop()}</span>
                      <button onClick={() => updateField("file_urls", form.file_urls.filter((_, j) => j !== i))}>
                        <X className="w-4 h-4 text-slate-500 hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSubmit}
          disabled={!isValid || saving}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white h-12 rounded-xl text-base font-semibold gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          Publish Entry
        </Button>
      </div>
    </div>
  );
}