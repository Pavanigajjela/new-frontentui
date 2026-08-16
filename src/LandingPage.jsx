// src/LandingPage.jsx
// Complete EdTech Platform with Navbar Categories & Subcategories Dropdown
// Real website behavior - Udemy/Coursera style navigation

import React, { useState, useEffect, useCallback } from "react";
import "./LandingPage.css";
import { authAPI, apiUtils } from "./services/api"; // Import API services
import { useProfilePhoto } from "./utils/profilePhoto";
import { useNavigate } from "react-router-dom";

// Icon CDN imports
const icons = {
  logo: "https://cdn-icons-png.flaticon.com/512/2921/2921222.png",
  cart: "https://cdn-icons-png.flaticon.com/512/3144/3144456.png",
  wishlist: "https://cdn-icons-png.flaticon.com/512/2589/2589175.png",
  wishlistFilled: "https://cdn-icons-png.flaticon.com/512/833/833472.png",
  user: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  logout: "https://cdn-icons-png.flaticon.com/512/1828/1828490.png",
  edit: "https://cdn-icons-png.flaticon.com/512/1250/1250615.png",
  courses: "https://cdn-icons-png.flaticon.com/512/2991/2991106.png",
  devices: "https://cdn-icons-png.flaticon.com/512/2997/2997911.png",
  facebook: "https://cdn-icons-png.flaticon.com/512/733/733547.png",
  twitter: "https://cdn-icons-png.flaticon.com/512/733/733579.png",
  instagram: "https://cdn-icons-png.flaticon.com/512/733/733558.png",
  linkedin: "https://cdn-icons-png.flaticon.com/512/733/733561.png",
  youtube: "https://cdn-icons-png.flaticon.com/512/733/733646.png",
  play: "https://cdn-icons-png.flaticon.com/512/727/727245.png",
  arrow: "https://cdn-icons-png.flaticon.com/512/271/271228.png",
  students: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  instructors: "https://cdn-icons-png.flaticon.com/512/1995/1995572.png",
  placement: "https://cdn-icons-png.flaticon.com/512/3135/3135764.png",
  partners: "https://cdn-icons-png.flaticon.com/512/883/883786.png",
  close: "https://cdn-icons-png.flaticon.com/512/1828/1828774.png",
  delete: "https://cdn-icons-png.flaticon.com/512/6861/6861362.png",
  emptyWishlist: "https://cdn-icons-png.flaticon.com/512/2589/2589175.png",
  clock: "https://cdn-icons-png.flaticon.com/512/3617/3617529.png",
  level: "https://cdn-icons-png.flaticon.com/512/3617/3617462.png",
  dropdown: "https://cdn-icons-png.flaticon.com/512/271/271228.png",
  development: "https://cdn-icons-png.flaticon.com/512/1055/1055687.png",
  dataScience: "https://cdn-icons-png.flaticon.com/512/2103/2103633.png",
  security: "https://cdn-icons-png.flaticon.com/512/3075/3075217.png",
  cloud: "https://cdn-icons-png.flaticon.com/512/4248/4248467.png",
  design: "https://cdn-icons-png.flaticon.com/512/2842/2842795.png",
  devops: "https://cdn-icons-png.flaticon.com/512/919/919851.png",
};

