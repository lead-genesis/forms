"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updatePage } from "@/app/actions/pages";
import type { BrandPage } from "@/app/actions/pages";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface PageStatusToggleProps {
  page: BrandPage;
  showLabel?: boolean;
}

export function PageStatusToggle({ page, showLabel = true }: PageStatusToggleProps) {
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(page.is_published);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(page.is_published);

  useEffect(() => {
    setIsPublished(page.is_published);
  }, [page.is_published]);

  const handleToggle = (checked: boolean) => {
    setPendingStatus(checked);
    setIsDialogOpen(true);
  };

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      const res = await updatePage(page.id, { is_published: pendingStatus });
      if (!res.error) {
        setIsPublished(pendingStatus);
        toast.success(`Page marked as ${pendingStatus ? "Published" : "Draft"}`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update page status");
      }
    } catch (e: any) {
      toast.error("Failed to update page status", { description: e.message });
    } finally {
      setIsPending(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={isPublished}
        onCheckedChange={handleToggle}
        disabled={isPending}
        id={`publish-toggle-${page.id}`}
      />
      {showLabel && (
        <Label htmlFor={`publish-toggle-${page.id}`} className="text-sm font-medium">
          {isPublished ? "Published" : "Draft"}
        </Label>
      )}

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatus ? "Publish Page?" : "Unpublish Page?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus
                ? "This will make the page accessible to the public via its URL. Proceed?"
                : "This will make the page a draft and remove it from public view. Proceed?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e: any) => { e.preventDefault(); handleConfirm(); }} disabled={isPending}>
              {isPending ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
