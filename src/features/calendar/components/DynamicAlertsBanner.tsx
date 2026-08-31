import React, { useEffect, useState } from 'react';
import { AlertCircle, Info, ChevronRight, X } from 'lucide-react';
import { ApiService as api } from '@/services/api';
import { Link } from 'react-router-dom';

export function DynamicAlertsBanner() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchAlerts = async () => {
      try {
        const res = await api.getMyLearningAlerts();
        if (mounted && Array.isArray(res)) {
          setAlerts(res);
        }
      } catch (err) {
        console.error('Failed to fetch dynamic alerts', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchAlerts();
    return () => { mounted = false; };
  }, []);

  if (isLoading || alerts.length === 0) return null;

  return (
    <div className="mb-8 space-y-3">
      {alerts.map((alert, idx) => (
        <div 
          key={idx} 
          className={`relative p-4 rounded-xl border flex items-start gap-4 transition-all shadow-sm
            ${alert.severity === 'warning' 
              ? 'bg-amber-50 border-amber-200 text-amber-900' 
              : 'bg-blue-50 border-blue-200 text-blue-900'
            }
          `}
        >
          <div className="shrink-0 mt-0.5">
            {alert.severity === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            ) : (
              <Info className="w-5 h-5 text-blue-500" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
            <p className="text-xs opacity-90 leading-relaxed mb-2">{alert.message}</p>
            {alert.action_url && (
              <Link 
                to={alert.action_url}
                className={`inline-flex items-center text-xs font-bold transition-opacity hover:opacity-70
                  ${alert.severity === 'warning' ? 'text-amber-700' : 'text-blue-700'}
                `}
              >
                Xem chi tiết
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            )}
          </div>
          <button 
            onClick={() => setAlerts(prev => prev.filter((_, i) => i !== idx))}
            className="shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4 opacity-50" />
          </button>
        </div>
      ))}
    </div>
  );
}
