import React, { useState, useEffect } from "react";
import "../../styles/cart.css";
import { motion } from "framer-motion";
import { makeApi } from "../../api/callApi"; // Assuming this handles API calls
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { toast, ToastContainer } from "react-toastify"; // Import toast and ToastContainer from react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import Loader from "../loader/loader"; // Import your Loader component

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddAddressPopup, setShowAddAddressPopup] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [userName, setUserName] = useState(""); // State for user's name
  const [isMobileValid, setIsMobileValid] = useState(true); // To track mobile validation
  const [selectedAddress, setSelectedAddress] = useState(null); // Track selected address
  const [orderDetails, setOrderDetails] = useState(null); // State to hold order details for thank-you popup
  const [showThankYouPopup, setShowThankYouPopup] = useState(false); // To control the visibility of the Thank You popup
  const [isLoading, setIsLoading] = useState(false); // State for loader
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // State to disable the button

  const navigate = useNavigate(); // Initialize navigate for redirection
 
  useEffect(() => {
    // Load cart and addresses from local storage
    const cartData = JSON.parse(localStorage.getItem("cart"));
    const savedAddresses = JSON.parse(localStorage.getItem("addresses")) || [];

    // Convert cartData (object) to array
    const cartArray = cartData ? Object.values(cartData) : [];

    setCart(cartArray);
    setAddresses(savedAddresses);
  }, []);

  const handleRemoveFromCart = (id) => {
    const updatedCart = cart.filter((item) => item._id !== id); 
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleIncreaseQuantity = (id) => {
    const updatedCart = cart.map((item) =>
      item._id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleDecreaseQuantity = (id) => {
    const updatedCart = cart.map((item) =>
      item._id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleAddAddress = () => {
    if (!mobileNumber || !userName) {
      toast.error("Please fill in all fields!"); // Show error toast message if name or mobile number is empty
      return;
    }

    if (mobileNumber.length === 10 && address.trim() && userName.trim()) {
      // Address is valid, save it
      const updatedAddresses = [...addresses, { userName, mobileNumber, address }];
      setAddresses(updatedAddresses);
      localStorage.setItem("addresses", JSON.stringify(updatedAddresses));
      setMobileNumber(""); // Clear mobile number input
      setAddress(""); // Clear address input
      setUserName(""); // Clear user name input
      setShowAddAddressPopup(false); // Close the popup
    } else {
      toast.error("Please enter a valid mobile number, address, and name.");
    }
  };

  const handleMobileChange = (e) => {
    const value = e.target.value;
    setMobileNumber(value);
    setIsMobileValid(value.length === 10); // Check if the mobile number is valid
  };

  const handleSelectAddress = (selected) => {
    setSelectedAddress(selected); // Update selected address
  };

  const totalCartValue = cart.reduce(
    (total, item) => total + item.FinalPrice * item.quantity,
    0
  );

  // const isButtonDisabled = !selectedAddress; // Disable the button if no address is selected

  // Function to handle order placement
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select an address!"); // Show toast if no address is selected
      return;
    }

    setIsLoading(true); // Show the loader
    setIsButtonDisabled(true); // Disable the button after clicking

    const orderData = {
      username: selectedAddress.userName, // Use the selected address's username
      address: selectedAddress.address,
      mobileNumber: selectedAddress.mobileNumber,
      products: cart.map((product) => ({
        productId: product._id,  // Use _id
        name: product.name, 
        quantity: product.quantity,
        FinalPrice: product.FinalPrice,
        thumbnail: product.thumbnail,
      })),
      createdAt : new Date().toISOString(),
      totalAmount: totalCartValue,
    };

    try {
      // Call the API to create the order
      const response = await makeApi("/api/create-order", "POST", orderData);
      toast.success("Order placed successfully!"); // Show success toast
      setOrderDetails(orderData); // Set the order details for the thank-you popup
      setShowThankYouPopup(true); // Show the thank-you popup
      // Clear cart from localStorage and state
      localStorage.removeItem("cart");
      setCart([]);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Error placing order. Please try again."); // Show error toast
    } finally {
      setIsLoading(false); // Hide the loader
    }
  };

  const closeThankYouPopup = () => {
    setShowThankYouPopup(false);
    navigate("/"); // Redirect to /all-service after closing the popup
  };

  return (
    <div className="cart-page">
      <h1 className="cart-title">Your Cart</h1>

      <div className="cart-section">
        {cart.length === 0 ? (
          <p className="empty-cart-message">Your cart is empty!</p>
        ) : (
          cart.map((product) => (
            <motion.div
              key={product._id}
              className="product-card"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={product.thumbnail}
                alt={product.name}
                className="product-image"
              />
              <div className="product-info">
                <h2 className="product-name">{product.name}</h2>
                <p className="product-price">
                  <span className="original-price">₹{product.price}</span>
                  <span className="final-price">₹{product.FinalPrice}</span>
                </p>
              </div>
              <div className="cart-item-actions">
                <button
                  className="quantity-btn"
                  onClick={() => handleDecreaseQuantity(product._id)}
                >
                  -
                </button>
                <span className="quantity">{product.quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => handleIncreaseQuantity(product._id)}
                >
                  +
                </button>
              </div>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="cart-item-subtotal"
              >
                Subtotal: ₹{product.FinalPrice * product.quantity}
              </motion.p>
            </motion.div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <>
          <div className="address-section">
            <h2 className="section-title">Select Address</h2>
            {addresses.length > 0 ? (
              <div className="address-list">
                {addresses.map((address, index) => (
                  <div className="address-item" key={index}>
                    <input
                      type="radio"
                      name="address"
                      id={`address-${index}`}
                      onChange={() => handleSelectAddress(address)} // Update selected address
                    />
                    <label htmlFor={`address-${index}`}>
                      {address.userName} - {address.mobileNumber}, {address.address}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-address-message">
                No addresses saved. Add a new one below!
              </p>
            )}
            <button
              className="add-address-btn"
              onClick={() => setShowAddAddressPopup(true)}
            >
              Add New Address
            </button>
          </div>

          <div className="delivery-section">
            <h2 className="section-title">Delivery</h2>
            <p className="delivery-charge">Delivery Charges: Free</p>
            <p className="total-cart-value">Total Amount: ₹{totalCartValue}</p>
          </div>

          <button
            className="checkout-btn"
            onClick={handlePlaceOrder}
            disabled={isButtonDisabled} // Disable button if address is not selected
          >
            {isLoading ? <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} > <Loader /></div> : "Continue with COD"} 
          </button>
        </>
      )}

      {/* Add Address Popup */}
      {showAddAddressPopup && (
            <motion.div
              className="add-address-popup"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <input
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="input-field-for-address"
              />
              <input
                type="text"
                placeholder="Enter your mobile number"
                value={mobileNumber}
                onChange={handleMobileChange}
                maxLength="10"
                className="input-field-for-address"
                required
              />
              {!isMobileValid && mobileNumber && (
                <span className="error-text">
                  Please enter a valid 10-digit mobile number.
                </span>
              )}

              <textarea
                placeholder="Enter your new address"
                value={address}
                className="input-field-for-address"
                onChange={(e) => setAddress(e.target.value)}
              />

              <button
                className="save-address-btn"
                onClick={handleAddAddress}
                disabled={!(isMobileValid && address.trim() && userName.trim())} // Disable if validation fails
              >
                Save Address
              </button>

              <button
                className="close-popup-btn"
                onClick={() => setShowAddAddressPopup(false)}
              >
                Close
              </button>
            </motion.div>
          )}

      {/* Thank You Popup */}
      {showThankYouPopup && (
        <motion.div
          className="thank-you-popup"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
        >
          <h2>Thank You for Your Order!</h2>
          <p>Your order has been placed successfully. Here's what you've ordered:</p>
          <ul className="order-details">
            {orderDetails.products.map((product) => (
              <li key={product.productId} className="order-item">
                <img src={product.thumbnail} alt={product.name} className="order-item-image" />
                <div className="order-item-info">
                  <span className="order-item-quantity">Quantity: {product.quantity}</span>
                  <span className="order-item-name">{product.name}</span>
                  <span className="order-item-price">₹{product.FinalPrice * product.quantity}</span>
                </div>
              </li>
            ))}
          </ul>
          <p>Total Amount: ₹{orderDetails.totalAmount}</p>

          <button className="close-thank-you-popup-btn" onClick={closeThankYouPopup}>
            Close
          </button>
        </motion.div>
      )}

      <ToastContainer style={{ width: '300px' }} position="top-center" autoClose={3000} />
    </div>
  );
};

export default CartPage;
