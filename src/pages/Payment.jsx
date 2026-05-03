import React from "react";
import "./Payment.css";

const Payment = () => {
  return (
    <div className="payment-page">
      <h2>Secure Payment 💳</h2>

      <div className="payment-form">
        <input type="text" placeholder="Cardholder Name" />
        <input type="text" placeholder="Card Number" />
        <input type="text" placeholder="MM/YY" />
        <input type="text" placeholder="CVV" />

        <button>Pay Now</button>
      </div>
    </div>
  );
};

export default Payment;