
import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Trash2,
  LoaderCircle,
  Lightbulb,
} from "lucide-react";
import api from "../api";
import { useAuth } from "../context/authcontext";

const suggestions = [
  "How can I manage my project efficiently?",
  "Create a task breakdown for a website project.",
  "Give me tips to improve team productivity.",
  "How do I prioritize my tasks?",
];

function Ai() {
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi ${user?.name || "there"}! 👋 I'm Vantix AI. How can I help you manage your projects and tasks today?`,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async (text = input) => {
    const question = text.trim();

    if (!question || loading) return;

    const updatedMessages = [
      ...messages,
      {
        role: "user",
        content: question,
      },
    ];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/ai/chat", {
        message: question,
        messages: updatedMessages.map((item) => ({
          role: item.role,
          content: item.content,
        })),
      });

      const data = response.data;

      // Support common response formats.
      const answer =
        data.reply ||
        data.response ||
        data.message ||
        data.answer ||
        data.content ||
        data.choices?.[0]?.message?.content;

      if (!answer || typeof answer !== "string") {
        throw new Error(
          "The AI server returned no answer. Check your backend response format."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (err) {
      console.error("AI request failed:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Something went wrong.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const clearChat = () => {
    if (loading) return;

    setMessages([
      {
        role: "assistant",
        content: `Hi ${user?.name || "there"}! 👋 I'm Vantix AI. What would you like help with?`,
      },
    ]);

    setError("");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-violet-600">
            <Sparkles size={16} />
            Your AI workspace assistant
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Vantix AI Assistant
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Get help planning projects, organizing tasks, and improving productivity.
          </p>
        </div>

        <button
          onClick={clearChat}
          disabled={loading}
          className="flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={16} />
          Clear chat
        </button>
      </div>

      {/* AI status */}
      <div className="flex items-center gap-4 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-white p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
          <Bot size={25} />
        </div>

        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">
            Your project management copilot
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Ask questions about planning, tasks, priorities, and teamwork.
          </p>
        </div>

        <span className="hidden items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200 sm:flex">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Assistant
        </span>
      </div>

      {/* Chat window */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <Sparkles size={20} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Vantix Assistant
              </h2>

              <p className="text-xs text-gray-500">
                Project planning and productivity
              </p>
            </div>
          </div>

          <span className="text-xs text-gray-400">
            {messages.filter((item) => item.role === "user").length} messages
          </span>
        </div>

        {/* Messages */}
        <div className="h-[420px] space-y-5 overflow-y-auto bg-gray-50/50 p-4 sm:p-6">
          {messages.map((message, index) => {
            const isUser = message.role === "user";

            return (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  isUser ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isUser
                      ? "bg-gray-200 text-gray-700"
                      : "bg-violet-600 text-white"
                  }`}
                >
                  {isUser ? <User size={18} /> : <Bot size={19} />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[75%] ${
                    isUser
                      ? "rounded-tr-sm bg-violet-600 text-white"
                      : "rounded-tl-sm border border-gray-100 bg-white text-gray-700 shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
                <Bot size={19} />
              </div>

              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-gray-100 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                <LoaderCircle
                  size={17}
                  className="animate-spin text-violet-600"
                />
                Vantix AI is thinking...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 sm:mx-6">
            <p className="font-medium">Unable to get an AI response</p>
            <p className="mt-1 break-words">{error}</p>
            <p className="mt-1 text-xs">
              Check the backend server, AI API configuration, and available API credits.
            </p>
          </div>
        )}

        {/* Suggested prompts */}
        <div className="border-t border-gray-100 px-4 py-4 sm:px-6">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Lightbulb size={15} className="text-amber-500" />
            TRY ASKING
          </div>

          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={loading}
                onClick={() => sendMessage(suggestion)}
                className="rounded-full border border-gray-200 bg-white px-3 py-2 text-left text-xs text-gray-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Message input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-100 bg-white p-4 sm:p-5"
        >
          <div className="flex items-end gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-2 transition focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-50">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  handleSubmit(event);
                }
              }}
              placeholder="Ask Vantix AI anything..."
              rows={1}
              disabled={loading}
              className="max-h-32 min-h-11 flex-1 resize-y bg-transparent px-3 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              {loading ? (
                <LoaderCircle size={19} className="animate-spin" />
              ) : (
                <Send size={19} />
              )}
            </button>
          </div>

          <p className="mt-2 text-center text-xs text-gray-400">
            AI responses may be inaccurate. Review important information before acting on it.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Ai;