// Complete course catalog with categories and subcategories
const allCourses = [
  // Development Category
  { id: 1, title: "Full Stack Web Development Bootcamp", duration: "6 Months", level: "Beginner to Pro", rating: 4.8, students: "24.5k", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=280&fit=crop", price: 29999, discount: 25, features: ["React", "Node.js", "MongoDB", "Express"], category: "Development", subcategory: "Web Development", instructor: "Dr. Sarah Johnson", lectures: 186, projects: 12 },
  { id: 2, title: "React.js Masterclass", duration: "3 Months", level: "Intermediate", rating: 4.9, students: "15.2k", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=280&fit=crop", price: 19999, discount: 20, features: ["Hooks", "Redux", "Next.js", "Tailwind"], category: "Development", subcategory: "Frontend Development", instructor: "John Doe", lectures: 120, projects: 8 },
  { id: 3, title: "Python Programming", duration: "2 Months", level: "Beginner", rating: 4.7, students: "32.1k", image: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=500&h=280&fit=crop", price: 14999, discount: 15, features: ["Python Basics", "OOP", "Libraries", "APIs"], category: "Development", subcategory: "Programming Languages", instructor: "Jane Smith", lectures: 95, projects: 10 },
  
  // Data Science Category
  { id: 4, title: "Data Science & AI Mastery", duration: "5 Months", level: "Intermediate", rating: 4.9, students: "18.2k", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=280&fit=crop", price: 34999, discount: 30, features: ["Python", "Machine Learning", "Deep Learning", "Tableau"], category: "Data Science", subcategory: "Machine Learning", instructor: "Prof. Michael Chen", lectures: 210, projects: 8 },
  { id: 5, title: "Data Analytics Bootcamp", duration: "3 Months", level: "Beginner", rating: 4.7, students: "12.5k", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=280&fit=crop", price: 19999, discount: 20, features: ["SQL", "Excel", "Power BI", "Tableau"], category: "Data Science", subcategory: "Data Analytics", instructor: "Lisa Wong", lectures: 110, projects: 6 },
  
  // Cybersecurity Category
  { id: 6, title: "Cybersecurity Analyst Certification", duration: "4 Months", level: "Beginner", rating: 4.7, students: "9.4k", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&h=280&fit=crop", price: 27999, discount: 15, features: ["Network Security", "Ethical Hacking", "Cryptography"], category: "Cybersecurity", subcategory: "Network Security", instructor: "Lisa Rodriguez", lectures: 142, projects: 6 },
  { id: 7, title: "Ethical Hacking Professional", duration: "3 Months", level: "Intermediate", rating: 4.8, students: "7.8k", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&h=280&fit=crop", price: 25999, discount: 20, features: ["Penetration Testing", "Kali Linux", "Metasploit"], category: "Cybersecurity", subcategory: "Ethical Hacking", instructor: "Alex Morgan", lectures: 98, projects: 5 },
  
  // Cloud Computing Category
  { id: 8, title: "Cloud Computing (AWS + Azure)", duration: "4 Months", level: "Intermediate", rating: 4.8, students: "12.1k", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&h=280&fit=crop", price: 31999, discount: 20, features: ["AWS", "Azure", "DevOps", "Kubernetes"], category: "Cloud Computing", subcategory: "AWS", instructor: "James Wilson", lectures: 158, projects: 10 },
  { id: 9, title: "Azure Cloud Engineer", duration: "3 Months", level: "Beginner", rating: 4.6, students: "6.2k", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&h=280&fit=crop", price: 24999, discount: 15, features: ["Azure Services", "ARM Templates", "Azure DevOps"], category: "Cloud Computing", subcategory: "Azure", instructor: "Maria Garcia", lectures: 112, projects: 7 },
  
  // Design Category
  { id: 10, title: "UI/UX Design Professional", duration: "3 Months", level: "All Levels", rating: 4.9, students: "15.3k", image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&h=280&fit=crop", price: 24999, discount: 20, features: ["Figma", "Prototyping", "User Research"], category: "Design", subcategory: "UI/UX Design", instructor: "Emma Davis", lectures: 98, projects: 7 },
  { id: 11, title: "Graphic Design Masterclass", duration: "2 Months", level: "Beginner", rating: 4.7, students: "22.1k", image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&h=280&fit=crop", price: 17999, discount: 15, features: ["Photoshop", "Illustrator", "After Effects"], category: "Design", subcategory: "Graphic Design", instructor: "Chris Evans", lectures: 85, projects: 12 },
  
  // DevOps Category
  { id: 12, title: "DevOps Engineering Masterclass", duration: "5 Months", level: "Advanced", rating: 4.8, students: "8.7k", image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=500&h=280&fit=crop", price: 36999, discount: 25, features: ["CI/CD", "Docker", "K8s", "Terraform"], category: "DevOps", subcategory: "CI/CD", instructor: "David Kumar", lectures: 175, projects: 9 },
];

// Category configuration with subcategories
const categories = [
  {
    name: "Development",
    icon: icons.development,
    subcategories: ["Web Development", "Mobile Development", "Frontend Development", "Backend Development", "Programming Languages", "Game Development"]
  },
  {
    name: "Data Science",
    icon: icons.dataScience,
    subcategories: ["Machine Learning", "Deep Learning", "Data Analytics", "Business Intelligence", "Big Data", "Data Visualization"]
  },
  {
    name: "Cybersecurity",
    icon: icons.security,
    subcategories: ["Network Security", "Ethical Hacking", "Security Compliance", "Risk Management", "Cryptography", "Cloud Security"]
  },
  {
    name: "Cloud Computing",
    icon: icons.cloud,
    subcategories: ["AWS", "Azure", "Google Cloud", "Cloud Architecture", "Cloud Security", "Serverless"]
  },
  {
    name: "Design",
    icon: icons.design,
    subcategories: ["UI/UX Design", "Graphic Design", "Motion Design", "3D Design", "Product Design", "Figma Mastery"]
  },
  {
    name: "DevOps",
    icon: icons.devops,
    subcategories: ["CI/CD Pipeline", "Docker", "Kubernetes", "Terraform", "Jenkins", "GitHub Actions"]
  }
];

const LandingPage = () => {
  // Router
  const navigate = useNavigate();

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const profilePhoto = useProfilePhoto();
  
  // Cart & Wishlist State
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  
  // UI State
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [emailSubscribe, setEmailSubscribe] = useState("");
  const [profileData, setProfileData] = useState({ name: "", phone: "", location: "", bio: "" });
  
  // Category dropdown state
  const [openCategory, setOpenCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [filteredCourses, setFilteredCourses] = useState(allCourses);

  // Helper: Show toast notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Filter courses based on category and subcategory
  useEffect(() => {
    let filtered = allCourses;
    if (selectedCategory !== "All") {
      filtered = filtered.filter(course => course.category === selectedCategory);
      if (selectedSubcategory !== "All") {
        filtered = filtered.filter(course => course.subcategory === selectedSubcategory);
      }
    }
    setFilteredCourses(filtered);
  }, [selectedCategory, selectedSubcategory]);

  // Load all data from localStorage
  const loadAuthState = useCallback(() => {
    const logged = localStorage.getItem("isLoggedIn") === "true";
    const email = localStorage.getItem("userEmail") || "";
    setIsLoggedIn(logged);
    setUserEmail(email);
    if (logged && email) {
      const profiles = JSON.parse(localStorage.getItem("userProfiles") || "{}");
      const prof = profiles[email];
      if (prof && prof.name) setUserName(prof.name);
      else setUserName(email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1));
    } else {
      setUserName("");
    }
  }, []);

  const loadCartAndWishlist = useCallback(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setCartItems(cart);
    setWishlistItems(wishlist);
    setCartCount(cart.length);
    setWishlistCount(wishlist.length);
  }, []);

  const loadProfileData = useCallback(() => {
    if (!isLoggedIn || !userEmail) return;
    const profiles = JSON.parse(localStorage.getItem("userProfiles") || "{}");
    const prof = profiles[userEmail] || {};
    setProfileData({
      name: prof.name || userName,
      phone: prof.phone || "",
      location: prof.location || "",
      bio: prof.bio || "",
    });
  }, [isLoggedIn, userEmail, userName]);

  // Initial load & event listeners
  useEffect(() => {
    loadAuthState();
    loadCartAndWishlist();
    
    const handleStorage = (e) => {
      if (e.key === "cart" || e.key === "wishlist") loadCartAndWishlist();
      if (e.key === "isLoggedIn" || e.key === "userEmail") loadAuthState();
      if (e.key === "userProfiles") loadProfileData();
    };
    
    window.addEventListener("storage", handleStorage);
    window.addEventListener("cartUpdated", loadCartAndWishlist);
    window.addEventListener("wishlistUpdated", loadCartAndWishlist);
    window.addEventListener("profileUpdated", loadProfileData);
    
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cartUpdated", loadCartAndWishlist);
      window.removeEventListener("wishlistUpdated", loadCartAndWishlist);
      window.removeEventListener("profileUpdated", loadProfileData);
    };
  }, [loadAuthState, loadCartAndWishlist, loadProfileData]);

  useEffect(() => {
    if (isLoggedIn && userEmail) loadProfileData();
  }, [isLoggedIn, userEmail, loadProfileData]);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Testimonials auto-rotate
  const testimonials = [
    { name: "Sarah Chen", role: "Software Engineer @ Google", content: "The Full Stack course transformed my career! Got hired within 2 months. The projects were exactly what employers wanted.", rating: 5, image: "https://randomuser.me/api/portraits/women/68.jpg" },
    { name: "Michael Okafor", role: "Data Scientist @ Amazon", content: "Best investment in my career. The AI curriculum is cutting-edge and the mentorship is outstanding.", rating: 5, image: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Priya Mehta", role: "Security Lead @ Microsoft", content: "Cybersecurity course is comprehensive. The hands-on labs prepared me for real-world challenges.", rating: 5, image: "https://randomuser.me/api/portraits/women/44.jpg" },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => setActiveTestimonial(prev => (prev + 1) % testimonials.length), 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // ========== CORE FUNCTIONS ==========
  
  const handleAddToCart = (course, e) => {
    if (e) e.stopPropagation();
    if (!isLoggedIn) {
      showNotification("Please login to add items to cart", "warning");
      setTimeout(() => { window.location.href = "/login"; }, 1500);
      return;
    }
    const existing = cartItems.find(item => item.id === course.id);
    if (!existing) {
      const updatedCart = [...cartItems, { ...course, quantity: 1, addedAt: new Date().toISOString() }];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      loadCartAndWishlist();
      window.dispatchEvent(new Event("cartUpdated"));
      showNotification(`${course.title} added to cart!`, "success");
    } else {
      showNotification("Course already in cart", "info");
    }
  };

  const handleAddToWishlist = (course, e) => {
    if (e) e.stopPropagation();
    if (!isLoggedIn) {
      showNotification("Please login to add to wishlist", "warning");
      setTimeout(() => { window.location.href = "/login"; }, 1500);
      return;
    }
    const existing = wishlistItems.find(item => item.id === course.id);
    if (!existing) {
      const updatedWishlist = [...wishlistItems, { 
        id: course.id, title: course.title, image: course.image, price: course.price, 
        duration: course.duration, level: course.level, rating: course.rating, discount: course.discount 
      }];
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      loadCartAndWishlist();
      window.dispatchEvent(new Event("wishlistUpdated"));
      showNotification(`${course.title} added to wishlist!`, "success");
    } else {
      showNotification("Already in wishlist", "info");
    }
  };

  const handleRemoveFromWishlist = (courseId, e) => {
    if (e) e.stopPropagation();
    const updated = wishlistItems.filter(item => item.id !== courseId);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    loadCartAndWishlist();
    window.dispatchEvent(new Event("wishlistUpdated"));
    showNotification("Removed from wishlist", "info");
  };

  const handleRemoveFromCart = (courseId, e) => {
    if (e) e.stopPropagation();
    const updated = cartItems.filter(item => item.id !== courseId);
    localStorage.setItem("cart", JSON.stringify(updated));
    loadCartAndWishlist();
    window.dispatchEvent(new Event("cartUpdated"));
    showNotification("Removed from cart", "info");
  };

  const isInWishlist = (id) => wishlistItems.some(item => item.id === id);

  const navigateToCourse = (courseId) => {
    window.location.href = `/course/${courseId}`;
  };

  const navigateToCart = () => {
    if (!isLoggedIn) {
      showNotification("Please login to view cart", "warning");
      setTimeout(() => { window.location.href = "/login"; }, 1000);
      return;
    }
    window.location.href = "/cart";
  };

  const openWishlistModal = () => {
    if (!isLoggedIn) {
      showNotification("Please login to view wishlist", "warning");
      setTimeout(() => { window.location.href = "/login"; }, 1000);
      return;
    }
    setShowWishlistModal(true);
    setShowProfileMenu(false);
  };

  const openCartModal = () => {
    if (!isLoggedIn) {
      showNotification("Please login to view cart", "warning");
      setTimeout(() => { window.location.href = "/login"; }, 1000);
      return;
    }
    setShowCartModal(true);
    setShowProfileMenu(false);
  };

  const handleLogout = async () => {
    try {
      // Call logout API
      const response = await authAPI.logout();
      
      if (response.success) {
        // Clear local storage and auth state
        apiUtils.clearAuth();
        setIsLoggedIn(false);
        setShowProfileMenu(false);
        showNotification("Logged out successfully ✅", "success");
        
        // Redirect to home
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 500);
      } else {
        showNotification(response.message || "Logout failed. Please try again ❌", "error");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: clear local storage even if API fails
      apiUtils.clearAuth();
      setIsLoggedIn(false);
      setShowProfileMenu(false);
      showNotification("Logged out ✅", "success");
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 500);
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const profiles = JSON.parse(localStorage.getItem("userProfiles") || "{}");
    profiles[userEmail] = { ...profileData, name: profileData.name, email: userEmail };
    localStorage.setItem("userProfiles", JSON.stringify(profiles));
    setUserName(profileData.name);
    window.dispatchEvent(new Event("profileUpdated"));
    setShowEditProfile(false);
    showNotification("Profile updated successfully!", "success");
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (emailSubscribe) {
      showNotification("Subscribed successfully! 🎉", "success");
      setEmailSubscribe("");
    }
  };

  const getDiscountedPrice = (price, discount) => {
    return price * (100 - (discount || 0)) / 100;
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setOpenCategory(null);
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedSubcategory("All");
    setOpenCategory(null);
    scrollToSection("courses");
  };

  const handleSubcategoryClick = (categoryName, subcategory) => {
    setSelectedCategory(categoryName);
    setSelectedSubcategory(subcategory);
    setOpenCategory(null);
    scrollToSection("courses");
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedSubcategory("All");
    scrollToSection("courses");
  };

  const stats = [
    { number: "85,000+", label: "Active Learners", icon: icons.students },
    { number: "600+", label: "Expert Instructors", icon: icons.instructors },
    { number: "94%", label: "Career Transition", icon: icons.placement },
    { number: "350+", label: "Corporate Allies", icon: icons.partners },
  ];

  const partners = [
    "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
  ];

  return (
    <div className="landing-page">
      {/* NOTIFICATION TOAST */}
      {notification.show && (
        <div className={`toast ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification({ show: false, message: "", type: "" })}>×</button>
        </div>
      )}

      {/* WISHLIST MODAL */}
      {showWishlistModal && (
        <div className="modal-overlay" onClick={() => setShowWishlistModal(false)}>
          <div className="modal wishlist-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>❤️ My Wishlist ({wishlistCount})</h2>
              <button className="close-modal" onClick={() => setShowWishlistModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {wishlistItems.length === 0 ? (
                <div className="empty-state">
                  <img src={icons.emptyWishlist} alt="empty" />
                  <p>Your wishlist is empty</p>
                  <button className="btn-outline" onClick={() => setShowWishlistModal(false)}>Browse Courses</button>
                </div>
              ) : (
                <div className="wishlist-items-container">
                  {wishlistItems.map(item => {
                    const finalPrice = getDiscountedPrice(item.price, item.discount);
                    return (
                      <div key={item.id} className="wishlist-item-card">
                        <img src={item.image} alt={item.title} className="wishlist-item-img" onClick={() => navigateToCourse(item.id)} />
                        <div className="wishlist-item-info">
                          <h4 onClick={() => navigateToCourse(item.id)}>{item.title}</h4>
                          <div className="wishlist-meta">
                            <span>📅 {item.duration}</span>
                            <span>📊 {item.level}</span>
                            <span>⭐ {item.rating}</span>
                          </div>
                          <div className="wishlist-pricing">
                            <span className="current-price">₹{finalPrice.toLocaleString()}</span>
                            {item.discount > 0 && <span className="original-price">₹{item.price.toLocaleString()}</span>}
                          </div>
                        </div>
                        <div className="wishlist-item-actions">
                          <button className="action-btn add-to-cart" onClick={(e) => handleAddToCart(item, e)}>🛒 Add to Cart</button>
                          <button className="action-btn remove" onClick={(e) => handleRemoveFromWishlist(item.id, e)}>🗑️ Remove</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CART MODAL */}
      {showCartModal && (
        <div className="modal-overlay" onClick={() => setShowCartModal(false)}>
          <div className="modal cart-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🛒 My Cart ({cartCount})</h2>
              <button className="close-modal" onClick={() => setShowCartModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {cartItems.length === 0 ? (
                <div className="empty-state">
                  <img src={icons.emptyWishlist} alt="empty" />
                  <p>Your cart is empty</p>
                  <button className="btn-outline" onClick={() => setShowCartModal(false)}>Start Learning</button>
                </div>
              ) : (
                <>
                  <div className="cart-items-container">
                    {cartItems.map(item => {
                      const finalPrice = getDiscountedPrice(item.price, item.discount);
                      return (
                        <div key={item.id} className="cart-item-card">
                          <img src={item.image} alt={item.title} />
                          <div className="cart-item-info">
                            <h4>{item.title}</h4>
                            <p>{item.duration} • {item.level}</p>
                            <strong>₹{finalPrice.toLocaleString()}</strong>
                          </div>
                          <button className="remove-btn" onClick={(e) => handleRemoveFromCart(item.id, e)}>Remove</button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="cart-total">
                    <strong>Total: ₹{cartItems.reduce((sum, item) => sum + getDiscountedPrice(item.price, item.discount), 0).toLocaleString()}</strong>
                  </div>
                  <button className="checkout-btn" onClick={navigateToCart}>Proceed to Checkout →</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditProfile && (
        <div className="modal-overlay" onClick={() => setShowEditProfile(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Profile</h2>
              <button className="close-modal" onClick={() => setShowEditProfile(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <input type="text" placeholder="Full Name" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} required />
              <input type="email" value={userEmail} disabled className="disabled" />
              <input type="tel" placeholder="Phone Number" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} />
              <input type="text" placeholder="Location" value={profileData.location} onChange={e => setProfileData({ ...profileData, location: e.target.value })} />
              <textarea placeholder="Bio" value={profileData.bio} onChange={e => setProfileData({ ...profileData, bio: e.target.value })} rows="3" />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditProfile(false)}>Cancel</button>
                <button type="submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NAVBAR WITH CATEGORIES DROPDOWN */}
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="container nav-flex">
          <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src={icons.logo} alt="logo" />
            <span>EduFlow</span>
          </div>
          
          <div className="nav-links">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection("home"); }}>Home</a>
            
            {/* Courses with Mega Dropdown */}
            <div className="nav-item-dropdown" onMouseLeave={() => setOpenCategory(null)}>
              <a href="#courses" className="dropdown-trigger" onMouseEnter={() => setOpenCategory("courses")}>
                Courses <span className="dropdown-arrow-icon">▼</span>
              </a>
              {openCategory === "courses" && (
                <div className="mega-dropdown" onMouseEnter={() => setOpenCategory("courses")}>
                  <div className="mega-dropdown-container">
                    <div className="mega-dropdown-header">
                      <h3>Explore All Categories</h3>
                      <button className="view-all-categories" onClick={resetFilters}>View All Courses →</button>
                    </div>
                    <div className="categories-grid">
                      {categories.map((category, idx) => (
                        <div key={idx} className="category-column">
                          <div className="category-header" onClick={() => handleCategoryClick(category.name)}>
                            <img src={category.icon} alt={category.name} />
                            <span>{category.name}</span>
                          </div>
                          <ul className="subcategory-list">
                            {category.subcategories.slice(0, 5).map((sub, subIdx) => (
                              <li key={subIdx} onClick={() => handleSubcategoryClick(category.name, sub)}>
                                {sub}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection("features"); }}>Features</a>
            <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollToSection("testimonials"); }}>Success Stories</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection("contact"); }}>Contact</a>
          </div>
          
          <div className="nav-actions">
            {!isLoggedIn ? (
              <>
                <button className="btn-login" onClick={() => window.location.href = "/login"}>Log In</button>
                <button className="btn-signup" onClick={() => window.location.href = "/signup"}>Sign Up</button>
              </>
            ) : (
              <>
                <div className="action-icons">
                  <button className="icon-circle" onClick={openWishlistModal}>
                    <img src={icons.wishlist} alt="wishlist" />
                    {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
                  </button>
                  <button className="icon-circle" onClick={openCartModal}>
                    <img src={icons.cart} alt="cart" />
                    {cartCount > 0 && <span className="badge">{cartCount}</span>}
                  </button>
                </div>
                <div className="user-dropdown">
                  <div className="user-trigger" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                    <div className="avatar">
                      {profilePhoto
                        ? <img src={profilePhoto} alt={userName} />
                        : userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="user-name">Hi, {userName.split(' ')[0]}</span>
                    <span>{showProfileMenu ? "▲" : "▼"}</span>
                  </div>
                  {showProfileMenu && (
                    <div className="dropdown-menu">
                      <div className="dropdown-header">
                        <div className="avatar-lg">
                          {profilePhoto
                            ? <img src={profilePhoto} alt={userName} />
                            : userName.charAt(0).toUpperCase()}
                        </div>
                        <div><strong>{userName}</strong><p>{userEmail}</p></div>
                      </div>
                      
                      {/* View Profile Button */}
                      <button onClick={() => {
                        setShowProfileMenu(false);
                        const token = localStorage.getItem("accessToken");
                        const loggedIn = localStorage.getItem("isLoggedIn") === "true";
                        if (token && loggedIn) {
                          navigate("/profile");
                        } else {
                          showNotification("Please login to access your profile", "error");
                          navigate("/login");
                        }
                      }}>
                        <img src={icons.user} alt="" /> View Profile
                      </button>
                      
                      {/* My Courses Button */}
                      <button onClick={() => { 
                        setShowProfileMenu(false); 
                        window.location.href = "/my-courses"; 
                      }}>
                        <img src={icons.courses} alt="" /> My Courses
                      </button>
                      
                      {/* Cart Button */}
                      <button onClick={() => { 
                        setShowProfileMenu(false); 
                        openCartModal(); 
                      }}>
                        <img src={icons.cart} alt="" /> Cart ({cartCount})
                      </button>
                      
                      {/* Wishlist Button */}
                      <button onClick={() => { 
                        setShowProfileMenu(false); 
                        openWishlistModal(); 
                      }}>
                        <img src={icons.wishlist} alt="" /> Wishlist ({wishlistCount})
                      </button>
                      
                      {/* NEW: Active Devices / Session Management Button */}
                      <button onClick={() => {
                        setShowProfileMenu(false);
                        const token = localStorage.getItem("accessToken");
                        const loggedIn = localStorage.getItem("isLoggedIn") === "true";
                        if (token && loggedIn) {
                          navigate("/devices");
                        } else {
                          showNotification("Please login to manage devices", "error");
                          navigate("/login");
                        }
                      }}>
                        <img src={icons.devices} alt="devices" /> Active Devices
                      </button>
                      
                      {/* Logout Button */}
                      <button className="logout-btn" onClick={handleLogout}>
                        <img src={icons.logout} alt="" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="home" className="hero">
        <div className="container hero-grid">
          <div className="hero-text">
            <div className="badge"><span>🔥 Join 85,000+ Successful Students</span></div>
            <h1>Master the Digital World with <span className="gradient">EduFlow</span></h1>
            <p>Accelerate your career with industry-leading courses, hands-on projects, and expert mentorship.</p>
            <div className="hero-btns">
              {!isLoggedIn ? 
                <button className="btn-primary" onClick={() => window.location.href = "/signup"}>Start Learning Now →</button> :
                <button className="btn-primary" onClick={() => window.location.href = "/courses"}>Continue Learning →</button>
              }
              <button className="btn-secondary" onClick={() => window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank")}>
                Watch Demo <img src={icons.play} alt="" />
              </button>
            </div>
            <div className="hero-stats">
              {stats.map((s, idx) => (
                <div key={idx}>
                  <img src={s.icon} alt="" />
                  <h3>{s.number}</h3>
                  <p>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=500&fit=crop" alt="learning" />
            <div className="floating-card top-right">🎯 90% Completion Rate</div>
            <div className="floating-card bottom-left">🏆 Certificate Included</div>
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <div className="partner-strip">
        <div className="container">
          <p>Trusted by industry leaders</p>
          <div className="partner-logos">
            {partners.map((p, i) => <img key={i} src={p} alt="partner" />)}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-title">
            <h2>Why Choose <span className="gradient">EduFlow?</span></h2>
            <p>Everything you need to succeed in your tech career</p>
          </div>
          <div className="features-grid">
            <div className="feat-card"><div className="feat-icon">🎓</div><h3>Expert-Led Learning</h3><p>Learn from industry professionals from top tech companies</p></div>
            <div className="feat-card"><div className="feat-icon">💡</div><h3>Hands-on Projects</h3><p>Build real-world projects that showcase your skills</p></div>
            <div className="feat-card"><div className="feat-icon">🏆</div><h3>Industry Certification</h3><p>Earn recognized certificates valued by employers</p></div>
            <div className="feat-card"><div className="feat-icon">🤝</div><h3>Placement Assistance</h3><p>Resume building, interview prep & hiring connections</p></div>
          </div>
        </div>
      </section>

      {/* COURSES SECTION WITH FILTERS */}
      <section id="courses" className="courses">
        <div className="container">
          <div className="section-title">
            <h2>Most <span className="gradient">Popular Courses</span></h2>
            <p>Start your learning journey with our most sought-after programs</p>
          </div>
          
          {/* Category Filter Bar */}
          <div className="category-filter-bar">
            <button className={`filter-chip ${selectedCategory === "All" ? "active" : ""}`} onClick={resetFilters}>
              All Courses
            </button>
            {categories.map((cat, idx) => (
              <button key={idx} className={`filter-chip ${selectedCategory === cat.name ? "active" : ""}`} onClick={() => handleCategoryClick(cat.name)}>
                <img src={cat.icon} alt={cat.name} style={{width: 18, height: 18, marginRight: 6}} />
                {cat.name}
              </button>
            ))}
          </div>
          
          {/* Subcategory Filter (shows when category selected) */}
          {selectedCategory !== "All" && (
            <div className="subcategory-filter-bar">
              <button className={`subfilter-chip ${selectedSubcategory === "All" ? "active" : ""}`} onClick={() => setSelectedSubcategory("All")}>
                All {selectedCategory}
              </button>
              {categories.find(c => c.name === selectedCategory)?.subcategories.map((sub, idx) => (
                <button key={idx} className={`subfilter-chip ${selectedSubcategory === sub ? "active" : ""}`} onClick={() => setSelectedSubcategory(sub)}>
                  {sub}
                </button>
              ))}
            </div>
          )}
          
          <div className="courses-grid">
            {filteredCourses.map(course => {
              const finalPrice = getDiscountedPrice(course.price, course.discount);
              const inWish = isInWishlist(course.id);
              return (
                <div key={course.id} className="course-card" onClick={() => navigateToCourse(course.id)}>
                  <div className="course-img">
                    <img src={course.image} alt={course.title} />
                    <span className="discount-badge">-{course.discount}%</span>
                  </div>
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <div className="meta">
                      <span><img src={icons.clock} style={{width: 14}} alt="" /> {course.duration}</span>
                      <span><img src={icons.level} style={{width: 14}} alt="" /> {course.level}</span>
                    </div>
                    <div className="rating">★ {course.rating} ({course.students} students)</div>
                    <div className="price">
                      ₹{finalPrice.toLocaleString()} <del>₹{course.price.toLocaleString()}</del>
                    </div>
                    <div className="card-actions">
                      <button className="btn-enroll" onClick={(e) => handleAddToCart(course, e)}>Add to Cart 🛒</button>
                      <button className={`btn-wishlist ${inWish ? "active" : ""}`} onClick={(e) => inWish ? handleRemoveFromWishlist(course.id, e) : handleAddToWishlist(course, e)}>
                        {inWish ? "❤️" : "🤍"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredCourses.length === 0 && (
            <div className="no-results">
              <p>No courses found in this category. Try another filter!</p>
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <div className="section-title">
            <h2>Success <span className="gradient">Stories</span></h2>
            <p>Hear from our students who transformed their careers</p>
          </div>
          <div className="testimonial-slider">
            {testimonials.map((t, idx) => (
              <div key={idx} className={`testimonial-card ${idx === activeTestimonial ? "active" : ""}`}>
                <div className="quote">“</div>
                <p>{t.content}</p>
                <div className="author">
                  <img src={t.image} alt={t.name} />
                  <div>
                    <h4>{t.name}</h4>
                    <p>{t.role}</p>
                    <span>★ {t.rating}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="dots">
              {testimonials.map((_, i) => (
                <button key={i} className={`dot ${i === activeTestimonial ? "active" : ""}`} onClick={() => setActiveTestimonial(i)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of students who have already transformed their careers</p>
          {!isLoggedIn ? 
            <button className="btn-cta" onClick={() => window.location.href = "/signup"}>Get Started for Free →</button> :
            <button className="btn-cta" onClick={() => window.location.href = "/courses"}>Continue Learning →</button>
          }
          <div className="cta-features">
            <span>✓ 7-day free trial</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Certificate included</span>
            <span>✓ Lifetime access</span>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section id="contact" className="newsletter">
        <div className="container">
          <h2>📬 Stay Updated</h2>
          <p>Subscribe for the latest courses and exclusive offers</p>
          <form onSubmit={handleNewsletter}>
            <input type="email" placeholder="Enter your email" value={emailSubscribe} onChange={e => setEmailSubscribe(e.target.value)} required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container footer-grid">
          <div>
            <div className="footer-logo"><img src={icons.logo} alt="" /><span>EduFlow</span></div>
            <p>Empowering the next generation of tech professionals</p>
            <div className="social">
              <img src={icons.facebook} alt="fb" /><img src={icons.twitter} alt="tw" /><img src={icons.instagram} alt="ig" /><img src={icons.linkedin} alt="in" />
            </div>
          </div>
          <div><h4>Quick Links</h4><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection("home"); }}>Home</a><a href="#courses" onClick={(e) => { e.preventDefault(); scrollToSection("courses"); }}>Courses</a><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection("features"); }}>Features</a></div>
          <div><h4>Resources</h4><a href="#">Blog</a><a href="#">Community</a><a href="#">Support</a><a href="#">FAQs</a></div>
          <div><h4>Contact</h4><a href="#">hello@eduflow.com</a><a href="#">+1 (555) 123-4567</a><a href="#">San Francisco, CA</a></div>
        </div>
        <div className="copyright">© 2026 EduFlow — Where ambition meets opportunity.</div>
      </footer>
    </div>
  );
};

export default LandingPage;