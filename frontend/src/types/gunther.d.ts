interface GuntherMessage {
  sender: "ai" | "user";
  text: string;
}

interface GuntherSessions {
  sessions: number;
}
