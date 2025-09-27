import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'

// Import the default images here so they're available globally
import image1 from "../assets/robort1.png";
import image2 from "../assets/robort 2.png";
import image3 from "../assets/robort 3.png";
import image4 from "../assets/robort 4.png";
import image5 from "../assets/robort 5.png";
import image6 from "../assets/robort6.avif";
import image7 from "../assets/robort 7.avif";
import image8 from "../assets/robort 8.avif";
import image9 from "../assets/robort 9.avif";

export const userDataContext = createContext()

// Create a map of default images
const defaultImages = [image1, image2, image3, image4, image5, image6, image7, image8, image9];

function UserContext({children}) {
    const serverUrl = "https://ai-virtual-assistant-backend-grw9.onrender.com"
    const [userData, setUserData] = useState(null)
    const [frontendImage, setFrontendImage] = useState(null)
    const [backendImage, setBackendImage] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)
    const [assistantImage, setAssistantImage] = useState(null) // New state for the actual image

    const handleCurrentUser = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/user/current`, {withCredentials: true})
            setUserData(result.data)
            console.log(result.data)
        } catch (error) {
            console.log(error)
        }
    }

    const getGeminiResponse = async (command) => {
        try {
            const result = await axios.post(`${serverUrl}/api/user/asktoassistant`, {command}, {withCredentials: true})
            return result.data
        } catch (error) {
            console.log(error)
        }
    }

    // Function to get the actual image based on selection
    const getCurrentAssistantImage = () => {
        // If user uploaded an image
        if (frontendImage) {
            return frontendImage;
        }
        
        // If a card was selected
        if (selectedImage && selectedImage.startsWith('card-')) {
            const imageIndex = parseInt(selectedImage.split('-')[1]);
            return defaultImages[imageIndex] || defaultImages[0];
        }
        
        // Fallback to previously set assistant image or default
        return assistantImage || defaultImages[0];
    }

    // Update assistant image when selection changes
    useEffect(() => {
        const newImage = getCurrentAssistantImage();
        setAssistantImage(newImage);
    }, [selectedImage, frontendImage]);

    useEffect(() => {
        handleCurrentUser()
    }, [])

    const value = {
        serverUrl, 
        userData, 
        setUserData, 
        backendImage, 
        setBackendImage, 
        frontendImage, 
        setFrontendImage, 
        selectedImage, 
        setSelectedImage, 
        getGeminiResponse,
        assistantImage, // Provide the actual image
        defaultImages, // Provide the default images array
        getCurrentAssistantImage // Provide the function as well
    }

    return (
        <div>
            <userDataContext.Provider value={value}>
                {children}
            </userDataContext.Provider>
        </div>
    )
}

export default UserContext
