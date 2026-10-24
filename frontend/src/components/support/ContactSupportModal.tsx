import { useState, FormEvent } from 'react';
import { useToast } from '../common/Toast';

interface Props {
  onClose: () => void;
}

export function ContactSupportModal({ onClose }: Props) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('Purchase Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast(
        'success',
        'Support Ticket Dispatched',
        `Thank you ${name}. Our concierge team will reach out at ${email} shortly.`
      );
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-slide-up">
      <div 
        className="glass-panel max-w-2xl w-full border border-cyan-500/30 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl text-cyan-400">
              📞
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Client Care & Concierge Support</h2>
              <p className="text-xs text-slate-400">24/7 dedicated automotive customer service</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Direct Communication Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Phone */}
            <a
              href="tel:+18005552739"
              className="glass-card p-4 hover:border-cyan-500/50 block group transition-all"
            >
              <span className="text-2xl mb-1 block">📱</span>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Toll-Free Phone</p>
              <p className="text-sm font-bold text-white group-hover:text-cyan-400 mt-0.5">
                +1 (800) 555-KATA
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Direct Sales & Support Line</p>
            </a>

            {/* Email */}
            <a
              href="mailto:support@katamotors.com"
              className="glass-card p-4 hover:border-cyan-500/50 block group transition-all"
            >
              <span className="text-2xl mb-1 block">✉️</span>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email Desk</p>
              <p className="text-sm font-bold text-white group-hover:text-cyan-400 mt-0.5 truncate">
                support@katamotors.com
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Average response &lt; 15 mins</p>
            </a>

            {/* Showroom */}
            <div className="glass-card p-4">
              <span className="text-2xl mb-1 block">🏛️</span>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Main Showroom</p>
              <p className="text-sm font-bold text-white mt-0.5">100 Kata Boulevard</p>
              <p className="text-[10px] text-slate-500 mt-1">Beverly Hills, CA 90210</p>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <span className="text-xl">🕒</span>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dealership Operating Hours</h4>
                <p className="text-xs text-slate-400">Monday – Saturday: 8:00 AM – 8:00 PM EST • Sunday: 10:00 AM – 5:00 PM EST</p>
              </div>
            </div>
            <span className="badge-glass bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-[11px]">
              ● Concierge Desk Online
            </span>
          </div>

          {/* Inquiry / Message Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>✍️</span> Send Direct Dispatch Inquiry
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
                <input
                  className="glass-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alexander Vance"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  className="glass-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alexander@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Inquiry Purpose</label>
              <select
                className="glass-input bg-slate-950 text-slate-100"
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
              >
                <option value="Purchase Inquiry" className="bg-slate-900">Purchase / Vehicle Financing</option>
                <option value="Test Drive Booking" className="bg-slate-900">Schedule VIP Test Drive</option>
                <option value="Vehicle Service & Warranty" className="bg-slate-900">Vehicle Service & Warranty</option>
                <option value="Trade-In Valuation" className="bg-slate-900">Trade-In Appraisal</option>
                <option value="General Support" className="bg-slate-900">General Questions</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Inquiry Details</label>
              <textarea
                className="glass-input min-h-[90px] resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Specify the vehicle or inquiry details..."
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" className="btn-glass flex-1 py-2.5" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1 py-2.5 font-bold" disabled={isSubmitting}>
                {isSubmitting ? 'Transmitting Dispatch...' : 'Submit Inquiry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
