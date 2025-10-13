import { Bot, User, Clock, Wrench } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import type { Message as ChatMessageProps } from '../../../worker/types';
const getInitials = (name: string = ''): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
};
const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};
export function ChatMessage({ message }: { message: ChatMessageProps }) {
  const user = useAuthStore((s) => s.user);
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex items-start gap-4', isUser && 'justify-end')}>
      {!isUser && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback>
            <Bot className="h-5 w-5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-md rounded-lg p-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-sm">{isUser ? user?.name : 'AI Assistant'}</span>
          <span className="text-xs opacity-70 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(message.timestamp)}
          </span>
        </div>
        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 pt-2 border-t border-current/20">
            <div className="flex items-center gap-1 mb-2 text-xs opacity-70">
              <Wrench className="w-3 h-3" />
              Tools used:
            </div>
            {message.toolCalls.map((tool, idx) => (
              <Badge key={idx} variant={isUser ? 'secondary' : 'outline'} className="mr-1 mb-1 text-xs">
                {tool.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 border">
          <AvatarImage src={user?.photo} alt={user?.name} />
          <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}