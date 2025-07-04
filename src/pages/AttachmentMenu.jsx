import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, FileText, Image, Send } from 'lucide-react';

const AttachmentMenu = ({ message, setMessage, selectedFile, setSelectedFile, type, setType,sendMessage }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');

  const containerRef = useRef();
  const fileInputRef = useRef();

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        clearAll();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearAll = () => {
    setShowMenu(false);
    setSelectedFile(null);
    setPreviewUrl('');
    setCaption('');
    setType('text');
  };

  const handleOptionClick = (selectedType) => {
    setType(selectedType);
    if (fileInputRef.current) {
      fileInputRef.current.accept = selectedType === 'image' ? 'image/*' : '*';
      fileInputRef.current.click();
    }
    setShowMenu(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(file.type.startsWith('image') ? URL.createObjectURL(file) : '');
    }
  };

//   const handleSend = () => {
//     if (!selectedFile && !message.trim()) return;

//     console.log('Sending:', { selectedFile, caption, message, type });

//     clearAll();
//   };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Attach button */}
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="bg-[#371449] text-white p-2 rounded-lg hover:bg-[#020621] cursor-pointer"
      >
        <Paperclip />
      </button>

      {/* Attach Menu */}
      {showMenu && (
        <div className="absolute bottom-12  z-10 bg-black rounded-lg shadow-lg w-48">
          <button
            onClick={() => handleOptionClick('image')}
            className="flex items-center w-full px-4 py-2 hover:bg-[#371449]"
          >
            <Image className="mr-3" /> Photo
          </button>
          <button
            onClick={() => handleOptionClick('document')}
            className="flex items-center w-full px-4 py-2 hover:bg-[#371449]"
          >
            <FileText className="mr-3" /> Document
          </button>
        </div>
      )}

      {/* Preview + Send */}
      {(selectedFile) && (
        <div className="absolute bottom-20  bg-white shadow-lg rounded-lg w-72 overflow-hidden">
          <div className="p-4">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-40 object-contain rounded-lg" />
            ) : selectedFile ? (
              <p className="text-sm font-semibold text-gray-700 truncate">{selectedFile.name}</p>
            ) : null}

            {selectedFile && (
              <input
                type="text"
                placeholder="Caption (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="mt-2 w-full border rounded p-1 text-sm"
              />
            )}
          </div>

          <div className="bg-[#1a0529] flex items-center border-t p-2 space-x-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-grow outline-none px-2 text-sm bg-transparent text-white placeholder-gray-400"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              onClick={()=>{clearAll();  sendMessage()}}
              className="bg-green-500 text-white rounded-full p-2 hover:bg-green-600"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentMenu;
