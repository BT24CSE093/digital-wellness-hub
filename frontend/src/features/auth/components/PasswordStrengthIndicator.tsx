import React from 'react';
import { Check, X } from 'lucide-react';

interface Props {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<Props> = ({ password }) => {
  if (!password) return null;

  const rules = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One digit (0-9)', met: /[0-9]/.test(password) },
    { label: 'One special symbol (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = rules.filter((r) => r.met).length;

  const getStrengthMeta = () => {
    if (metCount <= 2) return { text: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-400' };
    if (metCount <= 4) return { text: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-400' };
    return { text: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
  };

  const strength = getStrengthMeta();

  return (
    <div className="mt-2 text-xs space-y-2">
      <div className="flex items-center justify-between text-slate-400">
        <span>Password strength:</span>
        <span className={`font-semibold ${strength.textColor}`}>{strength.text}</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5 h-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-full rounded-full transition-colors ${
              level <= metCount ? strength.color : 'bg-slate-800'
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-slate-400">
        {rules.map((r, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {r.met ? (
              <Check className="h-3 w-3 text-emerald-400 flex-shrink-0" />
            ) : (
              <X className="h-3 w-3 text-slate-600 flex-shrink-0" />
            )}
            <span className={r.met ? 'text-slate-300' : 'text-slate-500'}>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
