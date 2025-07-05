import { Users, Image as ImageIcon } from 'lucide-react'; // or use your own icons
import { useEffect } from 'react';

import { useState } from 'react';

import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
export const UserList = ({ user, selectedUser, typing }) => {



  dayjs.extend(isToday);
  dayjs.extend(isYesterday);


  const storedUser = localStorage.getItem('user');
  const authUser = storedUser ? JSON.parse(storedUser)?._id : null;

  console.log("authUser", authUser)




  const formatChatDate = (dateStr) => {
    const date = dayjs(dateStr);

    if (date.isToday()) {
      return date.format('HH:mm');
    } else if (date.isYesterday()) {
      return 'Yesterday';
    } else {
      return date.format('DD-MM-YYYY');
    }
  };



  return (
    <div className={`flex items-center justify-between px-3 py-3 hover:bg-gray-700 cursor-pointer  ${selectedUser?._id == user?._id ? 'bg-[#020621]' : ''}`}>
      {/* Left: Avatar & Details */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="bg-gray-600 rounded-full h-10 w-10 flex items-center justify-center overflow-hidden">
          {user?.avatar ? (
            <img
              src={`http://xkoggsw080g8so0og4kco4g4.31.97.61.92.sslip.io/${user.avatar}`}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <Users className="h-5 w-5 text-white opacity-70" />
          )}
        </div>

        {/* Name & Message Info */}
        <div>
          <div className="text-white font-semibold text-sm">{user?.name} {authUser == user?._id && ('(You)')}</div>
          <div className="text-gray-400 text-xs flex items-center gap-1 truncate max-w-[220px]">
            {typing === user?._id ? (
              <span className="font-semibold text-[#00c000]">typing...</span>
            ) : user?.lastMessage ? (
              user?.lastMessage?.type === 'text' ? (
                user?.lastMessage.message
              ) : (
                '📄 ' + user?.lastMessage.type
              )
            ) : (
              ''
            )}
          </div>
        </div>
      </div>

      {/* Right: Time & Unread Count */}
      <div className="flex flex-col items-end justify-between gap-1">
        <div className={` text-xs font-semibold ${user?.unreadCount ? 'text-green-400' : 'text-gray-400 '}`}>
          {user?.lastMessage?.createdAt && formatChatDate(user.lastMessage.createdAt)}
        </div>
        {user?.unreadCount > 0 && (
          <div className="bg-green-600 text-white text-xs rounded-full px-1.5 py-0.5 font-semibold">
            {user?.unreadCount}
          </div>
        )}
      </div>
    </div>
  );
};
