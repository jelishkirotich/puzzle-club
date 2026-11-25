"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

type Message = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

function formatTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Chat({ puzzleId, name }: { puzzleId: string; name: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const lastSeen = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const merge = useCallback((incoming: Message[]) => {
    if (incoming.length === 0) return;
    setMessages((current) => {
      const known = new Set(current.map((message) => message.id));
      const fresh = incoming.filter((message) => !known.has(message.id));
      return fresh.length > 0 ? [...current, ...fresh] : current;
    });
    lastSeen.current = incoming[incoming.length - 1].createdAt;
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      if (document.hidden) return;
      try {
        const url =
          `/api/puzzles/${puzzleId}/messages` +
          (lastSeen.current ? `?since=${encodeURIComponent(lastSeen.current)}` : "");
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (active) merge(data.messages);
      } catch {
        // try again on the next round
      } finally {
        if (active) setLoaded(true);
      }
    }

    load();
    const timer = setInterval(load, 6000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [puzzleId, merge]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  async function send() {
    const body = text.trim();
    if (!body) return;
    if (name.trim().length < 2) {
      setError("Add your display name above first.");
      return;
    }

    setSending(true);
    setError(null);
    try {
      const response = await fetch(`/api/puzzles/${puzzleId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: name.trim(), body }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "That note could not be sent.");
        return;
      }
      merge([data.message]);
      setText("");
    } catch {
      setError("Could not send that. Check your connection.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="flex h-[560px] flex-col rounded-[2rem] border border-line bg-paper p-6">
      <h2 className="text-2xl font-bold">The conversation</h2>

      <div ref={listRef} className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
        {loaded && messages.length === 0 && (
          <p className="py-10 text-center text-muted">
            No notes yet. Be the first to leave one.
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-2xl px-4 py-3 ${
              message.author === name.trim() ? "bg-sage" : "bg-cream"
            }`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-bold">{message.author}</span>
              <span className="text-xs text-muted">{formatTime(message.createdAt)}</span>
            </div>
            <p className="mt-1 whitespace-pre-wrap break-words text-[15px]">
              {message.body}
            </p>
          </div>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-clay">{error}</p>}

      <div className="mt-4 flex items-end gap-2">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          placeholder="Leave a note"
          rows={2}
          maxLength={500}
          className="w-full resize-none rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] outline-none transition placeholder:text-muted/70 focus:border-forest-soft"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending}
          aria-label="Send"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest-soft text-paper transition hover:bg-forest disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}