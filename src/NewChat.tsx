import axios from 'axios';
import { Search, User, Users, UserX } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const NewChat = ({ isOpen, onClose,setSelectedUser }) => {
  if (!isOpen) return null;

  const [users, setUsers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

 const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    setIsLoading(true)
    try {

       const response = await axios({
              method: 'get',
              url: 'http://xkoggsw080g8so0og4kco4g4.31.97.61.92.sslip.io/api/all-users',
              headers: {
                'Content-Type': 'application/json',
                Authorization: "Bearer " + token,
              },
            });

           if(response.data.status=="success"){
            setUsers(response.data.users)
           }

    } catch (error) {

        console.log(error)

    } finally {
      setIsLoading(false)
    }
  }

const [search,setSearch]=useState('');

const [filterUsers,setFilterUsers]=useState(users);


 useEffect(() => {
    const lowerSearch = search.toLowerCase();

    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(lowerSearch) ||
      user.phone?.toString().includes(search) // don't lowercase number
    );

    setFilterUsers(filtered);
  }, [search, users]);
  useEffect(() => {
    if (isOpen) fetchUsers()
  }, [isOpen])
  return (
    <div className="fixed inset-0 z-50 flex py-8 px-2 justify-center bg-[#1a052982] bg-opacity-50">
      <div className="bg-[#371449] w-full max-w-md h-fit p-6 rounded-lg shadow-lg relative overflow-hidden">
        <h2 className="text-lg text-white font-semibold mb-4">New Chat</h2>

        <button
          onClick={() => onClose(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 font-bold"
        >
          ✕
        </button>
        <main className="overflow-y-auto max-h-[80vh] pr-2">

          {isLoading ? <>Please Wait</> : (
            <div>

                <div className="relative w-full max-w-sm mb-4">
      {/* Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" />
      </div>

      {/* Input */}
      <input
        type="text"
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        placeholder="Search..."
        className="pl-10 pr-4 py-2 w-full border border-[#7d678da1] text-gray-400 rounded-md focus:outline-none "
      />
    </div>
    
    {filterUsers?.length?filterUsers?.map((user)=>(
              <div className={`flex items-center justify-between px-3 py-3 hover:bg-[#020621] cursor-pointer  rounded-lg`} onClick={()=>{setSelectedUser(user);onClose(false)}}>
                    {/* Left: Avatar & Details */}
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="bg-gray-600 rounded-full h-10 w-10 flex items-center justify-center">
                        <User className="h-5 w-5 text-white opacity-70" />
                      </div>
              
                      {/* Name & Message Info */}
                      <div>
                        <div className="text-white font-semibold text-sm">{user?.name}</div>
                        <div className="text-gray-400 text-xs flex items-center gap-1">
                        {user?.phone}
              
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
            )):(
<div className="flex flex-col items-center justify-center bg-[#1a052982] rounded-md p-4 mt-4">
    <UserX className="w-10 h-10 mb-2 text-white" />
    <p className="font-semibold text-white">No users found</p>
  </div>
    )}
            
            </div>
          )}
        </main>
      </div>
    </div>

  );
};

export default NewChat;