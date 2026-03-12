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
        <Button className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-11 px-6 font-semibold shadow-lg shadow-black/10">
          <Plus className="w-5 h-5" />
          Create Form
        </Button>
      }
      onCreated={() => {
        router.refresh();
      }}
    />
  );
}
