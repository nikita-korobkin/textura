import { useCallback, type ComponentProps } from 'react';
import { ArrowDownIcon } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
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
  const shouldReduceMotion = useReducedMotion();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    <AnimatePresence>
      {!isAtBottom && (
        <motion.div
          className="absolute bottom-4 left-1/2"
          initial={{
            opacity: 0,
            x: '-50%',
            y: shouldReduceMotion ? 0 : 10,
            scale: shouldReduceMotion ? 1 : 0.9,
          }}
          animate={{
            opacity: 1,
            x: '-50%',
            y: 0,
            scale: shouldReduceMotion ? 1 : [0.9, 1.025, 1],
          }}
          exit={{
            opacity: 0,
            x: '-50%',
            y: shouldReduceMotion ? 0 : 4,
            scale: shouldReduceMotion ? 1 : 0.96,
            transition: {
              duration: shouldReduceMotion ? 0.01 : 0.1,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
          transition={{
            opacity: {
              duration: shouldReduceMotion ? 0.01 : 0.16,
              ease: [0.22, 1, 0.36, 1],
            },
            scale: {
              duration: shouldReduceMotion ? 0.01 : 0.28,
              times: [0, 0.72, 1],
              ease: [0.25, 1.2, 0.5, 1],
            },
            y: {
              duration: shouldReduceMotion ? 0.01 : 0.24,
              ease: [0.34, 1.35, 0.64, 1],
            },
          }}
        >
          <Button
            aria-label="Scroll to bottom"
            className={cn('rounded-full text-subtle-foreground', className)}
            onClick={handleScrollToBottom}
            size="icon"
            type="button"
            variant="outline"
            {...props}
          >
            <ArrowDownIcon />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
