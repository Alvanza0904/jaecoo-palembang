import { createSupabaseServerClient } from '@/lib/supabase/server';
import PromoClientPage from './PromoClientPage';

export const metadata = {
  title: 'Kelola Promo | JAECOO Admin',
};

export default async function AdminPromoPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: promos }, { data: models }] = await Promise.all([
    supabase
      .from('promos')
      .select('*, models(id, name, slug)')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase
      .from('models')
      .select('id, name')
      .order('name', { ascending: true }),
  ]);

  return (
    <PromoClientPage
      initialPromos={promos ?? []}
      modelsList={models ?? []}
    />
  );
}
