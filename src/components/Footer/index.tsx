import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-sans text-sm text-gray-500 uppercase tracking-wider mb-4">
              platform
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/mint"
                  className="font-sans text-sm text-gray-400 hover:text-brand-white transition-colors"
                >
                  mint nft
                </Link>
              </li>
              <li>
                <Link
                  href="/collection"
                  className="font-sans text-sm text-gray-400 hover:text-brand-white transition-colors"
                >
                  collections
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="font-sans text-sm text-gray-400 hover:text-brand-white transition-colors"
                >
                  about
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-sm text-gray-500 uppercase tracking-wider mb-4">
              community
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="font-sans text-sm text-gray-400 hover:text-brand-white transition-colors"
                >
                  discord
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-sans text-sm text-gray-400 hover:text-brand-white transition-colors"
                >
                  twitter
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-sans text-sm text-gray-400 hover:text-brand-white transition-colors"
                >
                  telegram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-sans text-xs text-gray-500">
              © 2024 stellar doggos. all rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="font-sans text-xs text-gray-500 hover:text-gray-400 transition-colors"
              >
                privacy
              </a>
              <a
                href="#"
                className="font-sans text-xs text-gray-500 hover:text-gray-400 transition-colors"
              >
                terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
