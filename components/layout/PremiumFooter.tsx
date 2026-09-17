import Link from 'next/link';

export default function PremiumFooter() {
  return (
    <footer className="bg-charcoal text-white py-20 px-6 md:px-12">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
        <div>
          <h2 className="font-heading text-3xl tracking-[0.15em] mb-6">JAECOO PALEMBANG</h2>
          <div className="flex gap-6 text-sm tracking-widest uppercase text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">TikTok</a>
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
            <a href="https://wa.me/6285183145926" className="hover:text-white transition-colors">WhatsApp</a>
          </div>
        </div>
        
        <div className="w-full md:w-auto h-px bg-white/20 md:hidden my-4" />

        <div className="text-sm text-gray-400 flex flex-col md:items-end gap-2">
          <p>&copy; 2026 JAECOO Palembang</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>&middot;</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
