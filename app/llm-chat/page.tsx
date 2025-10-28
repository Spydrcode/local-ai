"use client";

import { FormEvent, useState } from "react";
import { ChatCompletionStream } from "together-ai/lib/ChatCompletionStream";

export default function LLMChat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setAnswer("");
    const res = await fetch("/api/answer", {
      method: "POST",
      body: JSON.stringify({ question }),
    });
    if (!res.body) return;
    ChatCompletionStream.fromReadableStream(res.body)
      .on("content", (delta) => setAnswer((text) => text + delta))
      .on("end", () => setIsLoading(false));
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Ask the LLM a Question</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask me a question"
          required
          className="flex-1 px-3 py-2 border rounded"
        />
        <button disabled={isLoading} type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded">
          {isLoading ? "Loading..." : "Submit"}
        </button>
      </form>
      <div className="bg-slate-900 text-white p-4 rounded min-h-[60px]">
        {answer}
      </div>
    </div>
  );
}
