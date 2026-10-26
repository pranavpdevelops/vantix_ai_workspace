
import { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  LoaderCircle,
} from "lucide-react";
import api from "../api";

const suggestions = [
  "Create a plan for a project management application",
  "Break an e-commerce project into tasks",
  "Suggest a weekly development schedule",
  "Write a task description for user authentication",
];

function AI() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [failedMessage, setFailedMessage] = useState("");

  const sendMessage = async (text = message) => {
    const userMessage = text.trim();

    if (!userMessage || loading) return;


    const isRetry = userMessage === failedMessage;

    let updatedMessages;

    if (isRetry) {
      updatedMessages = messages;
    } else {
      updatedMessages = [
        ...messages,
        { role: "user", content: userMessage },
      ];

      setMessages(updatedMessages);
    }

    setMessage("");
    setLoading(true);
    setError("");

    try {
      const history = updatedMessages
        .slice(-10)
        .map(({ role, content }) => ({ role, content }));

      const res = await api.post("/ai/chat", {
        message: userMessage,
        history,
      });

      const reply = res.data.reply;

      if (!reply) {
        throw new Error("No response received from the AI assistant.");
      }

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: reply,
        },
      ]);

      setFailedMessage("");
    } catch (err) {
      console.error("AI request failed:", err);

      const status = err.response?.status;
      const backendMessage = err.response?.data?.message;

      if (status === 503) {
        setError(
          "The AI service is temporarily busy. Please wait a moment and retry."
        );
      } else if (status === 429) {
        setError(
          backendMessage ||
            "The AI usage limit may have been reached. Please try again later."
        );
      } else {
        setError(
          backendMessage ||
            err.message ||
            "Could not connect to the AI assistant. Please try again."
        );
      }

      setFailedMessage(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleRetry = () => {
    if (failedMessage) {
      sendMessage(failedMessage);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] px-4 py-6 text-[#17172B] sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6D5DFB] text-white shadow-lg shadow-[#6D5DFB]/20">
            <Sparkles size={27} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#6D5DFB]">
              Vantix AI
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              AI Assistant
            </h1>

            <p className="mt-1 text-sm text-[#77788D]">
              Plan smarter. Organize better. Get things done.
            </p>
          </div>
        </div>

        {/* Chat Container */}
        <div className="mt-8 flex min-h-[480px] flex-col rounded-3xl border border-[#E9EAF2] bg-white shadow-sm">
          {/* Chat Header */}
          <div className="flex items-center gap-3 border-b border-[#F0F0F6] px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0EEFF] text-[#6D5DFB]">
              <Bot size={22} />
            </div>

            <div>
              <h2 className="text-sm font-bold">
                VanTix Assistant
              </h2>

              <p className="mt-1 text-xs text-[#77788D]">
                Your project planning companion
              </p>
            </div>

            <span className="ml-auto rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
              AI Assistant
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-5 p-4 sm:p-6">
            {messages.length === 0 && (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0EEFF] text-[#6D5DFB]">
                  <Bot size={32} />
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  How can I help you?
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#77788D]">
                  Ask me to plan a project, break down tasks, or improve
                  your team's workflow.
                </p>

                <div className="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => sendMessage(suggestion)}
                      disabled={loading}
                      className="rounded-xl border border-[#E9EAF2] p-4 text-left text-sm leading-5 transition hover:border-[#6D5DFB] hover:bg-[#F8F7FF] disabled:opacity-50"
                    >
                      <Sparkles
                        size={17}
                        className="mb-2 text-[#6D5DFB]"
                      />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((item, index) => (
              <div
                key={`${index}-${item.role}`}
                className={`flex gap-3 ${
                  item.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {item.role === "assistant" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0EEFF] text-[#6D5DFB]">
                    <Bot size={19} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[75%] ${
                    item.role === "user"
                      ? "rounded-tr-sm bg-[#6D5DFB] text-white"
                      : "rounded-tl-sm bg-[#F7F8FC] text-[#33334B]"
                  }`}
                >
                  {item.content}
                </div>

                {item.role === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E9EAF2] text-[#77788D]">
                    <User size={19} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0EEFF] text-[#6D5DFB]">
                  <Bot size={19} />
                </div>

                <div className="flex items-center gap-2 rounded-2xl bg-[#F7F8FC] px-4 py-3 text-sm text-[#77788D]">
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                  Thinking...
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
              >
                <p>{error}</p>

                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={loading || !failedMessage}
                  className="mt-2 font-semibold underline disabled:opacity-50"
                >
                  Try again
                </button>
              </div>
            )}
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-[#F0F0F6] p-4 sm:p-5"
          >
            <div className="flex items-end gap-3 rounded-2xl border border-[#E9EAF2] bg-[#FCFCFE] p-2 focus-within:border-[#6D5DFB] focus-within:ring-4 focus-within:ring-[#6D5DFB]/10">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask anything about your project..."
                rows={1}
                disabled={loading}
                className="max-h-32 min-h-11 flex-1 resize-y bg-transparent px-3 py-3 text-sm outline-none placeholder:text-[#A0A1B3] disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!message.trim() || loading}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6D5DFB] text-white transition hover:bg-[#5948E8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <LoaderCircle
                    size={20}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={19} />
                )}
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-[#9999AA]">
              AI-generated suggestions may occasionally be inaccurate.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}


export default AI;
