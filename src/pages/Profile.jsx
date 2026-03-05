import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { userService } from "@/api/firebaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User, Save } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState(user?.username || "");

  const updateProfileMutation = useMutation({
    mutationFn: async (updates) => {
      await userService.updateUserProfile(user.uid, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", user.uid] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({ username: username.trim() });
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-slate-400">Manage your account settings and preferences.</p>
      </div>

      <Card className="bg-slate-800/30 border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-slate-900/50 border-slate-600 text-slate-300"
              />
              <p className="text-xs text-slate-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="bg-slate-900/50 border-slate-600 text-white"
                maxLength={30}
              />
              <p className="text-xs text-slate-500">
                Choose a unique username that will be displayed with your comments and messages.
              </p>
            </div>

            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}