import React, { useContext } from 'react'
import { userDataContext } from '../context/UserContext'

function Card({ image, index, onSelect }) {
  const { 
    selectedImage, 
    setSelectedImage,
    updateAssistantImage 
  } = useContext(userDataContext)
  
  const handleCardClick = () => {
    const cardId = `card-${index}`
    setSelectedImage(cardId)
    
    // Update the assistant image in userData
    updateAssistantImage(image)
    
    // Call the onSelect prop if provided
    if (onSelect) {
      onSelect(image)
    }
  }

  const isSelected = selectedImage === `card-${index}`

  return (
    <div 
      className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#020220] border-2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300
        ${isSelected 
          ? "border-4 border-white shadow-2xl shadow-blue-950" 
          : "border-[#0000ff66] hover:border-4 hover:border-white hover:shadow-2xl hover:shadow-blue-950"
        }`} 
      onClick={handleCardClick}
    >
      <img 
        src={image} 
        className='h-full w-full object-cover' 
        alt={`Assistant ${index + 1}`} 
      />
    </div>
  )
}

export default Card
