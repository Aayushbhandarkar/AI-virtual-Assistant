import React, { useContext } from 'react';
import { userDataContext } from '../context/UserContext';

function Card({ image }) {
  const {
    serverUrl,
    userData,
    setUserData,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage
  } = useContext(userDataContext);

  return (
    <div
      className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] 
      bg-[#020220] border-2 border-[#0000ff66] rounded-2xl overflow-hidden 
      transition-all duration-300 ease-in-out 
      hover:shadow-[0_0_25px_#3b82f6] hover:border-white hover:border-4 
      cursor-pointer 
      ${selectedImage === image ? "border-4 border-white shadow-[0_0_25px_#3b82f6]" : ""}`}
      onClick={() => {
        setSelectedImage(image);
        setBackendImage(null);
        setFrontendImage(null);
      }}
    >
      <img src={image} className='h-full w-full object-cover' alt="assistant avatar" />
    </div>
  );
}

export default Card;
