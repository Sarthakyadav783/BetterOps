"use client";

import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useUIStore } from "@/stores/uiStore";
import { useWebsiteStore } from "@/stores/websiteStore";
import { WebsiteFormSchema, WebsiteForm } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

export default function AddWebsiteModal() {
  const { isModalOpen, closeModal } = useUIStore();
  const { addWebsite } = useWebsiteStore();

  const form = useForm<WebsiteForm>({
    resolver: zodResolver(WebsiteFormSchema),
    defaultValues: {
      url: "",
    },
  });

  const handleClose = () => {
    closeModal();
    form.reset();
  };

  const handleSubmit = async (data: WebsiteForm) => {
    try {
      await addWebsite(data.url);
      toast.success("Website added successfully!");
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to add website");
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Website</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Field>
            <FieldLabel>Website URL</FieldLabel>
            <Input
              {...form.register("url")}
              placeholder="https://example.com"
            />
            {form.formState.errors.url && (
              <FieldError>{form.formState.errors.url.message}</FieldError>
            )}
          </Field>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Adding..." : "Add Website"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
