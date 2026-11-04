import { useEffect, useRef, type RefObject } from 'react';

/** Aislamiento opt-in de drawers de personas, sin alterar Overlay ni Partes. */
export function useEligibleDrawer(open: boolean, content: RefObject<HTMLElement | null>) {
  const previous = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null);
  useEffect(() => {
    if (!open) return;
    const drawer = content.current?.closest<HTMLElement>('[role=dialog]');
    if (!drawer) return;
    const root = document.getElementById('root');
    const wasInert = root?.inert ?? false;
    if (root && !root.contains(drawer)) root.inert = true;
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || document.querySelector('dialog[open]')) return;
      const nodes = [...drawer.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]')].filter(node => node.getClientRects().length > 0);
      const first = nodes[0], last = nodes.at(-1);
      if (!first || !last) { event.preventDefault(); drawer.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !drawer.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !drawer.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', trap);
    const origin = previous.current;
    return () => {
      document.removeEventListener('keydown', trap);
      if (root) root.inert = wasInert;
      if (origin?.isConnected) origin.focus();
    };
  }, [open, content]);
}
