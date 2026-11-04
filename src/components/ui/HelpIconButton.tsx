import { forwardRef, type ComponentProps } from 'react';
import { IconButton } from './Button';
import { ActionHelp } from './ActionHelp';

/** Adopción explícita fuera de Partes, sin cambiar IconButton ni su default. */
export const HelpIconButton = forwardRef<HTMLButtonElement, ComponentProps<typeof IconButton>>(function HelpIconButton({ label, ...props }, ref) {
  return <ActionHelp label={label}><IconButton {...props} ref={ref} label={label} title={undefined} /></ActionHelp>;
});
