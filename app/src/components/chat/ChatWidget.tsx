
import { MessageCircle } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { cn } from '../../lib/utils';

export default function ChatWidget() {
  const { isOpen, openChat, messages } = useChat();
  const unreadCount = messages.filter(m => m.role === 'assistant').length;

  if (isOpen) return null;

  return (
    <button
      onClick={openChat}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-14 h-14 rounded-full",
        "bg-pj-gold hover:bg-pj-gold/90",
        "shadow-lg hover:shadow-xl",
        "flex items-center justify-center",
        "transition-all duration-300",
        "hover:scale-105"
      )}
      aria-label="Open chat"
    >
      <MessageCircle className="w-6 h-6 text-white" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
