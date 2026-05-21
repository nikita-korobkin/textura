'use client';

import type { ChatStatus } from 'ai';
import { ArrowUpIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

import { InputGroupButton } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';

export type PromptInputSubmitProps = ComponentProps<typeof InputGroupButton> & {
  status?: ChatStatus;
};

function PromptInputSubmit({
  status,
  children,
  ...props
}: PromptInputSubmitProps) {
  const isGenerating = status === 'submitted' || status === 'streaming';

  return (
    <InputGroupButton type="submit" variant="default" {...props}>
      {children ?? (isGenerating ? <Spinner /> : <ArrowUpIcon />)}
    </InputGroupButton>
  );
}

export { PromptInputSubmit };
