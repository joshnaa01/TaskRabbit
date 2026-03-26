import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Normally would send to API, but for now just mock success
    toast.success('Your message has been sent successfully. We will get back to you soon!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Get in Touch</h1>
          <p className="text-slate-500 font-bold max-w-2xl mx-auto uppercase tracking-widest text-xs">
            Have questions about our platform? Need help with a booking? Our team is here to help you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-blue-900/5 border border-slate-100 flex items-start gap-6 group hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Email Us</h3>
                <p className="text-slate-500 font-bold mb-1">Our friendly team is here to help.</p>
                <a href="mailto:support@taskrabbit.com" className="text-blue-600 font-black hover:underline">support@taskrabbit.com</a>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-blue-900/5 border border-slate-100 flex items-start gap-6 group hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Call Us</h3>
                <p className="text-slate-500 font-bold mb-1">Mon-Fri from 8am to 5pm.</p>
                <a href="tel:+1-555-0100" className="text-blue-600 font-black hover:underline">+1 (555) 000-0000</a>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-blue-900/5 border border-slate-100 flex items-start gap-6 group hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Visit Us</h3>
                <p className="text-slate-500 font-bold mb-1">Come say hello at our HQ.</p>
                <p className="text-slate-900 font-black">100 Tech Lane, Suite 2<br />Kathmandu, Nepal</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 lg:p-12 rounded-[40px] shadow-2xl shadow-blue-900/5 border border-slate-100 animate-in fade-in slide-in-from-right-8 duration-700">
            <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Full Name"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-14 rounded-2xl"
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-14 rounded-2xl"
              />
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Message</label>
                <textarea
                  required
                  placeholder="How can we help you?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 focus:border-blue-500 transition-all outline-none resize-none min-h-[150px]"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl shadow-xl shadow-blue-600/20 group">
                <span className="flex items-center gap-2 uppercase tracking-widest text-xs font-black">
                  Send Message <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
