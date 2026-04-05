import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import ProductList from "../ProductList/ProductList";
import CartModal from "../CartModal/CartModal";
import ProductDetailModal from "../ProductDetail/ProductDetailModal";
import Footer from "../Footer/Footer";
import AdminPanel from "../AdminPanel/AdminPanel";
import UserOrderHistory from "./UserOrderHistory";
import useProducts from "../../hooks/useProducts";
import { ref, update } from "firebase/database"; 
// Firebase Storage imports add chesa
import { ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, database, storage } from "../../firebase"; // storage import marchipoku
import { signOut } from "firebase/auth";
import { Toast, Form, Container } from "react-bootstrap";
import { useAuth } from "../../AuthContext";
import jsPDF from "jspdf";
import useAdmin from "../../hooks/useAdmin";
import { motion } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { products } = useProducts();
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  });
  const [showCartModal, setShowCartModal] = useState(false);
  const [originalQuantities, setOriginalQuantities] = useState({});
  const [showCheckoutToast, setShowCheckoutToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const isAdmin = useAdmin();

  const tableNumber = new URLSearchParams(window.location.search).get("table") || "Takeaway";

  useEffect(() => {
    if (products && products.length > 0) {
      const updatedQuantities = products.reduce((acc, product) => {
        acc[product.id] = product.quantity;
        return acc;
      }, {});
      setOriginalQuantities(updatedQuantities);
    }
  }, [products]);

  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const calculateTotal = () => cart.reduce((total, p) => total + p.price * p.quantity, 0);

  // --- Main Checkout Logic with Screenshot ---
  const checkout = async (screenshotFile) => {
    if (cart.length === 0 || !screenshotFile) return;

    try {
      const orderId = Date.now().toString();
      const orderDate = new Date().toISOString().split("T")[0];

      // 1. Upload Screenshot to Firebase Storage
      const storageRef = sRef(storage, `payment_screenshots/${orderId}_${screenshotFile.name}`);
      const uploadResult = await uploadBytes(storageRef, screenshotFile);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // 2. Update Stock Logic
      cart.forEach((product) => {
        const originalQty = originalQuantities[product.id];
        const updatedQty = originalQty - product.quantity;
        update(ref(database, `products/${product.id}`), { quantity: updatedQty });
      });

      // 3. Prepare Order Data
      const orderData = {
        orderId: orderId,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          spec: item.spec || ""
        })),
        total: calculateTotal(),
        table: tableNumber,
        status: "Pending",
        paymentScreenshot: downloadURL, // Link to the uploaded image
        userId: currentUser?.uid,
        userEmail: currentUser?.email,
        timestamp: Date.now()
      };

      // 4. Save to Realtime Database
      await update(ref(database, `active_orders/${orderId}`), orderData);
      await update(ref(database, `sales/${orderDate}/${orderId}`), orderData);

      generatePDF(orderId);
      setCart([]);
      localStorage.removeItem("cart");
      setShowCartModal(false);
      setShowCheckoutToast(true);
      setTimeout(() => setShowCheckoutToast(false), 3000);

    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Order failed! Please check your internet or payment screenshot.");
    }
  };

  const generatePDF = (orderId) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    doc.setFontSize(20);
    doc.text("CANTEEN RECEIPT", pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Table: ${tableNumber} | Order ID: ${orderId.slice(-6)}`, 10, 30);
    
    let y = 50;
    cart.forEach((p) => {
      doc.text(`${p.name} x ${p.quantity}`, 10, y);
      doc.text(`₹${(p.price * p.quantity).toFixed(2)}`, 180, y, { align: "right" });
      y += 10;
    });
    doc.line(10, y, 200, y);
    doc.text(`Total: ₹${calculateTotal().toFixed(2)}`, 180, y + 10, { align: "right" });
    doc.save(`Receipt-${orderId.slice(-6)}.pdf`);
  };

  // Add to cart with specification
  const addToCart = (product, spec = "") => {
    setCart((prevCart) => {
      const productInCart = prevCart.find((p) => p.id === product.id && p.spec === spec);
      if (productInCart) {
        return prevCart.map((p) =>
          p.id === product.id && p.spec === spec ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prevCart, { ...product, quantity: 1, spec: spec }];
    });
    setShowCartModal(true);
  };

  const incrementQuantity = (productId) => {
    setCart((prev) => prev.map((p) => p.id === productId ? { ...p, quantity: p.quantity + 1 } : p));
  };

  const decrementQuantity = (productId) => {
    setCart((prev) => prev.map((p) => p.id === productId && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p));
  };

  const removeFromCart = (product) => {
    setCart((prev) => prev.filter((p) => !(p.id === product.id && p.spec === product.spec)));
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const filteredProducts = products ? products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="p-3 border-bottom mb-4 bg-white sticky-top shadow-sm">
        <div className="container d-flex justify-content-between align-items-center">
          <h4 className="fw-bold m-0 text-primary">Sikkolu Specials</h4>
          <nav className="d-flex gap-2">
            <button className="btn btn-sm fw-bold" onClick={() => {setShowAdmin(false); setShowOrderHistory(false)}}>Home</button>
            <button className="btn btn-sm fw-bold" onClick={() => setShowOrderHistory(true)}>My Orders</button>
            {isAdmin && <button className="btn btn-sm btn-dark" onClick={() => setShowAdmin(true)}>Admin</button>}
            <button className="btn btn-sm btn-outline-danger" onClick={handleLogout}>Logout</button>
          </nav>
        </div>
      </header>

      <Container className="mb-5">
        {showAdmin ? <AdminPanel /> : showOrderHistory ? <UserOrderHistory /> : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold">Menu Card</h2>
              <Form.Control className="w-25 rounded-3" placeholder="Search dish..." onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            {cart.length > 0 && (
              <button className="btn btn-primary mb-4 w-100 py-3 rounded-4 shadow sticky-top" style={{ top: "80px", zIndex: 100 }} onClick={() => setShowCartModal(true)}>
                🛒 View Cart ({cart.length}) - Total: ₹{calculateTotal().toFixed(2)}
              </button>
            )}

            <ProductList
              products={filteredProducts.map((p) => ({
                ...p,
                quantity: (originalQuantities[p.id] || 0) - (cart.filter(cp => cp.id === p.id).reduce((sum, item) => sum + item.quantity, 0)),
              }))}
              addToCart={addToCart} 
              onProductClick={(p) => { setSelectedProduct(p); setShowProductDetailModal(true); }}
            />

            <CartModal
              show={showCartModal}
              handleClose={() => setShowCartModal(false)}
              cart={cart}
              incrementQuantity={incrementQuantity}
              decrementQuantity={decrementQuantity}
              removeFromCart={removeFromCart}
              calculateTotal={calculateTotal}
              checkout={checkout} // Pass updated checkout
            />

            <ProductDetailModal
              show={showProductDetailModal}
              handleClose={() => setShowProductDetailModal(false)}
              product={selectedProduct}
              addToCart={addToCart}
            />
          </>
        )}
      </Container>

      <Toast show={showCheckoutToast} onClose={() => setShowCheckoutToast(false)} className="position-fixed bottom-0 end-0 m-3 bg-success text-white">
        <Toast.Body>Order placed successfully! Token generated.</Toast.Body>
      </Toast>
      
      <Footer />
    </motion.div>
  );
};

export default Home;