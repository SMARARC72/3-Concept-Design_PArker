
import { cn } from '../../lib/utils';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "flex",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] px-4 py-2 rounded-2xl",
        isUser 
          ? "bg-pj-navy text-white rounded-br-md"
          : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"
      )}>
        <p className="text-sm">{message.content}</p>
        <span className={cn(
          "text-[10px] mt-1 block",
          isUser ? "text-white/60" : "text-gray-400"
        )}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
