'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import type { StickToBottomContext } from 'use-stick-to-bottom';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  Composer,
  ComposerAddon,
  ComposerInput,
  ComposerSubmit,
} from '@/components/composer';

function Chat() {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationRef = useRef<StickToBottomContext>(null);
  const { messages, sendMessage, status } = useChat({
    id: 'chat',
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });
  const hasInput = input.trim() !== '';
  const isGenerating = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasInput) {
      return;
    }

    sendMessage({ text: input });
    setInput('');
    void conversationRef.current?.scrollToBottom('smooth');
    inputRef.current?.focus();
  }

  return (
    <div className="flex h-full flex-col">
      <Conversation className="min-h-0" contextRef={conversationRef}>
        <ConversationContent className="mx-auto w-full max-w-3xl px-8 py-20">
          {messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent>
                {message.parts.map((part, index) => {
                  if (part.type !== 'text') return null;

                  return (
                    <MessageResponse key={`${message.id}-${index}`}>
                      {part.text}
                    </MessageResponse>
                  );
                })}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>

        <div className="fixed bottom-0 left-1/2 w-full max-w-3xl -translate-x-1/2 px-4">
          <div className="flex flex-col items-center gap-4">
            <ConversationScrollButton />

            <div className="w-full bg-background pb-3">
              <Composer onSubmit={handleSubmit}>
                <ComposerInput
                  aria-label="Chat message"
                  placeholder="Ask Textura..."
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.currentTarget.value)}
                />
                <ComposerAddon>
                  <ComposerSubmit
                    disabled={!hasInput || isGenerating}
                    status={status}
                  />
                </ComposerAddon>
              </Composer>
            </div>
          </div>
        </div>
      </Conversation>
    </div>
  );
}

export { Chat };
