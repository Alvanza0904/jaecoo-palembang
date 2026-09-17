import Image from 'next/image';

export default function SalesConsultantPage() {
  return (
    <div className="w-full min-h-screen bg-offwhite pt-32 pb-20 px-6 md:px-12">
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center h-full">
        
        {/* Editorial Image Section */}
        <div className="relative h-[70vh] w-full animate-reveal">
          <Image 
            src="/images/showroom-palembang.jpg" 
            alt="JAECOO Palembang Showroom" 
            fill 
            className="object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
          />
        </div>

        {/* Content Section */}
        <div className="flex flex-col justify-center animate-fade-up">
          <h1 className="font-heading text-4xl md:text-6xl mb-4 text-charcoal">Personal Automotive Consultant</h1>
          <p className="text-lg text-gray-600 mb-12 font-light max-w-lg leading-relaxed">
            Experience a tailored approach to discovering your next premium vehicle. Schedule a private viewing or test drive in Palembang.
          </p>

          <div className="border-l border-charcoal pl-8 mb-12">
            <h2 className="font-heading text-2xl mb-1">Alvan</h2>
            <p className="text-sm tracking-widest uppercase text-gray-500 mb-6">Sales OMODA JAECOO Palembang</p>
            
            <a 
              href="https://wa.me/6285183145926" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-2xl font-light hover:text-gray-500 transition-colors block mb-2"
            >
              0851-8314-5926
            </a>
          </div>

          <div>
            <h3 className="text-xs tracking-widest uppercase text-gray-400 mb-3">Dealer Resmi</h3>
            <p className="text-base text-charcoal font-light max-w-sm">
              Komp. Graha Maju<br/>
              Jl. Mayor HM. Rasyad Nawawi No.506–509<br/>
              9 Ilir, Ilir Timur II<br/>
              Palembang 30113
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
