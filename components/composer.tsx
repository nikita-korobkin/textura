'use client';

import {
  PromptInputSubmit,
  type PromptInputSubmitProps,
} from '@/components/ai-elements/prompt-input';
import type { ComponentProps, ReactNode } from 'react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

function Composer({ children, className, ...props }: ComponentProps<'form'>) {
  return (
    <form className={cn('flex w-full flex-col gap-2', className)} {...props}>
      <InputGroup className="h-14 rounded-2xl bg-card shadow-xs ring-border *:data-[slot=input-group-control]:pr-3 *:data-[slot=input-group-control]:pl-4">
        {children}
      </InputGroup>
    </form>
  );
}

function ComposerInput(props: ComponentProps<'input'>) {
  return <InputGroupInput autoComplete="off" spellCheck={false} {...props} />;
}

function ComposerAddon({ children }: { children: ReactNode }) {
  return (
    <InputGroupAddon align="inline-end" className="pr-2">
      {children}
    </InputGroupAddon>
  );
}

function ComposerSubmit(props: PromptInputSubmitProps) {
  return <PromptInputSubmit size="icon-lg" className="rounded-lg" {...props} />;
}

export { Composer, ComposerAddon, ComposerInput, ComposerSubmit };
