import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  UserPlus,
  Loader2,
  Mail,
  Crown,
  UserMinus,
  Ban,
  CheckCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
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
    enabled: user?.role === "admin"
  });

  // SECURITY WRAPPER
  const secureUpdateRole = async (targetUser, role) => {
    if (user.role !== "admin") throw new Error("Unauthorized");

    if (targetUser.id === user.id && role !== "admin") {
      throw new Error("You cannot remove your own admin role.");
    }

    await base44.entities.User.update(targetUser.id, { role });

    await base44.entities.AdminLog.create({
      admin_id: user.id,
      action: role === "admin" ? "promote_admin" : "remove_admin",
      target_user: targetUser.id
    });
  };

  const updateRoleMutation = useMutation({
    mutationFn: ({ userObj, role }) => secureUpdateRole(userObj, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-users"] })
  });

  // BAN / UNBAN MUTATION
  const banUserMutation = useMutation({
    mutationFn: async ({ targetUser, banned }) => {
      if (user.role !== "admin") throw new Error("Unauthorized");

      await base44.entities.User.update(targetUser.id, { banned });

      await base44.entities.AdminLog.create({
        admin_id: user.id,
        action: banned ? "ban_user" : "unban_user",
        target_user: targetUser.id
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-users"] })
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setInviteMessage(null);

    try {
      await base44.users.inviteUser(inviteEmail.trim(), "admin");

      await base44.entities.AdminLog.create({
        admin_id: user.id,
        action: "invite_admin",
        target_user: inviteEmail
      });

      setInviteMessage({
        type: "success",
        text: `Admin invitation sent to ${inviteEmail}`
      });

      setInviteEmail("");
    } catch {
      setInviteMessage({
        type: "error",
        text: "Failed to send invitation."
      });
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
        <p className="text-slate-400">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  const admins = users.filter((u) => u.role === "admin");
  const regularUsers = users.filter((u) => u.role !== "admin");

  return (
    <div className="max-w-3xl mx-auto">

      {/* INVITE ADMIN */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Invite Admin</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex gap-3">
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email"
            />

            <Button onClick={handleInvite} disabled={inviting}>
              {inviting ? <Loader2 className="animate-spin" /> : <UserPlus />}
              Invite
            </Button>
          </div>

          {inviteMessage && (
            <p className="text-sm mt-2">{inviteMessage.text}</p>
          )}
        </CardContent>
      </Card>

      {/* ADMINS */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Admins ({admins.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {admins.map((u) => (
            <div key={u.id} className="flex items-center gap-3 py-2">

              <div className="flex-1">
                <p>{u.full_name || "—"}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>

              <Badge>Admin</Badge>

              {u.id !== user.id && (
                <Button
                  onClick={() =>
                    updateRoleMutation.mutate({ userObj: u, role: "user" })
                  }
                >
                  <UserMinus />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* USERS */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({regularUsers.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {regularUsers.map((u) => (
            <div key={u.id} className="flex items-center gap-3 py-2">

              <div className="flex-1">
                <p>{u.full_name || "—"}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>

              {u.banned && (
                <Badge className="bg-red-500/10 text-red-400">
                  Banned
                </Badge>
              )}

              <Button
                onClick={() =>
                  updateRoleMutation.mutate({ userObj: u, role: "admin" })
                }
              >
                <Crown /> Make Admin
              </Button>

              {u.banned ? (
                <Button
                  onClick={() =>
                    banUserMutation.mutate({ targetUser: u, banned: false })
                  }
                >
                  <CheckCircle /> Unban
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    banUserMutation.mutate({ targetUser: u, banned: true })
                  }
                >
                  <Ban /> Ban
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
