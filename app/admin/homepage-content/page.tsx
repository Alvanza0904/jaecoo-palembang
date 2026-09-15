import { getHomepageContent } from '@/lib/data/homepage-content';
import UnifiedEditor from './UnifiedEditor';

export const metadata = {
  title: 'Homepage Visual Editor | JAECOO Admin',
};

export default async function AdminHomepageContentPage() {
  const content = await getHomepageContent();
  return <UnifiedEditor initialData={content} />;
}
