"use client";

import { useState, useEffect } from "react";
import { Users as UsersIcon, Shield, Ban, CheckCircle, Trash2, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/shadcn_ui/button";
import { Skeleton } from "@/components/ui/shadcn_ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/shadcn_ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/shadcn_ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/shadcn_ui/tooltip";
import { Textarea } from "@/components/ui/shadcn_ui/textarea";
import { getUsers, updateUser, deleteUser, UserRole, type UserType } from "@/lib/api/user-api/user-endpoints";
import { useAuthStore } from "@/lib/store/authStore";
import { useDashboardContext } from "@/lib/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn_ui/card";
import { Input } from "@/components/ui/shadcn_ui/input";
import { Label } from "@/components/ui/shadcn_ui/label";

export default function UsersDashboard() {
  const currentUser = useAuthStore((state) => state.user);
  const { searchQuery, setSearchQuery } = useDashboardContext();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ban state
  const [banTarget, setBanTarget] = useState<UserType | null>(null);
  const [banReason, setBanReason] = useState("");
  const [isBanning, setIsBanning] = useState(false);

  // Unban state
  const [unbanTarget, setUnbanTarget] = useState<UserType | null>(null);
  const [isUnbanning, setIsUnbanning] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<UserType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleBan = async () => {
    if (!banTarget) return;
    setIsBanning(true);
    try {
      const reason = banReason.trim() || undefined;
      console.log("Sending ban with reason:", { userId: banTarget.id, isBanned: true, bannedReason: reason });
      const updated = await updateUser(banTarget.id, { isBanned: true, bannedReason: reason });
      console.log("Ban response:", updated);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
      setBanTarget(null);
      setBanReason("");
    } catch (err) {
      console.error("Ban error:", err);
    } finally {
      setIsBanning(false);
    }
  };

  const handleUnban = async () => {
    if (!unbanTarget) return;
    setIsUnbanning(true);
    try {
      const updated = await updateUser(unbanTarget.id, { isBanned: false, bannedReason: "" });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
      setUnbanTarget(null);
    } catch (err) {
      console.error("Unban error:", err);
    } finally {
      setIsUnbanning(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = searchQuery
    ? users.filter(
        (u) =>
          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : users;

  const stats = [
    { label: "Total Users", value: users.length, icon: UsersIcon },
    { label: "Active", value: users.filter((u) => !u.isBanned).length, icon: CheckCircle },
    { label: "Banned", value: users.filter((u) => u.isBanned).length, icon: Ban },
    { label: "Admins", value: users.filter((u) => u.role === UserRole.Admin).length, icon: Shield },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-title">Users Management</h1>
          <p className="text-description text-sm mt-1">Manage platform users and permissions</p>
        </div>

        {/* Search */}
        <div className="relative bg-card-bg p-5 rounded-soft">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 size-4 text-description pointer-events-none " />
          <Input
            type="search"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card-main rounded-soft border-0 focus-visible:ring-accent/40 text-title placeholder:text-description "
          />
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card-bg rounded-soft border-0 shadow-none py-4">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-0 mb-2">
                <CardTitle className="text-description text-xs font-medium uppercase">{stat.label}</CardTitle>
                <div className="bg-accent/10 p-2 rounded-soft">
                  <stat.icon className="size-3.5 text-accent" />
                </div>
              </CardHeader>
              <CardContent className="px-4 py-0">
                {isLoading ? (
                  <Skeleton className="h-6 w-12 rounded-soft bg-card-main" />
                ) : (
                  <p className="text-xl font-bold text-title">{stat.value}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card-bg rounded-soft overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-soft bg-card-main" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-description text-sm">{searchQuery ? `No users matching "${searchQuery}"` : "No users found"}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="">
                    <TableCell className="px-3">{user.username}</TableCell>
                    <TableCell className="text-description text-sm">{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === UserRole.Admin
                            ? "bg-accent/15 text-accent"
                            : user.role === UserRole.User
                              ? "bg-warning/15 text-warning"
                              : "bg-card-main text-description"
                        }`}
                      >
                        {user.role === UserRole.Admin && <Shield className="size-3" />}
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            user.isBanned ? "bg-error/15 text-error" : "bg-success/15 text-success"
                          }`}
                        >
                          {user.isBanned ? (
                            <>
                              <Ban className="size-3" />
                              Banned
                            </>
                          ) : (
                            <>
                              <CheckCircle className="size-3" />
                              Active
                            </>
                          )}
                        </span>
                        {/* Ban Tooltip */}
                        {user.isBanned && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-error/20 hover:bg-error/30 text-error transition-colors">
                                <HelpCircle className="size-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-error/90 text-white rounded-soft px-3 py-2">
                              <div>
                                <p className="text-xs font-semibold">Ban Reason:</p>
                                <p className="text-xs mt-1">{user.bannedReason || "No reason provided"}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-description text-sm">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {user.isBanned ? (
                          <Button
                            variant="grayFill"
                            size="flexible"
                            className="rounded-soft text-xs"
                            onClick={() => setUnbanTarget(user)}
                            disabled={user.id === currentUser?.userId}
                          >
                            <CheckCircle className="size-3" />
                            Unban
                          </Button>
                        ) : (
                          <Button
                            variant="grayFill"
                            size="flexible"
                            className="rounded-soft px-2 py-1 text-xs"
                            onClick={() => setBanTarget(user)}
                            disabled={user.id === currentUser?.userId}
                          >
                            <Ban className="size-3" />
                            Ban
                          </Button>
                        )}
                        <Button
                          variant="grayFill"
                          size="icon"
                          className="rounded-soft px-2 py-1 text-xs text-error hover:bg-error/20"
                          onClick={() => setDeleteTarget(user)}
                          disabled={user.id === currentUser?.userId || user.role === UserRole.Admin}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Ban Dialog */}
        <Dialog open={!!banTarget} onOpenChange={() => setBanTarget(null)}>
          <DialogContent className="bg-card-bg rounded-soft border-0">
            <DialogHeader>
              <DialogTitle className="text-title">Ban User</DialogTitle>
              <DialogDescription className="text-description">
                Ban <span className="font-semibold">{banTarget?.username}</span> from the platform?
              </DialogDescription>
            </DialogHeader>
            <div className="">
              <Label>Reason (optional)</Label>
              <Textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter ban reason..."
                className="bg-card-main resize-none rounded-soft "
                rows={3}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setBanTarget(null)} disabled={isBanning} className="rounded-soft">
                Cancel
              </Button>
              <Button variant="fill" onClick={handleBan} disabled={isBanning} className="rounded-soft bg-error hover:bg-error/80">
                {isBanning ? "Banning..." : "Ban User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Unban Dialog */}
        <Dialog open={!!unbanTarget} onOpenChange={() => setUnbanTarget(null)}>
          <DialogContent className="bg-card-bg rounded-soft border-0">
            <DialogHeader>
              <DialogTitle className="text-title">Unban User</DialogTitle>
              <DialogDescription className="text-description">
                Restore access for <span className="font-semibold">{unbanTarget?.username}</span> ?
              </DialogDescription>
            </DialogHeader>
            {unbanTarget?.bannedReason && (
              <div className="py-3">
                <p className="text-xs text-description mb-1">Ban reason:</p>
                <p className="text-sm text-title bg-card-main rounded-soft p-2">{unbanTarget.bannedReason}</p>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setUnbanTarget(null)} disabled={isUnbanning} className="rounded-soft">
                Cancel
              </Button>
              <Button variant="fill" onClick={handleUnban} disabled={isUnbanning} className="rounded-soft">
                {isUnbanning ? "Unbanning..." : "Unban User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="bg-card-bg rounded-soft border-0">
            <DialogHeader>
              <DialogTitle className="text-error">Delete User</DialogTitle>
              <DialogDescription className="text-description">
                Permanently delete <span className="font-semibold">{deleteTarget?.username}</span>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-soft">
                Cancel
              </Button>
              <Button
                variant="fill"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-soft bg-error hover:bg-error/80"
              >
                {isDeleting ? "Deleting..." : "Delete User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
