"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { tags } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase/server";

/** Server actions are reachable by direct POST, so every action re-checks admin. */
async function requireAdmin() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  if (data.user.app_metadata?.role !== "admin") redirect("/");
  return supabase;
}

async function setApproval(formData: FormData, approve: boolean) {
  const supabase = await requireAdmin();
  const id = String(formData.get("curator_id") ?? "");
  const { data: curator, error } = await supabase
    .from("curators")
    .update({ approved_at: approve ? new Date().toISOString() : null })
    .eq("id", id)
    .select("metro, handle")
    .single();
  if (error || !curator) redirect(`/admin?error=${encodeURIComponent(error?.message ?? "not found")}`);
  // Expire the curator's page and the metro index now, so the change is public immediately.
  updateTag(tags.curator(curator.metro, curator.handle));
  updateTag(tags.curators(curator.metro));
  redirect(`/admin?done=${approve ? "approved" : "revoked"}&handle=${curator.handle}`);
}

export async function approveCurator(formData: FormData) {
  await setApproval(formData, true);
}

export async function revokeCurator(formData: FormData) {
  await setApproval(formData, false);
}
