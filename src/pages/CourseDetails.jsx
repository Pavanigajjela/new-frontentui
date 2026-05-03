import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import courses from "../data/courses";
import StarRating from "../components/StarRating";
import { CartContext } from "../context/CartContext";
import "./CourseDetails.css";

const CourseDetails = () => {
  const { id } = useParams();
  const [openIndex, setOpenIndex] = useState(null);

  const { addToCart } = useContext(CartContext); // ✅ FIX

  const course = courses.find((c) => c.id === parseInt(id));

  if (!course) return <h2>Course not found</h2>;

  return (
    <div className="course-details">
      
      {/* VIDEO */}
      <div className="video-section">
        <video controls>
          <source src={course.video} type="video/mp4" />
        </video>
      </div>

      <div className="course-container">
        <div className="course-info">
          <h1>{course.title}</h1>
          <p className="instructor">{course.instructor}</p>

          <StarRating rating={course.rating} />

          <div className="price">₹{course.price}</div>

          <p className="description">{course.description}</p>

          {/* ✅ ADD TO CART */}
          <button
            className="cart-btn"
            onClick={() => addToCart(course)}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* CURRICULUM */}
      <div className="curriculum">
        <h2>Course Content</h2>

        {course.curriculum.map((item, index) => (
          <div key={index} className="accordion">
            <div
              className="accordion-title"
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            >
              {item.title}
            </div>

            {openIndex === index && (
              <div className="accordion-content">
                {item.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetails;