import { getHomepageContent } from '@/lib/data/homepage-content';
import HomepageContentEditor from './ContentEditor';
import styles from './homepage-content.module.css';

export const metadata = {
  title: 'Homepage Content | JAECOO Admin',
};

export default async function AdminHomepageContentPage() {
  const initialData = await getHomepageContent();

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Homepage Content</h1>
        <p className={styles.pageSubtitle}>
          Kelola teks homepage. Gambar tetap dikelola via Media Management / Model Data.
        </p>
      </div>
      <div className={styles.goldLine} />
      <HomepageContentEditor initialData={initialData} />
    </div>
  );
}
