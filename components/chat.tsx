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
      <Conversation contextRef={conversationRef}>
        <ConversationContent className="mx-auto w-full max-w-3xl px-8 pt-20 pb-10">
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
        <ConversationScrollButton />
      </Conversation>

      <div className="shrink-0 bg-background">
        <div className="mx-auto max-w-3xl px-4 pb-3">
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
  );
}

export { Chat };
