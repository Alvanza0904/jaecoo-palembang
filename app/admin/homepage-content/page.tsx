import { getHomepageContent } from '@/lib/data/homepage-content';
import HomepageContentEditor from './ContentEditor';

export const metadata = {
  title: 'Edit Homepage Content | JAECOO Admin',
};

export default async function AdminHomepageContentPage() {
  const initialData = await getHomepageContent();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Homepage Content</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola teks homepage. (Gambar tetap dikelola via Media Management / Model Data).
        </p>
      </div>
      
      <HomepageContentEditor initialData={initialData} />
    </div>
  );
}
