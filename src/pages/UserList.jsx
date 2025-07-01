import { Users, Image as ImageIcon } from 'lucide-react'; // or use your own icons

export const UserList = ({ user,selectedUser }) => {
  return (
    <div className={`flex items-center justify-between px-3 py-3 hover:bg-gray-700 cursor-pointer  ${selectedUser?._id==user?._id?'bg-[#020621]':''}`}>
      {/* Left: Avatar & Details */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="bg-gray-600 rounded-full h-10 w-10 flex items-center justify-center">
          <Users className="h-5 w-5 text-white opacity-70" />
        </div>

        {/* Name & Message Info */}
        <div>
          <div className="text-white font-semibold text-sm">{user?.name}</div>
          <div className="text-gray-400 text-xs flex items-center gap-1">
         
           Test message
          </div>
        </div>
      </div>

      {/* Right: Time & Unread Count */}
      <div className="flex flex-col items-end justify-between gap-1">
        <div className="text-green-400 text-xs">today</div>
        {5> 0 && (
          <div className="bg-green-600 text-white text-xs rounded-full px-1.5 py-0.5 font-semibold">
           5
          </div>
        )}
      </div>
    </div>
  );
};
