import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import socket from '../socket';
import { Paperclip, SmilePlus, User, Users } from 'lucide-react';
import Picker from '@emoji-mart/react';
import AttachmentMenu from './AttachmentMenu';

export default function MessageBox({ selectedUser, setSelectedUser, setUsers }) {

  const handleBack = () => setSelectedUser(null);

  const token = localStorage.getItem('token');

  let authUser = localStorage.getItem('user');

  if (authUser) {
    authUser = JSON.parse(authUser);
  }



  const [chats, setChats] = useState([]);
  const fetchChat = async () => {

    try {
      const response = await axios({
        method: 'get',
        url: 'http://xkoggsw080g8so0og4kco4g4.31.97.61.92.sslip.io/api/chat-data',
        params: { _id: selectedUser?._id },
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + token,
        },
      });

      if (response.data.status == "success") {
        setSelectedUser(response.data.user)

        setChats(response.data.chats)
      }
    } catch (error) {
      console.log(error)
    } finally {

    }


  }

  useEffect(() => {
    if (selectedUser?._id) fetchChat()
  }, [selectedUser?._id])

  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [type, setType] = useState('text');

  const sendMessage = async () => {
    console.log(message)
    if (type == "text" && !message) return;
    else if (type == "document" && !selectedFile) return


    try {
      const formData = new FormData();
      formData.append('receiver_id', selectedUser._id);
      formData.append('message', message);
      formData.append('type', type);   // or 'image' if sending image
      formData.append('file', selectedFile);
      const response = await axios({
        method: 'post',
        url: 'http://xkoggsw080g8so0og4kco4g4.31.97.61.92.sslip.io/api/messages',
        data: formData,
        headers: {
          // 'Content-Type': 'application/json',
          Authorization: "Bearer " + token,
        },
      });

      if (response.data.status == "success") {

        const sound = new Audio('/assets/outgoing.mp3');
        sound.play().catch((error) => {
          console.warn('Audio autoplay blocked:', error);
        });

        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === selectedUser._id
              ? { ...user, lastMessage: response.data.chat }
              : user
        ))

        setMessage('')
        fetchChat()
      }

      console.log(response)

    } catch (error) {
      console.log(error)
    }
  };

