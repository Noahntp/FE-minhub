import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldCheck, Mail, X, Loader2 } from 'lucide-react';

export interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<boolean>;
  onVerifySuccess: () => void;
  onResend: () => Promise<void>;
  type: 'phone' | 'email';
  contactInfo: string;
}

export function OTPModal({ isOpen, onClose, onVerify, onVerifySuccess, onResend, type, contactInfo }: OTPModalProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  useEffect(() => {
    let timer: any;
    if (isOpen && cooldown > 0) {
      timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, cooldown]);

  useEffect(() => {
    if (isOpen) {
      setOtp('');
      setError('');
      setCooldown(30);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (otp.length < 6) {
      setError('Vui lòng nhập đủ 6 số OTP.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const success = await onVerify(otp);
      if (success) {
        onVerifySuccess();
      } else {
        setError('Mã OTP không chính xác hoặc đã hết hạn.');
      }
    } catch (err: any) {
      setError(err.message || 'Mã OTP không chính xác. Mã đúng là 123456.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || cooldown > 0) return;
    setResending(true);
    setError('');
    try {
      await onResend();
      setCooldown(30);
      setOtp('');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gửi lại OTP');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 p-1.5 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-brand-light-hover rounded-full flex items-center justify-center mx-auto text-brand-normal border border-brand-light-active">
            {type === 'phone' ? <Smartphone className="w-8 h-8" /> : <Mail className="w-8 h-8" />}
          </div>
          
          <div>
            <h2 className="text-xl font-display font-extrabold text-stone-900">
              Xác minh {type === 'phone' ? 'Số điện thoại' : 'Email'}
            </h2>
            <p className="text-sm text-stone-500 mt-2 leading-relaxed">
              Hệ thống đã gửi mã xác minh 6 chữ số đến {type === 'phone' ? 'SĐT' : 'email'}
              <br/>
              <strong className="text-stone-700">{contactInfo}</strong>.
            </p>
          </div>
          
          <div className="py-2">
            <input 
              type="text" 
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/[^0-9]/g, ''));
                setError('');
              }}
              placeholder="000000"
              className="w-full text-center tracking-[0.75em] font-mono text-3xl p-4 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-brand-normal focus:bg-white focus:outline-none transition-all placeholder:text-stone-300"
            />
            {error && <p className="text-xs text-rose-600 font-bold mt-3 animate-fade-in">{error}</p>}
          </div>
          
          <button 
            onClick={handleVerify}
            disabled={loading || otp.length < 6}
            className="w-full bg-[#432c28] hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang xác minh...</> : <><ShieldCheck className="w-5 h-5" /> Xác nhận mã OTP</>}
          </button>
          
          <div className="pt-2 text-sm text-stone-500 font-medium">
            {cooldown > 0 ? (
              <p>Gửi lại mã sau <span className="font-mono text-brand-normal">{cooldown}s</span></p>
            ) : (
              <button 
                onClick={handleResend}
                disabled={resending}
                className="text-brand-normal hover:text-[#432c28] font-bold hover:underline disabled:opacity-50"
              >
                {resending ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
