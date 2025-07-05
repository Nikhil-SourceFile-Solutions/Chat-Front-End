import React, { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import axios from 'axios';

const ProfileModal = ({ isOpen, onClose }) => {
  let user = localStorage.getItem('user');
  if (user) {
    user = JSON.parse(user);
  }

  const [defaultParams] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [params, setParams] = useState(defaultParams);
  const [errors, setErrors] = useState({});
  const [isBtnLoading, setIsBtnLoading] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const [profileImage, setProfileImage] = useState(user?.avatar ? 'http://xkoggsw080g8so0og4kco4g4.31.97.61.92.sslip.io/' + user.avatar : '/assets/user.png');
  const [selectedImageFile, setSelectedImageFile] = useState(null);  // Store actual file

  const fileInputRef = useRef();
  const modalRef = useRef();

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setSelectedImageFile(file); // Save the file for API
    }
  };

  const changeValue = (e) => {
    const { value, name } = e.target;
    setErrors(prev => ({ ...prev, [name]: "" }));
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors = {};
    if (!params.name) errors.name = "Name is required";
    if (!params.email) errors.email = "Email is required";
    setErrors(errors);
    return { totalErrors: Object.keys(errors).length };
  };
  
  const token = localStorage.getItem('token');

  const AddOrUpdateApi = async (data) => {
    setIsBtnLoading(true);
    try {
      const response = await axios.post('http://xkoggsw080g8so0og4kco4g4.31.97.61.92.sslip.io/api/update-profile', data, {
        headers: {   Authorization: "Bearer " + token, }
      });

      console.log(response.data);

      if (response.data.status === "success") {
        // Optionally save to localStorage or show success message
       localStorage.setItem('user', response.data.user);
        onClose();
      }

    } catch (error) {
      if (error?.response?.status === 422) {
        const serveErrors = error.response.data.errors;
        const serverErrors = Object.keys(serveErrors).reduce((acc, key) => {
          acc[key] = serveErrors[key][0];
          return acc;
        }, {});
        setErrors(serverErrors);
      } else {
        console.error(error);
      }
    } finally {
      setIsBtnLoading(false);
    }
  };

  const formSubmit = () => {
    const isValid = validate();
    if (isValid.totalErrors) return;

    const data = new FormData();
    data.append('name', params.name);
    data.append('email', params.email);
    data.append('phone', params.phone);

    if (selectedImageFile) {
      data.append('file', selectedImageFile);
    }

    AddOrUpdateApi(data);
  };

  const hasChanges = JSON.stringify(params) !== JSON.stringify(defaultParams) || selectedImageFile;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
        setIsEditingName(false);
        setIsEditingEmail(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex py-8 px-2 justify-center bg-[#1a052982] bg-opacity-50">
      <div ref={modalRef} className="bg-black text-white h-fit p-6 rounded-lg min-w-[400px] max-w-lg shadow-lg">

        <div className="flex justify-center mb-4">
          <img
            src={profileImage}
            alt="Profile"
            className="w-24 h-24 rounded-full cursor-pointer border-4 border-white hover:opacity-80"
            onClick={handleImageClick}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <div className="flex justify-between items-center mb-2">
          {isEditingName ? (
            <input
              type="text"
              name="name"
              value={params.name}
              onChange={changeValue}
              onBlur={() => setIsEditingName(false)}
              autoFocus
              className="text-white bg-transparent border-none focus:outline-none px-2 py-1 w-full"
            />
          ) : (
            <h2 className="text-xl font-semibold truncate">{params.name || 'No Name'}</h2>
          )}
          <Pencil size={16} className="cursor-pointer text-gray-400 hover:text-white" onClick={() => setIsEditingName(true)} />
        </div>
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}

        <div className="flex justify-between items-center mb-4">
          {isEditingEmail ? (
            <input
              type="email"
              name="email"
              value={params.email}
              onChange={changeValue}
              onBlur={() => setIsEditingEmail(false)}
              autoFocus
              className="text-white bg-transparent border-none focus:outline-none px-2 py-1 w-full"
            />
          ) : (
            <p className="text-sm text-gray-300 truncate">{params.email || 'No Email'}</p>
          )}
          <Pencil size={16} className="cursor-pointer text-gray-400 hover:text-white" onClick={() => setIsEditingEmail(true)} />
        </div>
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}

        <div className="text-sm text-gray-300 truncate">
          +91 {params.phone || 'No Phone'}
        </div>

        {hasChanges && (
          <button
            onClick={formSubmit}
            disabled={isBtnLoading}
            className="mt-6 bg-gray-900 cursor-pointer hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full"
          >
            {isBtnLoading ? 'Updating...' : 'Update'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
