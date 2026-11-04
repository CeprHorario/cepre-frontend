import { apiErrorMessage } from '@/api/client';
import { Alert } from './EmptyState';
import { Button } from './Button';

/** Lectura elegible opt-in: no confundir error con vacío ni disparar escrituras. */
export function QueryFeedback({ query, label }: { query: { isError: boolean; isFetching: boolean; error: unknown; data: unknown; refetch: () => unknown }; label: string }) {
  if (!query.isError) return null;
  return <Alert tone="danger" title={`No se pudo ${query.data === undefined ? 'cargar' : 'actualizar'} ${label}`} action={<Button variant="secondary" size="sm" disabled={query.isFetching} onClick={() => { query.refetch(); }}>Reintentar</Button>}>{apiErrorMessage(query.error)}{query.data !== undefined && ' Se mantienen los últimos datos recibidos.'}</Alert>;
}
