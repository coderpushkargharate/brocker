"use client";

import { keepValues, useResetOnSuccess } from "@/lib/forms";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { saveBlogCategoryAction } from "@/app/actions/blog";
import { Alert } from "@/components/auth/AuthForms";
import type { BlogCategory } from "@/lib/types";

export function BlogCategoryForm({ category }: { category?: BlogCategory }) {
  const [state, action, pending] = useActionState(saveBlogCategoryAction, undefined);
  const k = category?.id ?? "new";
  const ref = useResetOnSuccess(state, !category);
  return (
    <form ref={ref} onSubmit={keepValues(action)} className="space-y-3">
      {category && <input type="hidden" name="editId" value={category.id} />}
      <Alert error={state?.error} ok={state?.ok} />
      <div>
        <label className="label" htmlFor={`bc-name-${k}`}>
          Name
        </label>
        <input id={`bc-name-${k}`} name="name" required minLength={2} maxLength={60} defaultValue={category?.name} className="input" />
      </div>
      {!category && (
        <div>
          <label className="label" htmlFor={`bc-slug-${k}`}>
            URL (optional)
          </label>
          <input id={`bc-slug-${k}`} name="slug" placeholder="land-documents" pattern="[a-z0-9]+(-[a-z0-9]+)*" className="input" />
        </div>
      )}
      <div>
        <label className="label" htmlFor={`bc-desc-${k}`}>
          Description (shown on the category page)
        </label>
        <textarea id={`bc-desc-${k}`} name="description" rows={3} maxLength={300} defaultValue={category?.description} className="input" />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary h-10 w-full">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} {category ? "Save changes" : "Add category"}
      </button>
    </form>
  );
}
