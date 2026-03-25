import React from 'react';
import { 
  Zap, 
  Search, 
  ShieldCheck, 
  Calendar, 
  CreditCard, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search className="w-8 h-8 text-blue-600" />,
      title: "Discover Experts",
      description: "Search for services by category, location, or keyword. View provider profiles, ratings, and past work samples."
    },
    {
      icon: <Calendar className="w-8 h-8 text-blue-600" />,
      title: "Book Instantly",
      description: "Select a date and time slot that works for you. provide your requirements and any necessary files for the task."
    },
    {
      icon: <CreditCard className="w-8 h-8 text-blue-600" />,
      title: "Secure Payment",
      description: "Your payment is held in escrow. The provider is only paid once you confirm the work has been completed satisfactorily."
    },
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: "Execution & Delivery",
      description: "Communicate with your provider via secure chat. Receive updates and review deliverables directly through the platform."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-slate-50 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl -mr-64 -mt-64 -z-0"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
            <ShieldCheck className="w-3.5 h-3.5 fill-blue-600/20" /> Trusted Marketplace
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-none">
            How TaskRabbit <span className="text-blue-600 italic">Works</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            From emergency repairs to digital projects, we make it easy and secure to hire local professionals.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col gap-6 relative group">
              <div className="w-20 h-20 bg-blue-600/5 rounded-[32px] flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500 shadow-xl shadow-blue-900/5">
                <div className="group-hover:text-white transition-colors duration-500">
                  {step.icon}
                </div>
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center font-black text-slate-300 text-xs shadow-lg">
                  0{index + 1}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{step.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-slate-900 py-24 px-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-3xl -ml-64 -mt-64"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 tracking-tight leading-tight">
                Safety and <span className="text-blue-500">Security</span> at every step.
              </h2>
              <div className="space-y-6">
                {[
                  "Escrow-protected payments",
                  "Vetted and background-checked pros",
                  "Secure real-time messaging",
                  "Dedicated 24/7 support channel"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500/10" />
                    <span className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-12 flex gap-4 flex-wrap">
                <Link to="/register">
                  <Button size="lg" className="rounded-[24px] px-12 h-16 shadow-xl shadow-blue-900">Get Started Now</Button>
                </Link>
                <Link to="/search">
                  <Button size="lg" variant="outline" className="rounded-[24px] px-12 h-16 border-white/10 text-white hover:bg-white/5">Explore Experts</Button>
                </Link>
              </div>
            </div>
            <div className="relative">
               <div className="aspect-video bg-blue-600/20 rounded-[48px] border border-white/10 backdrop-blur-3xl p-1 lg:p-12 overflow-hidden shadow-2xl relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
                  <div className="relative z-10 flex flex-col justify-center h-full">
                     <p className="text-blue-400 font-black text-xs uppercase tracking-[0.3em] mb-4 text-center">Platform Assurance</p>
                     <p className="text-white text-3xl font-black italic text-center leading-tight">"Peace of mind, <br/> built right in."</p>
                  </div>
               </div>
               <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-blue-600 rounded-full blur-3xl opacity-50 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 text-center px-8">
        <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">Ready to tackle your to-do list?</h2>
        <Link to="/search">
          <Button size="lg" className="rounded-[32px] px-16 h-20 text-lg font-black flex items-center gap-3 mx-auto shadow-2xl shadow-blue-500/20 active:scale-95 transition-all group">
            Find Your Expert <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default HowItWorks;
