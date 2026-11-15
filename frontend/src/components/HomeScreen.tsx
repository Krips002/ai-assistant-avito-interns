import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { User } from "../api/schemas";
import { useChat } from "../store/chat";
import { useSession } from "../store/session";
import { Brand } from "./Brand";
import { ChatPanel } from "./ChatPanel";
import { MyRequests } from "./MyRequests";
import { Roadmap } from "./Roadmap";

export function HomeScreen({ user }: { user: User }) {
  const signOut = useSession((state) => state.signOut);
  const resetChat = useChat((state) => state.reset);
  const queryClient = useQueryClient();
  const [chatOpen, setChatOpen] = useState(false);

  function logout() {
    resetChat();
    queryClient.clear();
    signOut();
  }

  return (
    <main className="screen">
      <header className="topbar">
        <div>
          <Brand />
          <h1>
            {user.name}, {user.team}
          </h1>
          <p className="lead">Наставник: {user.buddyName}</p>
        </div>
        <button type="button" className="ghost" onClick={logout}>
          Выйти
        </button>
      </header>

      <div className="layout">
        <Roadmap />
        <MyRequests />
      </div>

      <ChatPanel user={user} hidden={!chatOpen} />

      <button
        type="button"
        className={chatOpen ? "launcher is-open" : "launcher"}
        aria-expanded={chatOpen}
        aria-controls="chat"
        aria-label={chatOpen ? "Закрыть помощника" : "Открыть помощника"}
        onClick={() => setChatOpen((open) => !open)}
      >
        {chatOpen ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" d="M6 6 18 18M18 6 6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        )}
      </button>
    </main>
  );
}
