"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddFormModal } from "@/components/forms/add-form-modal";
import { useRouter } from "next/navigation";

interface Brand {
    id: string;
    name: string;
    logo_url: string | null;
}

export function CreateFormButton({ brands }: { brands: Brand[] }) {
  const router = useRouter();

  return (
    <AddFormModal
      brands={brands}
      trigger={
        <Button className="rounded-full px-6 gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Create Form
        </Button>
      }
      onCreated={() => {
        router.refresh();
      }}
    />
  );
}
