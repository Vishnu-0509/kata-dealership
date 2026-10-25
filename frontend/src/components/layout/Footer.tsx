interface Props {
  onOpenAbout: () => void;
  onOpenContact: () => void;
}

export function Footer({ onOpenAbout, onOpenContact }: Props) {
  return (
    <footer className="relative z-10 border-t border-white/20 bg-white/10 backdrop-blur-3xl text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-lg text-white">
                🏎️
              </div>
              <span className="font-black text-lg tracking-tight text-white">
                KATA <span className="text-cyan-400 font-light">MOTORS</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-Stack TDD Car Dealership Inventory System. Featuring modern REST API, real-time vehicle management, and specifications comparison.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="badge-glass bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[10px]">
                TDD Kata Certified
              </span>
              <span className="badge-glass bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                100% Verified Inventory
              </span>
            </div>
          </div>

          {/* Contact Details (Phone, Mail, Address) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Customer Support & Inquiries
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a
                  href="tel:+18005555282"
                  className="hover:text-cyan-400 transition-colors font-medium text-slate-300"
                >
                  +1 (800) 555-KATA
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <a
                  href="mailto:support@katamotors.com"
                  className="hover:text-cyan-400 transition-colors font-medium text-slate-300"
                >
                  support@katamotors.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">🏛️</span>
                <span className="text-slate-400">
                  100 KATA Boulevard, Automotive Innovation Center, CA 90210
                </span>
              </li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Dealership Hours
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>Monday – Friday:</span>
                <span className="text-slate-200 font-medium">8:00 AM – 8:00 PM EST</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span className="text-slate-200 font-medium">9:00 AM – 7:00 PM EST</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-slate-200 font-medium">10:00 AM – 5:00 PM EST</span>
              </div>
              <p className="text-[11px] text-cyan-400/90 pt-1">
                24/7 Digital Inventory Reservation Online
              </p>
            </div>
          </div>

          {/* Quick Links & Terms */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              System & Terms
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={onOpenAbout}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  About KATA Car Dealership
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Contact Concierge Support
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenAbout}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Inspection & Warranty Standards
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenAbout}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Transparent Digital Sales Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} KATA Car Dealership Inventory System. Built with Test-Driven Development.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={onOpenAbout} className="hover:text-slate-300">Privacy Policy</button>
            <span>•</span>
            <button onClick={onOpenAbout} className="hover:text-slate-300">Terms of Purchase</button>
            <span>•</span>
            <button onClick={onOpenContact} className="hover:text-slate-300">Customer Support</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
