import Header from "@/components/Header";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white font-sans font-semibold mb-4">
              ABOUT
            </h1>
            <p className="text-xl text-gray-400 font-serif">
              The future of NFT collection deployment
            </p>
          </div>

          <div className="space-y-6 font-sans">
            <div>
              <h2 className="text-2xl font-bold text-white mb-3 font-semibold">
                Our Mission
              </h2>
              <p className="text-gray-400 leading-relaxed">
                We believe in democratizing NFT creation. Our platform provides
                creators with the tools they need to deploy professional NFT
                collections without technical barriers.
              </p>
            </div>

            <div>
              <ul className="space-y-2 text-gray-400">
                <li>• Simple, intuitive deployment process</li>
                <li>• Built on reliable blockchain infrastructure</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-3 font-semibold">
                Get Started
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Ready to launch your NFT collection? Head over to our mint page
                and start building your digital legacy today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
