import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full">
      {/* J5 HERO SECTION */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-charcoal">
        <Image 
          src="/images/j5-hero.jpg" 
          alt="JAECOO J5" 
          fill 
          priority
          className="object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
        <div className="relative z-10 text-center text-white mt-20 px-4 animate-fade-up">
          <h2 className="font-heading text-xl md:text-2xl tracking-[0.3em] uppercase mb-4">Jaecoo J5</h2>
          <h1 className="font-heading text-5xl md:text-8xl tracking-tight mb-8">THIS IS THE REAL SUV.</h1>
          <Link href="/models/j5" className="inline-block border border-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-charcoal transition-all">
            Discover J5
          </Link>
        </div>
      </section>

      {/* J7 SECTION - Asymmetrical Layout */}
      <section className="py-32 px-6 md:px-12 max-w-[1920px] mx-auto bg-offwhite">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 order-2 md:order-1 animate-fade-up">
            <h2 className="font-heading text-4xl md:text-6xl mb-6">JAECOO J7</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md font-light leading-relaxed">
              Refined capability meets intelligent design. Experience the pinnacle of SHS technology and extended EV range in a striking silhouette.
            </p>
            <Link href="/models/j7" className="text-sm tracking-widest uppercase border-b border-charcoal pb-1 hover:text-gray-500 transition-colors">
              Explore Specifications
            </Link>
          </div>
          <div className="md:col-span-7 order-1 md:order-2 h-[60vh] relative animate-reveal">
            <Image 
              src="/images/j7-profile.jpg" 
              alt="JAECOO J7" 
              fill 
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* J8 FLAGSHIP SECTION */}
      <section className="py-32 px-6 md:px-12 bg-charcoal text-white">
        <div className="max-w-[1920px] mx-auto flex flex-col items-center text-center">
          <h2 className="font-heading text-sm tracking-[0.4em] text-gray-400 mb-4 uppercase">The Flagship</h2>
          <h3 className="font-heading text-5xl md:text-7xl mb-16">JAECOO J8</h3>
          <div className="w-full h-[70vh] relative mb-16 animate-reveal">
             <Image 
              src="/images/j8-flagship.jpg" 
              alt="JAECOO J8 Flagship" 
              fill 
              className="object-cover object-center"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-24 text-center border-t border-white/20 pt-16 w-full max-w-4xl">
            <div>
              <p className="font-heading text-4xl mb-2">530</p>
              <p className="text-xs tracking-widest uppercase text-gray-400">PS Power</p>
            </div>
            <div>
              <p className="font-heading text-4xl mb-2">650</p>
              <p className="text-xs tracking-widest uppercase text-gray-400">Nm Torque</p>
            </div>
            <div>
              <p className="font-heading text-4xl mb-2">5.4s</p>
              <p className="text-xs tracking-widest uppercase text-gray-400">0-100 km/h</p>
            </div>
            <div>
              <p className="font-heading text-4xl mb-2">V2L</p>
              <p className="text-xs tracking-widest uppercase text-gray-400">Capability</p>
            </div>
          </div>
          <div className="mt-16">
             <Link href="/models/j8" className="inline-block bg-white text-charcoal px-8 py-3 text-sm tracking-widest uppercase hover:bg-gray-200 transition-all">
              View Flagship
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
