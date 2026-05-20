import { useCallback, type ComponentProps } from 'react';
import { ArrowDownIcon } from 'lucide-react';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export function Conversation({ className, ...props }: ConversationProps) {
  return (
    <StickToBottom
      className={cn('relative flex-1 overflow-y-hidden', className)}
      initial="smooth"
      resize="smooth"
      role="log"
      {...props}
    />
  );
}

export type ConversationContentProps = ComponentProps<
  typeof StickToBottom.Content
>;

export function ConversationContent({
  className,
  ...props
}: ConversationContentProps) {
  return (
    <StickToBottom.Content
      className={cn('flex flex-col', className)}
      {...props}
    />
  );
}

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export function ConversationScrollButton({
  className,
  ...props
}: ConversationScrollButtonProps) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    !isAtBottom && (
      <Button
        aria-label="Scroll to bottom"
        className={cn(
          'absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full text-subtle-foreground',
          className,
        )}
        onClick={handleScrollToBottom}
        size="icon"
        type="button"
        variant="outline"
        {...props}
      >
        <ArrowDownIcon />
      </Button>
    )
  );
}
