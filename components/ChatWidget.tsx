'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

interface ChatWidgetProps {
  demoId: string;
  sessionId?: string;
  title?: string;
  accentColor?: string;
}

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ id: string; score: number }>;
}

const defaultGreeting = `Hi! I'm the LocalIQ assistant. Ask me about services, hours, or current offers.`;

export default function ChatWidget({ demoId, sessionId, title = 'SmartLocal Chat', accentColor }: ChatWidgetProps) {
  const accent = accentColor ?? '#34d399';
  const [message, setMessage] = useState('');
  const [turns, setTurns] = useState<ChatTurn[]>([
    { role: 'assistant', content: defaultGreeting },
  ]);
  const [isSending, setIsSending] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;

    const input = message.trim();

    setTurns((prev) => [...prev, { role: 'user', content: input }]);
    setMessage('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoId, message: input, sessionId }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const data = (await response.json()) as { reply: string; sources?: Array<{ id: string; score: number }> };

      setTurns((prev) => [...prev, { role: 'assistant', content: data.reply, sources: data.sources }]);
    } catch (err) {
      setTurns((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong fetching an answer. Please try again.',
        },
      ]);
      console.error(err);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div
      className="flex h-full w-full max-w-md flex-col overflow-hidden rounded-3xl border bg-slate-950/80 text-slate-100 shadow-xl"
      style={{ borderColor: accent }}
    >
      <header
        className="flex items-center justify-between border-b px-5 py-4"
        style={{ backgroundColor: accent + '33', borderColor: accent }}
      >
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-emerald-200">Powered by LocalIQ RAG</p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs"
          style={{ backgroundColor: accent, color: '#052018' }}
        >
          demo
        </span>
      </header>
      <div ref={containerRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-6 text-sm">
        {turns.map((turn, index) => (
          <div
            key={`turn-${index}`}
            className={`flex flex-col gap-1 ${turn.role === 'user' ? 'items-end text-slate-200' : 'items-start text-white'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${turn.role === 'user' ? 'bg-emerald-500 text-emerald-950' : 'bg-white/5 text-slate-100'}`}
            >
              {turn.content}
            </div>
            {turn.sources ? (
              <p className="text-xs text-emerald-200">
                Sources:{' '}
                {turn.sources.map((source) => `${source.id} (${source.score.toFixed(2)})`).join(', ')}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="border-t bg-slate-900/80 px-4 py-3" style={{ borderColor: accent }}>
        <div className="flex items-center gap-3">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask about menu, pricing, hours..."
            className="h-10 flex-1 rounded-full border border-white/10 bg-transparent px-4 text-sm placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSending}
            className="inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition disabled:cursor-not-allowed"
            style={{ backgroundColor: accent, color: '#022c1a', opacity: isSending ? 0.6 : 1 }}
          >
            {isSending ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
