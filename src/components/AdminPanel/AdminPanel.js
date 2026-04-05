import React, { useState } from "react";
import { Container, Nav, Row, Col, Card } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";

// Case-sensitive imports - Vercel build pass avvadaniki files names match chesa
import AddProductForm from "./AddProductForm";
import UpdateQuantity from "./UpdateQuantity"; // File name UpdateQuantity.js ayi undali
import OrderHistory from "./OrderHistory";
import ChartComponent from "./ChartComponent";
import SummaryComponent from "./SummaryComponent";
import BestSellersComponent from "./BestSellersComponent";
import ChefDashboard from "./ChefDashboard";

const AdminPanel = () => {
  // Default ga Chef View (Live Orders)
  const [activeTab, setActiveTab] = useState("chef");

  // Tab change handle cheyadaniki function
  const renderContent = () => {
    switch (activeTab) {
      case "chef":
        return <ChefDashboard />;
      case "inventory":
        return <UpdateQuantity />;
      case "add-product":
        return <AddProductForm />;
      case "orders":
        return <OrderHistory />;
      case "stats":
        return (
          <Row>
            <Col md={12} className="mb-4"><SummaryComponent /></Col>
            <Col md={8}><ChartComponent /></Col>
            <Col md={4}><BestSellersComponent /></Col>
          </Row>
        );
      default:
        return <ChefDashboard />;
    }
  };

  return (
    <Container fluid className="mt-4 pb-5">
      <Row>
        {/* Navigation Sidebar */}
        <Col md={3} lg={2} className="mb-4">
          <Card className="shadow-sm border-0 p-2">
            <Nav variant="pills" className="flex-column" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Nav.Item>
                <Nav.Link eventKey="chef" className="mb-2">👨‍🍳 Kitchen Control</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="inventory" className="mb-2">📦 Stock Update</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="add-product" className="mb-2">➕ Add New Item</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="orders" className="mb-2">📜 Order History</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="stats" className="mb-2">📊 Analytics</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card>
        </Col>

        {/* Main Content Area */}
        <Col md={9} lg={10}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="mb-4 fw-bold text-capitalize">
              {activeTab.replace("-", " ")}
            </h2>
            
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPanel;