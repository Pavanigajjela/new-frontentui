import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const Cart = () => {
  const { cart, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="cart-page">
      <h2>Your Cart 🛒</h2>

      <div className="cart-container">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt="" />

              <div>
                <h3>{item.title}</h3>
                <p>₹{item.price}</p>
                <button onClick={() => removeFromCart(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div className="cart-summary">
          <h3>Total: ₹{total}</h3>
          <button onClick={() => navigate("/payment")}>
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;