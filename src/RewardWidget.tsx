import { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { useStore, type User } from './store';

interface RewardWidgetProps {
  user: User;
  onClose: () => void;
}

export const RewardWidget = ({ user, onClose }: RewardWidgetProps) => {
  const { rewardBalance, sendReward } = useStore();
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (amount > 0 && amount <= rewardBalance) {
      sendReward(amount);
      onClose();
    }
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-[#dcfce7] dark:bg-[#064e3b] rounded-2xl shadow-2xl border-4 border-white/50 z-50 overflow-hidden">

      {/* Header */}
      <div className="p-4 relative">
        <button onClick={onClose} className="absolute top-3 right-3 w-6 h-6 bg-white/50 rounded-full flex items-center justify-center hover:bg-white transition-colors">
          <X className="w-4 h-4 text-gray-700" />
        </button>
        <div className="text-3xl mb-2">🥐</div>
        <h3 className="font-bold text-xl text-green-900 dark:text-green-100">Reward {user.name.split(' ')[0]}</h3>
        <p className="text-sm text-green-800 dark:text-green-200">
          You have <span className="font-bold">{rewardBalance} croissants</span> left to give
        </p>
      </div>

      {/* Body */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-t-3xl mt-2 flex flex-col items-center">

        {/* Counter */}
        <div className="flex items-center gap-6 mb-6">
          <button
            onClick={() => setAmount(Math.max(0, amount - 1))}
            className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center hover:bg-yellow-200 font-bold"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="text-5xl font-bold">{amount}</span>

          <button
            onClick={() => setAmount(Math.min(rewardBalance, amount + 1))}
            className="w-8 h-8 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center hover:bg-yellow-500 font-bold"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Message Input */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message here..."
          className="w-full text-center border-b border-gray-300 dark:border-gray-600 pb-2 bg-transparent focus:outline-none focus:border-green-500 text-sm mb-4"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={amount === 0}
          className="w-full py-3 bg-green-900 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-green-800 transition-colors"
        >
          Send Reward
        </button>
      </div>
    </div>
  );
};
