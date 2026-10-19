import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { getGoTarget } from "@/lib/data";
import { supabasePublic } from "@/lib/supabase/public";

/**
 * /go/{listing_id}: count the click, send the visitor on.
 * Works for signed-out visitors, which is the whole point for a link
 * posted in a public car group. The insert is fire-and-forget so the
 * redirect is never slowed by the database.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/go/[id]">) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });

  const target = await getGoTarget(id);
  if (!target) return new Response("This pick is no longer listed.", { status: 404 });

  // Hash, never store, anything that identifies a visitor. Daily salt so the
  // hash is only good for de-duplicating one person's clicks within a day.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ua = request.headers.get("user-agent") ?? "";
  const day = new Date().toISOString().slice(0, 10);
  const visitor_hash = createHash("sha256").update(`${day}|${ip}|${ua}`).digest("hex").slice(0, 24);

  void supabasePublic.from("referrals").insert({ listing_id: id, visitor_hash }).then(() => {});

  return NextResponse.redirect(target, 302);
}
