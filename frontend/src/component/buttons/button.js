import { tv } from 'tailwind-variants';
import React from 'react';

// Define the merged button styles and variants using tailwind-variants
const button = tv({
  // Base classes combining the best aspects of both examples for styling, focus, and accessibility.
  base: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold uppercase tracking-wide transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  variants: {
    variant: {
      // --- Standard Variants ---
      default:
        'bg-white text-slate-500 border-slate-200 border-2 border-b-4 active:border-b-2 hover:bg-slate-100',
      primary:
        'bg-sky-400 text-primary-foreground hover:bg-sky-400/90 border-sky-500 border-b-4 active:border-b-0',
      primaryOutline: 'bg-white text-sky-500 hover:bg-slate-100',
      secondary:
        'bg-green-500 text-primary-foreground hover:bg-green-500/90 border-green-600 border-b-4 active:border-b-0',
      secondaryOutline: 'bg-white text-green-500 hover:bg-slate-100',
      danger:
        'bg-rose-500 text-primary-foreground hover:bg-rose-500/90 border-rose-600 border-b-4 active:border-b-0',
      dangerOutline: 'bg-white text-rose-500 hover:bg-slate-100',
      super:
        'bg-indigo-500 text-primary-foreground hover:bg-indigo-500/90 border-indigo-600 border-b-4 active:border-b-0',
      superOutline: 'bg-white text-indigo-500 hover:bg-slate-100',
      
      // --- Specialized Variants ---
      ghost:
        'bg-transparent text-slate-500 border-transparent border-0 hover:bg-slate-100',
      locked:
        'bg-neutral-200 text-primary-foreground hover:bg-neutral-200/90 border-neutral-400 border-b-4 active:border-b-0',
      outline:
        'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
      link: 'underline-offset-4 hover:underline text-primary bg-transparent',

      // --- Sidebar-specific Variants ---
      sidebar:
        'bg-transparent text-slate-500 border-transparent border-2 hover:bg-slate-100 transition-none',
      sidebarOutline:
        'bg-sky-500/15 text-sky-500 border-sky-300 border-2 hover:bg-sky-500/20 transition-none',
    },
    size: {
      // Merged and refined sizes for better consistency
      default: 'h-11 px-4 py-2',
      sm: 'h-9 rounded-lg px-3', // using h-9 for a better small size
      lg: 'h-12 rounded-md px-8 text-base', // larger with bigger text
      icon: 'h-10 w-10',
    },
    // A separate boolean variant for rounded corners is more flexible
    rounded: {
      true: 'rounded-full',
    }
  },
  // Default variants applied when none are specified
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

// The React component that uses the defined variants.
// It forwards the ref for use with other components or libraries.
const Button = React.forwardRef(({ className, variant, size, rounded, ...props }, ref) => {
  return (
    <button
      className={button({ variant, size, rounded, className })}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button, button as buttonVariants };
