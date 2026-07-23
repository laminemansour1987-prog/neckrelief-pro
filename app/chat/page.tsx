import ChatWindow from "@/components/ChatWindow";

export const metadata = {
  title: "Chat avec Aura — Aura AI",
};

export default function ChatPage() {
  return (
    <div className="px-6 py-16">
      <h1 className="mb-8 text-center font-display text-3xl font-medium text-white">
        Discutez avec Aura
      </h1>
      <ChatWindow />
    </div>
  );
}
