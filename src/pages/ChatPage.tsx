import { useState, useEffect, useRef } from 'react';
import { chatService } from '@/lib/chat';
import type { ChatState } from '../../worker/types';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { Bot, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
export function ChatPage() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    sessionId: chatService.getSessionId(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash',
    streamingMessage: ''
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.streamingMessage]);
  useEffect(() => {
    const loadHistory = async () => {
      const response = await chatService.getMessages();
      if (response.success && response.data) {
        setChatState(response.data);
      }
    };
    loadHistory();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatState.isProcessing) return;
    const message = input.trim();
    setInput('');
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: message,
      timestamp: Date.now()
    };
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isProcessing: true,
      streamingMessage: ''
    }));
    await chatService.sendMessage(message, chatState.model, (chunk) => {
      setChatState(prev => ({
        ...prev,
        streamingMessage: (prev.streamingMessage || '') + chunk
      }));
    });
    const response = await chatService.getMessages();
    if (response.success && response.data) {
      setChatState(response.data);
    } else {
      setChatState(prev => ({ ...prev, isProcessing: false }));
    }
  };
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {chatState.messages.length === 0 && !chatState.isProcessing && (
          <div className="text-center text-muted-foreground pt-16">
            <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold">Asistente IA de ZenDash</h2>
            <p className="mt-2">Pregúntame cualquier cosa sobre tus datos de Asana.</p>
          </div>
        )}
        {chatState.messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {chatState.streamingMessage && (
          <ChatMessage message={{
            id: 'streaming',
            role: 'assistant',
            content: chatState.streamingMessage,
            timestamp: Date.now()
          }} />
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 sm:p-6 lg:p-8 border-t bg-background">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            isLoading={chatState.isProcessing}
          />
          <Alert className="mt-4 text-xs text-muted-foreground">
            <Info className="h-4 w-4" />
            <AlertTitle>¡Aviso!</AlertTitle>
            <AlertDescription>
              Las capacidades de IA tienen un límite de uso compartido entre todos los usuarios. Las respuestas pueden ser más lentas durante horas pico.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}