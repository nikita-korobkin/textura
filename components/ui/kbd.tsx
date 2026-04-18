import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const kbdVariants = cva(
  'pointer-events-none inline-flex w-fit items-center justify-center font-sans leading-none font-normal text-muted-foreground select-none',
  {
    variants: {
      size: {
        default: 'text-xs',
        lg: 'text-base',
      },
    },
    defaultVariants: { size: 'default' },
  },
);

function Kbd({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<'kbd'> & VariantProps<typeof kbdVariants>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(kbdVariants({ size }), className)}
      {...props}
    />
  );
}

export { Kbd };
