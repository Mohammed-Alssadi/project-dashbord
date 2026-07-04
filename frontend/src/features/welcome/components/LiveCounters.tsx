import { useEffect, useState } from "react";
import { Users, Store, ShoppingCart } from "lucide-react";

const Counter = ({ end, label, icon: Icon, colorClass, delay = 0, extraClasses = "" }: any) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2500; // 2.5 seconds
    const increment = end / (duration / 16);

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(interval);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [end, delay]);

  return (
    <div className={`flex items-center gap-5 p-6 bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[2rem] shadow-xl shadow-slate-200/50 ${extraClasses} transition-all duration-500 hover:scale-105 hover:bg-white`}>
      <div className={`size-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${colorClass} shadow-inner`}>
        <Icon className="size-7 text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-4xl font-black text-slate-900 tracking-tight">
          +{count.toLocaleString()}
        </span>
        <span className="text-sm font-bold text-slate-500 mt-1">{label}</span>
      </div>
    </div>
  );
};

export function LiveCounters() {
  return (
    <div className="relative w-full max-w-lg h-[400px] flex items-center justify-center">
      <div className="absolute top-0 right-4 md:right-10 z-10 w-72 md:w-80">
        <Counter 
          end={124} 
          label="عميل نشط" 
          icon={Users} 
          colorClass="from-blue-500 to-blue-600" 
          delay={0}
          extraClasses="-rotate-3"
        />
      </div>
      
      <div className="absolute top-32 left-0 md:left-4 z-20 w-72 md:w-80">
        <Counter 
          end={15420} 
          label="طلب معالج" 
          icon={ShoppingCart} 
          colorClass="from-purple-500 to-purple-600" 
          delay={400}
          extraClasses="rotate-3"
        />
      </div>

      <div className="absolute bottom-4 right-0 md:right-8 z-30 w-72 md:w-80">
        <Counter 
          end={138} 
          label="متجر مرتبط" 
          icon={Store} 
          colorClass="from-emerald-500 to-emerald-600" 
          delay={800}
          extraClasses="-rotate-1"
        />
      </div>
    </div>
  );
}
