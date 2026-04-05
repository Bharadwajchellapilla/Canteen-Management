import React, { useState, useEffect } from "react";
import { database } from "../../firebase";
import { ref, onValue, update, remove } from "firebase/database";
import { Container, Row, Col, Card, Button, Badge, Modal } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";

const ChefDashboard = () => {
  const [activeOrders, setActiveOrders] = useState([]);
  const [showImage, setShowImage] = useState(null); // For zooming payment proof

  useEffect(() => {
    const ordersRef = ref(database, "active_orders");
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sortedOrders = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
        setActiveOrders(sortedOrders);
      } else {
        setActiveOrders([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      if (newStatus === "Completed") {
        await remove(ref(database, `active_orders/${orderId}`));
      } else {
        await update(ref(database, `active_orders/${orderId}`), { status: newStatus });
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold m-0">👨‍🍳 Kitchen Control</h3>
        <Badge bg="danger" pill className="px-3 py-2">
          {activeOrders.length} Pending Tasks
        </Badge>
      </div>

      <Row>
        <AnimatePresence>
          {activeOrders.map((order) => (
            <Col md={6} lg={4} key={order.orderId} className="mb-4">
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                  {/* Status Indicator Bar */}
                  <div style={{ height: '5px' }} className={`bg-${order.status === 'Pending' ? 'warning' : 'primary'}`} />
                  
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                      <h5 className="fw-bold mb-0">Table: {order.table}</h5>
                      <small className="text-muted">#{order.orderId.slice(-4)}</small>
                    </div>

                    <hr />
                    
                    <div className="mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="d-flex justify-content-between align-items-center mb-1">
                          <span><strong>{item.quantity}x</strong> {item.name}</span>
                          {item.spec && <Badge bg="light" text="danger" className="border">{item.spec}</Badge>}
                        </div>
                      ))}
                    </div>

                    {/* Quick Payment Preview */}
                    {order.paymentScreenshot && (
                      <div 
                        className="bg-light rounded-3 p-2 text-center mb-3 border" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setShowImage(order.paymentScreenshot)}
                      >
                        <small className="text-primary fw-bold">👁️ Click to Verify Payment</small>
                      </div>
                    )}

                    <div className="d-grid gap-2">
                      {order.status === "Pending" && (
                        <Button variant="primary" className="fw-bold py-2" onClick={() => updateStatus(order.orderId, "Preparing")}>
                          Accept & Start Cooking
                        </Button>
                      )}
                      {order.status === "Preparing" && (
                        <Button variant="success" className="fw-bold py-2" onClick={() => updateStatus(order.orderId, "Ready")}>
                          Food is Ready ✅
                        </Button>
                      )}
                      {order.status === "Ready" && (
                        <Button variant="dark" className="fw-bold py-2" onClick={() => updateStatus(order.orderId, "Completed")}>
                          Hand Over / Finish
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                  <Card.Footer className="bg-white border-0 text-center pb-3">
                     <small className="text-muted">Ordered at {new Date(order.timestamp).toLocaleTimeString()}</small>
                  </Card.Footer>
                </Card>
              </motion.div>
            </Col>
          ))}
        </AnimatePresence>
      </Row>

      {/* Modal for Image Zoom */}
      <Modal show={!!showImage} onHide={() => setShowImage(null)} centered>
        <Modal.Header closeButton>Payment Proof</Modal.Header>
        <Modal.Body className="text-center">
          <img src={showImage} alt="Payment" className="img-fluid rounded shadow" />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ChefDashboard;