import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, Loader2, Mail, Crown, UserMinus } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminPanel() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list(),
    enabled: user?.role === "admin",
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => base44.entities.User.update(id, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-users"] }),
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteMessage(null);
    try {
      await base44.users.inviteUser(inviteEmail.trim(), "admin");
      setInviteMessage({ type: "success", text: `Admin invitation sent to ${inviteEmail}` });
      setInviteEmail("");
    } catch (e) {
      setInviteMessage({ type: "error", text: "Failed to send invitation. Please check the email and try again." });
    }
    setInviting(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="text-center py-20">
        <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">You don't have permission to access this page.</p>
      </div>
    );
  }

  const admins = users.filter((u) => u.role === "admin");
  const regularUsers = users.filter((u) => u.role !== "admin");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400 text-sm">Manage moderators and users</p>
        </div>
      </div>

      {/* Invite Admin */}
      <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-orange-400" />
            Invite New Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                placeholder="Enter email address"
                className="pl-10 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-600"
              />
            </div>
            <Button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shrink-0"
            >
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Invite Admin
            </Button>
          </div>
          {inviteMessage && (
            <p className={`mt-3 text-sm ${inviteMessage.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
              {inviteMessage.text}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Current Admins */}
      <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            Admins ({admins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-orange-500 animate-spin" /></div>
          ) : admins.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No admins found</p>
          ) : (
            <div className="space-y-3">
              {admins.map((u) => (
                <div key={u.id} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{u.full_name || "—"}</p>
                    <p className="text-slate-500 text-xs truncate">{u.email}</p>
                  </div>
                  <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 border text-xs shrink-0">
                    Admin
                  </Badge>
                  {u.id !== user.id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-red-400 shrink-0">
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-800 border-slate-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Remove Admin</AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-400">
                            Remove admin privileges from {u.full_name || u.email}? They will become a regular user.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => updateRoleMutation.mutate({ id: u.id, role: "user" })}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove Admin
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Regular Users */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-base">Users ({regularUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-orange-500 animate-spin" /></div>
          ) : regularUsers.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No regular users</p>
          ) : (
            <div className="space-y-3">
              {regularUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold shrink-0">
                    {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{u.full_name || "—"}</p>
                    <p className="text-slate-500 text-xs truncate">{u.email}</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-orange-400 gap-1.5 shrink-0">
                        <Crown className="w-3.5 h-3.5" />
                        Make Admin
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-800 border-slate-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Make Admin</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                          Grant admin privileges to {u.full_name || u.email}? They will be able to delete any post.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => updateRoleMutation.mutate({ id: u.id, role: "admin" })}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          Make Admin
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}