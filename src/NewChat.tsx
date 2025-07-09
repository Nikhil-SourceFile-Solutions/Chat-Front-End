import axios from 'axios';
import { Search, User, UserX } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// 👉 Optional helper for formatting date (add your own logic if needed)
const formatChatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const NewChat = ({ onClose, setSelectedUser }) => {

  const [users, setUsers] = useState([]);
  const [filterUsers, setFilterUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const token = localStorage.getItem('token');
  const crm = localStorage.getItem('chatbox_subdomain');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios({
        method: 'get',
        url: 'http://api.sourcefile.online/api/all-users',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          crm: crm
        },
      });

      if (response.data.status === "success") {
        setUsers(response.data.users);
        setFilterUsers(response.data.users);  // Initial filter set
      }

    } catch (error) {
      console.log('Fetch Users Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(lowerSearch) ||
      user.phone?.toString().includes(search)
    );
    setFilterUsers(filtered);
  }, [search, users]);

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
          {isLoading ? (
            <div className="text-white text-center">Loading users...</div>
          ) : (
            <div>
              <div className="relative w-full max-w-sm mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-full border border-[#7d678da1] text-gray-400 rounded-md focus:outline-none"
                />
              </div>

              {filterUsers?.length ? filterUsers.map((user) => (
                <div
                  key={user._id}  // ✅ key added
                  className="flex items-center justify-between px-3 py-3 hover:bg-[#020621] cursor-pointer rounded-lg"
                  onClick={() => { setSelectedUser(user); onClose(false); }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-600 rounded-full h-10 w-10 flex items-center justify-center">
                      <User className="h-5 w-5 text-white opacity-70" />
                    </div>

                    <div>
                      <div className="text-white font-semibold text-sm">{user?.name}</div>
                      <div className="text-gray-400 text-xs">{user?.phone}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-1">
                    <div className={`text-xs font-semibold ${user?.unreadCount ? 'text-green-400' : 'text-gray-400'}`}>
                      {user?.lastMessage?.createdAt && formatChatDate(user.lastMessage.createdAt)}
                    </div>
                    {user?.unreadCount > 0 && (
                      <div className="bg-green-600 text-white text-xs rounded-full px-1.5 py-0.5 font-semibold">
                        {user?.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              )) : (
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
