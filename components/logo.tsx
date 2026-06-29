import { cva, type VariantProps } from 'class-variance-authority';

const logoVariants = cva(
  "font-serif leading-none font-black tracking-tight text-foreground select-none [font-variation-settings:'opsz'_16] dark:text-subtle-foreground",
  {
    variants: {
      variant: {
        hero: 'text-7xl',
        nav: 'text-2xl transition-colors dark:hover:text-foreground',
      },
    },
    defaultVariants: { variant: 'hero' },
  },
);

export function Logo({ variant = 'hero' }: VariantProps<typeof logoVariants>) {
  if (variant === 'nav') {
    return <span className={logoVariants({ variant })}>Textura</span>;
  }
  return <h1 className={logoVariants({ variant })}>Textura</h1>;
}
