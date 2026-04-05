import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import "./ProductList.css";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const ProductList = ({ products, addToCart, onProductClick }) => {
  // Prathi product ki separate note handle cheyadaniki state
  const [notes, setNotes] = useState({});

  const handleNoteChange = (productId, value) => {
    setNotes(prev => ({ ...prev, [productId]: value }));
  };

  return (
    <motion.div 
      className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 hover"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {products.map((product) => (
        <motion.div 
          key={product.id} 
          className="col"
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="card h-100 rounded-4 shadow-sm border-0 overflow-hidden">
            <div className="position-relative">
              <img
                src={product.image}
                className="card-img-top product-image"
                alt={product.name}
                style={{ height: "180px", objectFit: "cover" }}
                onClick={() => onProductClick(product)}
              />
              {product.quantity === 0 && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
                  <span className="badge bg-danger fs-6">Out of Stock</span>
                </div>
              )}
            </div>

            <div className="card-body d-flex flex-column p-3">
              <h5 className="card-title fw-bold mb-1">{product.name}</h5>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-primary fw-bold fs-5">₹{product.price}</span>
                <small className="text-muted">Stock: {product.quantity}</small>
              </div>

              {/* Special Instructions Input */}
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-control-sm rounded-3 border-light-subtle"
                  placeholder="Special instructions (e.g. Less sugar)"
                  value={notes[product.id] || ""}
                  onChange={(e) => handleNoteChange(product.id, e.target.value)}
                  disabled={product.quantity === 0}
                />
              </div>

              <div className="mt-auto">
                <div className="d-flex flex-row align-items-center gap-2">
                  <button
                    className="btn btn-light rounded-3 w-100 fw-semibold"
                    onClick={() => onProductClick(product)}
                  >
                    Details
                  </button>
                  <button
                    className="btn btn-primary rounded-3 w-100 fw-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Product tho paatu note ni kuda pampali
                      addToCart(product, notes[product.id] || "");
                      // Cart loki vellaka input ni clear cheyadaniki
                      handleNoteChange(product.id, ""); 
                    }}
                    disabled={product.quantity === 0}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductList;