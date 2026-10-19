import { Suspense } from "react";
import { sendMagicLink } from "./actions";

export const metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <div className="mx-auto grid max-w-md gap-5">
      <header>
        <div className="eyebrow">Curators</div>
        <h1 className="font-display text-4xl font-bold leading-none">Sign in to your list</h1>
        <p className="mt-2 text-ink-2">We email you a link. No password to remember.</p>
      </header>
      <form action={sendMagicLink} className="grid gap-3 rounded-lg border border-line bg-paper p-4">
        <label className="label">Email<input id="email" name="email" type="email" required autoComplete="email" className="field" /></label>
        <button className="btn btn-primary justify-center" type="submit">Email me a sign-in link</button>
        <Suspense>
          <Status searchParams={searchParams} />
        </Suspense>
      </form>
      <p className="text-[13.5px] text-ink-2">
        New here? Sign in, set up your list, and we review it before it goes public. Reviews are by hand, and the bar is simple: would we send our own friend to the shops on it?
      </p>
    </div>
  );
}

async function Status({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const q = await searchParams;
  if (q.sent) return <p className="font-mono text-[12.5px] text-good">Sent. Check your inbox, then come back here.</p>;
  if (q.error) return <p className="font-mono text-[12.5px] text-bad">That did not work: {String(q.error)}</p>;
  return null;
}
