import React, { useEffect, useState } from "react";
import { useParams,Link } from "react-router-dom";
import "../../styles/category.css";
import "../../styles/cartpop.css";
import { motion, AnimatePresence } from "framer-motion";
import { makeApi } from "../../api/callApi";
import Loader from "../../components/loader/loader";

function CategoryPage() {
  const { subcategory } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (isInitialLoad) {
      window.scrollTo(0, 0);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const response = await makeApi(`/api/get-all-products-for-user/${subcategory}`, "GET");
        // const servicesearch = await makeApi(`/api/services/search/${subcategory}`, "GET");
        const sortedProducts = response.data.products.sort((a, b) => a.FinalPrice - b.FinalPrice);
        setProducts(sortedProducts);
      } catch (error) {
        console.log("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, [subcategory]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || {};
    setCart(storedCart);
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isInitialLoad]);

  const getTotalCartValue = () => {
    return Object.values(cart).reduce(
      (total, item) => total + item.FinalPrice * item.quantity,
      0
    );
  };

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      const existingProduct = prevCart[product._id];

      if (!existingProduct) {
        updatedCart[product._id] = {
          ...product,
          quantity: product.minorderquantity || 1,
        };
      }

      return updatedCart;
    });
  };

  const handleIncreaseQuantity = (product) => {
    setCart((prevCart) => {
      const updatedCart = {
        ...prevCart,
        [product._id]: {
          ...product,
          quantity: (prevCart[product._id]?.quantity || 0) + 1,
        },
      };
      return updatedCart;
    });
  };

  const handleDecreaseQuantity = (product) => {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      const existingProduct = prevCart[product._id];

      if (existingProduct.quantity > (product.minorderquantity || 1)) {
        updatedCart[product._id].quantity -= 1;
      } else {
        delete updatedCart[product._id];
      }

      return updatedCart;
    });
  };

  const clearFromCart = (productId) => {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      delete updatedCart[productId];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const isProductClosed = (product) => {
    if (!product.availableTimes || product.availableTimes.length === 0 || !product.availableTimes[0]) {
      return false;
    }

    const [start, end] = product.availableTimes[0].split("-").map(Number);
    const currentHour = new Date().getHours();

    return currentHour < start || currentHour > end;
  };

  return (
    <>
      {loading ? (
        <div
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Loader />
        </div>
      ) : (
        <>
          <div className="category-page">
            <h1 className="category-title">
              {subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
            </h1>

            <div className="product-list">
              {products.map((product) => {
                const closed = isProductClosed(product);
                return (
                  <motion.div
                    className={`product-card ${closed ? "closed" : ""}`}
                    key={product._id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
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
                      {product.minorderquantity && (
                        <p style={{ color: "red" }}>
                          Min Order Quantity: {product.minorderquantity}
                        </p>
                      )}
                      {closed && (
                        <div
                          style={{
                            textAlign: "center",
                            width: "100%",
                            fontSize: "20px",
                            fontWeight: "bold",
                            color: "red",
                          }}
                        >
                          Closed
                        </div>
                      )}
                      {!closed && (
                        <div className="product-actions">
                          {cart[product._id] ? (
                            <>
                              <div className="quantity-control">
                                <motion.button
                                  className="quantity-btn decrease-btn"
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDecreaseQuantity(product)}
                                >
                                  -
                                </motion.button>
                                <motion.span
                                  className="quantity"
                                  key={cart[product._id].quantity}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  {cart[product._id].quantity}
                                </motion.span>
                                <motion.button
                                  className="quantity-btn increase-btn"
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleIncreaseQuantity(product)}
                                >
                                  +
                                </motion.button>
                              </div>
                              <motion.button
                                className="remove-btn"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => clearFromCart(product._id)}
                              >
                                Remove
                              </motion.button>
                            </>
                          ) : (
                            <motion.button
                              className="add-to-cart-btn"
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAddToCart(product)}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              Add to Cart
                            </motion.button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
             {/* Mini Cart Popup */}
          <AnimatePresence>
            {Object.keys(cart).length > 0 && (
              <motion.div
                className="mini-cart"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ duration: 0.4 }}
              >
                <div className="cart-title-popup">Cart</div>
                <ul className="cart-items">
                  {Object.values(cart).map((item) => (
                    <motion.li
                      key={item._id} // Use _id for unique key
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      {item.name} x {item.quantity} = ₹{item.FinalPrice * item.quantity}
                      <motion.button
                        className="remove-btn-mini"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => clearFromCart(item._id)} // Remove from cart using _id
                      >
                        Remove
                      </motion.button>
                    </motion.li>
                  ))}
                </ul>
                <div className="cart-footer">
                  <motion.p
                    key={getTotalCartValue()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    Total: ₹{getTotalCartValue()}
                  </motion.p>
                  <Link to={"/cart"} style={{ textDecoration: "none" }}>
                    <button className="buy-now-btn">Buy Now</button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
          <div style={{ height: "60vh" }}></div>
        </>
      )}
    </>
  );
}

export default CategoryPage;
