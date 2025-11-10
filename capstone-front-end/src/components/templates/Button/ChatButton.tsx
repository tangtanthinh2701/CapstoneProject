import { MessageSquareIcon } from 'lucide-react';

const ChatButton = () => {
  return (
    <button
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '4rem',
        height: '4rem',
        backgroundColor: '#00E676',
        borderRadius: '50%',
        boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <MessageSquareIcon size={28} />
    </button>
  );
};

export default ChatButton;
