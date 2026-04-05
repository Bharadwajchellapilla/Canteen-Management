import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion, AnimatePresence } from "framer-motion";
import "./CartModal.css";
import { FaMinus, FaPlus, FaTrash, FaCamera } from "react-icons/fa";

const CartModal = ({
  show,
  handleClose,
  cart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
  calculateTotal,
  checkout,
}) => {
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Handle Image Selection
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleCheckoutClick = async () => {
    if (!screenshot) {
      alert("Please upload payment screenshot first!");
      return;
    }
    setUploading(true);
    // Ikkada nuvvu screenshot ni checkout function ki pampali
    await checkout(screenshot); 
    setUploading(false);
    setScreenshot(null);
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="rounded-4">
      <Modal.Header closeButton className="border-bottom-0">
        <Modal.Title className="fw-bold p-3">Your Cart</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {cart.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted">Your cart is empty. Add some yummy food! 😋</p>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {cart.map((product) => (
                <motion.div
                  key={`${product.id}-${product.spec}`} // spec add chesa unique key kosam
                  className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <div className="d-flex align-items-center">
                    <img
                      className="img-fluid rounded-4 me-3"
                      src={product.image}
                      alt={product.name}
                      style={{ width: "60px", height: "60px", objectFit: "cover" }}
                    />
                    <div>
                      <h6 className="mb-0 fw-bold">{product.name}</h6>
                      <small className="text-muted d-block">₹{product.price}</small>
                      {product.spec && <small className="text-danger">Note: {product.spec}</small>}
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="btn-group border rounded-4 bg-white overflow-hidden">
                      <button className="btn btn-sm px-2 border-0" onClick={() => decrementQuantity(product.id)}><FaMinus size={12}/></button>
                      <span className="px-2 align-self-center fw-bold">{product.quantity}</span>
                      <button className="btn btn-sm px-2 border-0" onClick={() => incrementQuantity(product.id)}><FaPlus size={12}/></button>
                    </div>
                    <button className="btn btn-sm text-danger ms-2" onClick={() => removeFromCart(product)}><FaTrash /></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* --- Payment Section --- */}
            <div className="mt-4 p-3 border rounded-4 bg-dark text-white text-center">
              <h6 className="mb-2">Scan & Pay</h6>
              {/* Ikka nee UPI QR Image path pettu */}
              <div className="bg-white p-2 d-inline-block rounded-3 mb-2">
                <img src="/images/upi-qr.png" alt="UPI QR" style={{width: "120px"}} />
              </div>
              <p className="small mb-0">Total: ₹{calculateTotal()}</p>
            </div>

            <div className="mt-3">
              <Form.Group controlId="formFileSm" className="mb-3">
                <Form.Label className="small fw-bold text-primary">
                  <FaCamera className="me-1"/> Upload Payment Screenshot
                </Form.Label>
                <Form.Control type="file" size="sm" accept="image/*" onChange={handleFileChange} className="rounded-3" />
              </Form.Group>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="border-top-0 flex-column">
        <div className="d-flex w-100 justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Total: ₹{calculateTotal()}</h4>
          <Button variant="link" className="text-danger text-decoration-none p-0" onClick={clearCart}>Clear Cart</Button>
        </div>
        <Button 
          variant="success" 
          className="rounded-4 w-100 py-2 fw-bold" 
          onClick={handleCheckoutClick}
          disabled={cart.length === 0 || !screenshot || uploading}
        >
          {uploading ? "Processing Order..." : "Confirm Order & Checkout"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CartModal;