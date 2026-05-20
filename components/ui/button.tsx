'use client';

import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'flex items-center justify-center bg-clip-padding transition-all will-change-[opacity] select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:outline-destructive [&_svg]:pointer-events-none [&_svg]:stroke-[1.75]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary/80 dark:hover:bg-primary/90',
        ghost:
          'text-foreground hover:bg-accent dark:text-subtle-foreground dark:hover:text-foreground',
        outline: 'bg-popover text-foreground shadow-popover',
      },
      size: {
        icon: "size-9 p-0 has-[>svg]:p-0 [&>svg:not([class*='size-'])]:size-5",
        'icon-lg':
          "size-10 p-0 has-[>svg]:p-0 [&>svg:not([class*='size-'])]:size-5.5",
      },
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
