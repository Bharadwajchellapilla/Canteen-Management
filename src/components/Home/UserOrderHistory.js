import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Row, Col, Badge, ProgressBar, Container } from 'react-bootstrap';
import { database } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '../../AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const UserOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();

  // Status batti progress percentage and colors
  const getStatusDetails = (status) => {
    switch (status) {
      case 'Pending': return { now: 25, variant: 'warning', label: 'Order Placed' };
      case 'Preparing': return { now: 60, variant: 'primary', label: 'Chef is Cooking' };
      case 'Ready': return { now: 100, variant: 'success', label: 'Ready to Collect!' };
      default: return { now: 100, variant: 'secondary', label: 'Completed' };
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    // Direct ga 'active_orders' and 'sales' nundi data pull chesthunnam
    const ordersRef = ref(database, 'active_orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userOrders = Object.values(data)
          .filter(order => order.userId === currentUser.uid)
          .sort((a, b) => b.timestamp - a.timestamp); // Latest first
        setOrders(userOrders);
      } else {
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const filteredOrders = orders.filter(order => 
    order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    order.orderId.includes(searchTerm)
  );

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold m-0">My Live Orders 🛍️</h3>
        <Form.Control
          type="text"
          placeholder="Search by Item or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-pill shadow-sm"
          style={{ maxWidth: '250px' }}
        />
      </div>

      <Row>
        <AnimatePresence>
          {filteredOrders.length === 0 ? (
            <Col className="text-center py-5">
              <p className="text-muted">No active orders found. Time to eat something? 🍕</p>
            </Col>
          ) : (
            filteredOrders.map((order) => {
              const statusInfo = getStatusDetails(order.status);
              return (
                <Col md={6} lg={4} key={order.orderId} className="mb-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                      <div className={`bg-${statusInfo.variant} p-2 text-center text-white small fw-bold`}>
                        {statusInfo.label.toUpperCase()}
                      </div>
                      
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <small className="text-muted d-block">Order ID</small>
                            <span className="fw-bold text-primary">#{order.orderId.slice(-6)}</span>
                          </div>
                          <div className="text-end">
                            <small className="text-muted d-block">Table</small>
                            <Badge bg="dark" className="rounded-pill">{order.table}</Badge>
                          </div>
                        </div>

                        {/* Order Progress */}
                        <div className="mb-3">
                          <ProgressBar 
                            animated={order.status !== 'Ready'} 
                            variant={statusInfo.variant} 
                            now={statusInfo.now} 
                            style={{ height: '8px' }}
                            className="rounded-pill"
                          />
                        </div>

                        <div className="bg-light p-3 rounded-3 mb-3">
                          <h6 className="fw-bold small mb-2 text-uppercase text-muted">Items</h6>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="d-flex justify-content-between small mb-1">
                              <span>{item.quantity}x {item.name} {item.spec && `(${item.spec})`}</span>
                              <span className="fw-bold">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </small>
                          <h5 className="fw-bold mb-0 text-success">Total: ₹{order.total}</h5>
                        </div>
                      </Card.Body>

                      {order.status === 'Ready' && (
                        <Card.Footer className="bg-success-subtle border-0 text-center py-2">
                          <span className="text-success fw-bold small">Please collect your order at the counter!</span>
                        </Card.Footer>
                      )}
                    </Card>
                  </motion.div>
                </Col>
              );
            })
          )}
        </AnimatePresence>
      </Row>
    </Container>
  );
};

export default UserOrderHistory;