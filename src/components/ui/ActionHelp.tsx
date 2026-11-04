import { cloneElement, useState, type ReactElement, type HTMLProps } from 'react';
import { autoUpdate, flip, FloatingPortal, offset, safePolygon, shift, useDismiss, useFloating, useFocus, useHover, useInteractions, useRole } from '@floating-ui/react';

/** Opt-in: las ayudas protegidas y los defaults de IconButton no cambian. */
export function ActionHelp({ label, children }: { label: string; children: ReactElement<HTMLProps<HTMLElement>> }) {
  const [open, setOpen] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: next => {
      if (next) setPortalRoot(refs.domReference.current?.closest('dialog') ?? null);
      setOpen(next);
    },
    placement: 'top',
    strategy: 'fixed',
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const hover = useHover(context, { move: false, delay: { open: 450 }, handleClose: safePolygon() });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);
  return <>
    {cloneElement(children, getReferenceProps({ ...children.props, ref: refs.setReference, title: undefined }))}
    {open && <FloatingPortal root={portalRoot ?? undefined}><div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} className="z-[100] max-w-[250px] rounded-md border border-white/20 bg-marino-900 px-3 py-2 text-xs font-semibold leading-5 text-white shadow-pop">{label}</div></FloatingPortal>}
  </>;
}
