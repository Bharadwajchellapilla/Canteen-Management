import React, { useState, useEffect } from "react";
import { database } from "../../firebase";
import { ref, onValue, update } from "firebase/database";
import { Table, Form, Card } from "react-bootstrap";

const AdminInventory = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const productRef = ref(database, "products");
    const unsubscribe = onValue(productRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProducts(Object.entries(data).map(([id, val]) => ({ id, ...val })));
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleStock = (id, currentStatus) => {
    update(ref(database, `products/${id}`), {
      isAvailable: !currentStatus
    });
  };

  return (
    <Card className="border-0 shadow-sm mt-3">
      <Card.Body>
        <h5 className="fw-bold mb-3">Stock Management 📦</h5>
        <Table responsive hover>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Price</th>
              <th>Availability</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>₹{item.price}</td>
                <td>
                  <Form.Check 
                    type="switch"
                    id={`stock-${item.id}`}
                    label={item.isAvailable ? "In Stock" : "Out of Stock"}
                    checked={item.isAvailable}
                    onChange={() => toggleStock(item.id, item.isAvailable)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default AdminInventory;