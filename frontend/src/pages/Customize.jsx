import React, { useContext, useRef, useState, useEffect } from "react";
import Card from "../components/Card";
import image1 from "../assets/robort1.png";
import image2 from "../assets/robort 2.png";
import image3 from "../assets/robort 3.png";
import image4 from "../assets/robort 4.png";
import image5 from "../assets/robort 5.png";
import image6 from "../assets/robort6.avif";
import image7 from "../assets/robort 7.avif";
import image8 from "../assets/robort 8.avif";
import image9 from "../assets/robort 9.avif";

import { RiImageAddLine } from "react-icons/ri";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { MdKeyboardBackspace } from "react-icons/md";

function Customize() {
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

  const navigate = useNavigate();
  const inputImage = useRef();
  
  // Refs for GSAP animations
  const containerRef = useRef();
  const titleRef = useRef();
  const gridRef = useRef();
  const buttonRef = useRef();
  const backButtonRef = useRef();
  const particlesRef = useRef([]);
  const cardRefs = useRef([]);
  const uploadCardRef = useRef();

  const [particles, setParticles] = useState([]);

  // Initialize card refs
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, 9);
  }, []);

  // Enhanced particles with more properties for GSAP
  useEffect(() => {
    const particleArray = [];
    for (let i = 0; i < 25; i++) {
      particleArray.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        size: Math.random() * 6 + 2,
        duration: Math.random() * 4 + 3,
        color: `hsl(${Math.random() * 60 + 200}, 100%, 70%)`
      });
    }
    setParticles(particleArray);
  }, []);

  // Main GSAP animations - using global GSAP
  useEffect(() => {
    if (!containerRef.current || !window.gsap) return;

    const { gsap } = window;

    // Initial page load animation
    gsap.fromTo(containerRef.current, 
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" }
    );

    // Title animation with floating effect
    gsap.fromTo(titleRef.current,
      { y: -100, opacity: 0, rotationX: 90 },
      { 
        y: 0, 
        opacity: 1, 
        rotationX: 0, 
        duration: 1.5, 
        ease: "back.out(1.7)",
        delay: 0.3
      }
    );

    // Continuous title floating animation
    gsap.to(titleRef.current, {
      y: "+=10",
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Back button slide-in
    gsap.fromTo(backButtonRef.current,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, delay: 0.5, ease: "power3.out" }
    );

    // Grid items staggered animation with rolling effect
    gsap.fromTo(cardRefs.current,
      { 
        opacity: 0, 
        scale: 0, 
        rotationY: 180,
        y: 100
      },
      { 
        opacity: 1, 
        scale: 1, 
        rotationY: 0,
        y: 0,
        duration: 1,
        stagger: {
          amount: 1.5,
          from: "random"
        },
        ease: "back.out(1.5)",
        delay: 0.8
      }
    );

    // Upload card specific animation
    gsap.fromTo(uploadCardRef.current,
      { 
        opacity: 0, 
        scale: 0.5, 
        rotation: 360 
      },
      { 
        opacity: 1, 
        scale: 1, 
        rotation: 0, 
        duration: 1.2, 
        ease: "elastic.out(1, 0.5)",
        delay: 1.5 
      }
    );

    // Enhanced particle animations
    particlesRef.current.forEach((particle, i) => {
      if (particle) {
        gsap.to(particle, {
          y: `+=${Math.random() * 100 - 50}`,
          x: `+=${Math.random() * 60 - 30}`,
          rotation: `+=${Math.random() * 360}`,
          duration: Math.random() * 3 + 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 2
        });
      }
    });

  }, []);

  // Next button animation when selectedImage changes
  useEffect(() => {
    if (selectedImage && buttonRef.current && window.gsap) {
      const { gsap } = window;
      
      gsap.fromTo(buttonRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.8)" }
      );
    }
  }, [selectedImage]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
    setSelectedImage("input"); // Set to "input" when file is selected
    
    // Animation when image is selected
    if (uploadCardRef.current && window.gsap) {
      const { gsap } = window;
      
      gsap.fromTo(uploadCardRef.current,
        { scale: 0.8 },
        { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1, ease: "power2.inOut" }
      );
    }
  };

  const handleCardClick = (index) => {
    // Animate the clicked card
    if (cardRefs.current[index] && window.gsap) {
      const { gsap } = window;
      
      gsap.fromTo(cardRefs.current[index],
        { scale: 1 },
        { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut" }
      );
    }
  };

  const handleNextClick = () => {
    if (!window.gsap) {
      navigate("/customize2");
      return;
    }
    
    const { gsap } = window;
    
    // Page transition animation
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 1.1,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => navigate("/customize2")
    });
  };

  const handleBackClick = () => {
    if (!window.gsap) {
      navigate("/");
      return;
    }
    
    const { gsap } = window;
    
    gsap.to(containerRef.current, {
      opacity: 0,
      x: -100,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => navigate("/")
    });
  };

  const imageList = [image1, image2, image3, image4, image5, image6, image7, image8, image9];

  return (
    <div 
      ref={containerRef}
      className="w-full h-[100vh] relative flex justify-center items-center flex-col p-[20px] overflow-hidden"
    >
      
      {/* Enhanced Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-[#020230] to-[#0d0d50]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffffff08] to-transparent animate-shimmer"></div>
      </div>

      {/* Enhanced Floating Particles */}
      {particles.map((p, index) => (
        <span
          key={p.id}
          ref={el => particlesRef.current[index] = el}
          className="absolute rounded-full opacity-60 blur-[1px]"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`
          }}
        ></span>
      ))}

      {/* Back Button */}
      <div ref={backButtonRef}>
        <MdKeyboardBackspace
          className="absolute top-[30px] left-[30px] text-white cursor-pointer w-[25px] h-[25px] hover:scale-110 transition-transform duration-300 z-10"
          onClick={handleBackClick}
        />
      </div>

      {/* Enhanced Title */}
      <h1 ref={titleRef} className="mb-[40px] text-[32px] text-center font-bold gradient-text drop-shadow-lg relative">
        Select your <span className="text-highlight">Assistant Image</span>
        <div className="absolute inset-0 blur-md opacity-30 gradient-text -z-10"></div>
      </h1>

      {/* Enhanced Image Grid */}
      <div ref={gridRef} className="w-full max-w-[900px] flex justify-center items-center flex-wrap gap-[15px]">
        {imageList.map((image, index) => (
          <div 
            key={index}
            ref={el => cardRefs.current[index] = el}
            onClick={() => {
              setSelectedImage(`card-${index}`);
              handleCardClick(index);
            }}
            className="cursor-pointer"
          >
            <Card image={image} index={index} />
          </div>
        ))}

        {/* Enhanced Upload Option */}
        <div
          ref={uploadCardRef}
          className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#020220] border-2 border-[#0000ff66] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white flex items-center justify-center transition-all duration-300 relative ${
            selectedImage === "input"
              ? "border-4 border-white shadow-2xl shadow-blue-950"
              : ""
          }`}
          onClick={() => {
            inputImage.current.click();
            setSelectedImage("input");
          }}
        >
          {/* Animated border effect when selected */}
          {selectedImage === "input" && (
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-spin-slow opacity-70"></div>
          )}
          
          <div className="absolute inset-[2px] bg-[#020220] rounded-2xl z-10 flex items-center justify-center">
            {!frontendImage && (
              <RiImageAddLine className="text-white w-[25px] h-[25px]" />
            )}
            {frontendImage && (
              <img src={frontendImage} className="h-full object-cover rounded-2xl" alt="Uploaded assistant" />
            )}
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          ref={inputImage}
          hidden
          onChange={handleImage}
        />
      </div>

      {/* Enhanced Next Button */}
      {selectedImage && (
        <button
          ref={buttonRef}
          className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold cursor-pointer bg-white rounded-full text-[19px] shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
          onClick={handleNextClick}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
          <span className="relative z-10">Next</span>
        </button>
      )}

      {/* Enhanced Animations & Styles */}
      <style jsx="true">{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .gradient-text {
          background: linear-gradient(90deg, #00c6ff, #0072ff, #00ff9d, #0072ff, #00c6ff);
          background-size: 300% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: gradient 3s ease infinite;
        }
        
        .text-highlight {
          background: linear-gradient(90deg, #ff6a00, #ff0099, #ff6a00);
          background-size: 300% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default Customize;
