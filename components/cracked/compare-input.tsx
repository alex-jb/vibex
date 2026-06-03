"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CompareInput({ baseHandle }: { baseHandle: string }) {
  const [other, setOther] = useState("");
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = other.replace(/^@/, "").trim();
    if (!clean || !/^[\w-]+$/.test(clean)) return;
    router.push(`/cracked/vs/${baseHandle}/${clean}`);
  }

  return (
    <form onSubmit={submit} className="mb-8 rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-zinc-800">
      <label htmlFor="compare-handle" className="block text-xs uppercase tracking-wider text-zinc-500">
        Compare @{baseHandle} to…
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="compare-handle"
          type="text"
          value={other}
          onChange={(e) => setOther(e.target.value)}
          placeholder="karpathy"
          className="flex-1 rounded-lg bg-black/40 px-3 py-2 text-sm text-zinc-200 ring-1 ring-zinc-800 placeholder:text-zinc-600 focus:outline-none focus:ring-orange-500/60"
        />
        <button
          type="submit"
          disabled={!other.trim()}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          Compare →
        </button>
      </div>
    </form>
  );
}
