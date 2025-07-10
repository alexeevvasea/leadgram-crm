import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const MessageBubble = ({ message, isOwn = false }) => {
  const isIncoming = message.message_type === 'incoming';
  const bubbleClass = isIncoming
    ? 'bg-gray-100 text-gray-900 rounded-br-none'
    : 'bg-blue-500 text-white rounded-bl-none ml-auto';

  return (
    <div className={`max-w-xs lg:max-w-md ${isIncoming ? 'mr-auto' : 'ml-auto'}`}>
      <div className={`px-4 py-2 rounded-lg ${bubbleClass}`}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
      
      <div className={`text-xs text-gray-500 mt-1 ${isIncoming ? 'text-left' : 'text-right'}`}>
        {formatDistanceToNow(new Date(message.timestamp), { 
          addSuffix: true, 
          locale: ru 
        })}
        {!isIncoming && !message.is_read && (
          <span className="ml-1">✓</span>
        )}
        {!isIncoming && message.is_read && (
          <span className="ml-1">✓✓</span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;