const [isLive,setIsLive]=useState(true);
    useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🟢 User is back on this tab');
       fetchChat() 
        setIsLive(true)
      } else {
        console.log('🔴 User left the tab or minimized');
        // socket.emit('user_away', { userId }); 
        setIsLive(false)
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);


  const s = socket();  // Declare once

  useEffect(() => {
    if (!s) return;

    const handleReceiveMessage = (message) => {
      console.log("recived message",message)
    if(message.sender_id==selectedUser?._id){  setChats(prev => [...prev, message]);
    // sound moved to home
     s.emit('recived_live', message._id );
    }

    

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id == message.sender_id
            ? { ...user, lastMessage: message }
            : user
        )
      );
    };

    s.on('receive_message', handleReceiveMessage);

    return () => {
      s.off('receive_message', handleReceiveMessage);
    };
  }, []);

  const typingTimeoutRef = useRef(null);

  const handleTyping = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    if (s && selectedUser?._id && authUser?._id) {
      s.emit('typing', { toUserId: selectedUser._id, fromUserId: authUser._id });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (s && selectedUser?._id && authUser?._id) {
        s.emit('stop_typing', { toUserId: selectedUser._id, fromUserId: authUser._id });
      }
    }, 500);
  };

  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!s) return;

    const handleTyping = ({ fromUserId }) => {
      if (fromUserId === selectedUser?._id) setIsTyping(true);
      else setIsTyping(false);
    };

    const handleStopTyping = () => setIsTyping(false);

    const handleViewed = (data) => {
      if (data == selectedUser._id) setChats(prevChats => prevChats.map(chat => {
        return { ...chat, isReceived: true, isViewed: true };
      }));
    };

     const messageViewed = (data) => {

      console.log('message viewed',data)
      // if (data == selectedUser._id) setChats(prevChats => prevChats.map(chat => {
      //   return { ...chat, isReceived: true, isViewed: true };
      // }));
    };

    s.on('typing', handleTyping);
    s.on('stop_typing', handleStopTyping);

  s.on('message_viewed', messageViewed);
    
    s.on('online', (userId) => {
      if (userId == selectedUser?._id) {
        console.log(chats)
        setSelectedUser({ ...selectedUser, isActive: true })
        setChats(prevChats => prevChats.map(chat => {
          return { ...chat, isReceived: true };
        }));
      }
    });

    s.on('offline', ({ userId, lastActive }) => {
      console.log(`${userId} is now offline`);
      if (userId == selectedUser?._id) setSelectedUser({ ...selectedUser, isActive: false, lastActive: lastActive })
    });

    s.on('viewed', handleViewed);

    return () => {
      s.off('typing', handleTyping);
      s.off('stop_typing', handleStopTyping);
    };
  }, [selectedUser?._id]);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [chats, isTyping]);

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const [showPicker, setShowPicker] = useState(false);

  const pickerRef = useRef(null);

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji.native);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
  };











  return (
    <div className="flex flex-col h-full">
      {/* Mobile Only Back Button */}
      <div className="md:hidden p-4 bg-[#1a0529] flex items-center gap-4">
        <button
          onClick={handleBack}
          className="text-white font-bold"
        >
          ←
        </button>




        <span className="font-bold">{selectedUser.name}</span>
      </div>

      {/* Chat Header */}


      <div className='hidden md:block p-3 bg-[#1a0529]'>
        <div className="flex items-center gap-3 ">
          {/* Avatar */}
          <div className="bg-gray-600 rounded-full h-10 w-10 flex items-center justify-center overflow-hidden">
            {selectedUser?.avatar ? (
              <img
                src={`http://xkoggsw080g8so0og4kco4g4.31.97.61.92.sslip.io/${selectedUser.avatar}`}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-white opacity-70" />
            )}
          </div>

          {/* Name & Message Info */}
          <div>
            <div className="text-white font-semibold text-sm">{selectedUser?.name}</div>
            <div className="text-gray-400 font-medium text-xs flex items-center gap-1">
              {isTyping ? 'typing ....' : selectedUser?.isActive ? (
                <span className="text-green-500">Online</span>
              ) : (
                selectedUser?.lastActiveReadable
              )}

            </div>
          </div>
        </div>
      </div>



      {/* Chat Content */}
      <div className="flex-1 p-4 px-6 overflow-auto custom-scrollbar">

        {chats?.length === 0 ? (
          <div className="text-center text-gray-400">No messages yet.</div>
        ) : (
          chats.map((chat, i) => (
            <div
              key={i}
              className={`flex ${chat.receiver_id === selectedUser._id ? 'justify-end' : 'justify-start'} mb-2`}
            >
              <div
                className={`p-2 rounded-lg break-words whitespace-pre-wrap min-w-[100px] max-w-xs text-white ${chat.receiver_id === selectedUser._id ? 'bg-[#102d45]' : 'bg-[#371449]'
                  }`}
                style={{ wordBreak: 'break-word' }}
              >
                <div>

                  {chat?.type == 'image' && (<div>
                    <img src={`http://xkoggsw080g8so0og4kco4g4.31.97.61.92.sslip.io/${chat?.data?.filePath}`} className='rounded mb-2' alt="aaa"
                      onLoad={() => {
                        if (bottomRef.current) {
                          bottomRef.current.scrollIntoView({ behavior: 'auto' });
                        }
                      }}
                    />
                  </div>
                  )}

                  {chat?.type === 'document' && (
                    <div className="flex items-center  rounded-lg p-3 bg-[#1a052982] text-white max-w-xs mb-2">
                      {/* Icon */}
                      <div className="flex-shrink-0 mr-3">
                        <div className="bg-[#527ea4] text-blue-600 rounded-full p-2">
                          {/* You can use Lucide FileText or any icon */}
                          📄
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="flex-grow overflow-hidden">
                        <div className="font-semibold  truncate">
                          {chat?.data?.originalName || 'Untitled'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(chat?.data?.fileSize)}
                        </div>
                      </div>
                    </div>
                  )}

                  <p className={/^[\p{Emoji}\s]+$/u.test(chat.message) ? 'text-4xl' : 'text-base'}>
                    {chat.message}
                  </p>



                </div>

                {/* Footer row for time + tick */}
                <div className="flex justify-end items-center gap-1 text-xs text-gray-400 mt-1">
                  <span>{formatTime(chat.createdAt)}</span>

                  {chat.receiver_id == selectedUser._id && <>

                    {chat.isViewed ? (<svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 13l3 3L20 6"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13l3 3"
                      />
                    </svg>) : chat.isReceived ? (<svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 13l3 3L20 6"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13l3 3"
                      />
                    </svg>) : (<svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>)}
                  </>}



                </div>
              </div>
            </div>





          ))
        )}
        {isTyping && <div className="text-sm text-gray-400 mt-2">typing....</div>}
        {/* 👇 Dummy div to scroll into view */}
        <div ref={bottomRef}></div>

      </div>
      <div className="relative">
        {showPicker && (
          <div className="absolute bottom-12" ref={pickerRef}>
            <Picker onEmojiSelect={handleEmojiSelect} />
          </div>
        )}
        <div className="fixed bottom-0 left-0 right-0 p-2 bg-[#1a0529] z-10 sm:static sm:z-0">
          <form className="flex gap-2" onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}>

            <div className='flex items-center gap-3'>
              <button
                type="button" onClick={() => setShowPicker(!showPicker)}
                className="bg-[#371449] text-white px-2 py-2 rounded-lg hover:bg-[#020621] cursor-pointer"
              >
                <SmilePlus />
              </button>
              <AttachmentMenu message={message} setMessage={setMessage} selectedFile={selectedFile} setSelectedFile={setSelectedFile} type={type} setType={setType} sendMessage={sendMessage} />
            </div>
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-lg px-3 py-2 focus:outline-none"
              value={message}
              onChange={handleTyping}
            />
            <button
              type="submit" // changed to submit for Enter key support
              className="bg-[#371449] text-white px-4 py-2 rounded-lg hover:bg-[#020621] cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
