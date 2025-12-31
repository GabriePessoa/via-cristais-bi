
import React, { useState, useEffect } from 'react';
import { getOperationalInsights } from '../services/geminiService';
import { TollRecord } from '../types';
import { Sparkles, Loader2, RefreshCw, Zap, ShieldAlert, TrendingUp } from 'lucide-react';

interface InsightsViewProps {
  data: TollRecord[];
}

const InsightsView: React.FC<InsightsViewProps> = ({ data }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    const result = await getOperationalInsights(data);
    setInsight(result || "Erro ao processar.");
    setLoading(false);
  };

  useEffect(() => {
    if (data.length > 0 && !insight) {
      fetchInsights();
    }
  }, [data]);

  const parseInsights = (text: string) => {
    return text.split('\n').filter(line => line.trim().length > 5);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-8">
      
      <div className="flex justify-end">
          <button 
            onClick={fetchInsights}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-[#052144] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#0a3560] transition-all active:scale-95 disabled:opacity-50 shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            Atualizar Análise AI
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl h-64 animate-pulse flex flex-col gap-4 shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-5/6"></div>
            </div>
          ))
        ) : insight ? (
          parseInsights(insight).map((point, i) => (
            <InsightCard 
              key={i} 
              text={point} 
              icon={i === 0 ? <Zap className="text-[#52C1DD]" /> : i === 1 ? <ShieldAlert className="text-rose-500" /> : <TrendingUp className="text-emerald-500" />} 
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
            <p className="text-sm font-bold uppercase tracking-widest">Aguardando dados para análise...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const InsightCard: React.FC<{ text: string; icon: React.ReactNode }> = ({ text, icon }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:translate-y-[-4px] transition-all group">
    <div className="p-3 bg-slate-50 rounded-2xl w-fit mb-6 group-hover:bg-[#052144] group-hover:text-white transition-colors">
      {icon}
    </div>
    <p className="text-slate-700 leading-relaxed font-medium text-sm">
      {text.replace(/^[-*•\d.]\s*/, '')}
    </p>
  </div>
);

export default InsightsView;
