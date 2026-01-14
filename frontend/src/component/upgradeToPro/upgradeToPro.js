import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../buttons/button';

export const UpgradePro = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-2 border-slate-200/80 rounded-xl p-4 space-y-3 shadow-sm">
      <h3 className="font-bold text-lg font-['Fredoka_One',_cursive] text-slate-700">
        Upgrade to Pro
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed">
        Get unlimited streaks and more!
      </p>
      <Button
        variant="secondary" // pick the style variant you want (e.g., green button)
        size="default"
        className="w-full"
        onClick={() => navigate('/shop')}
      >
        Upgrade Today
      </Button>
    </div>
  );
};
