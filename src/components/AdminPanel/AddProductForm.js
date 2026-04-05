import React, { useState } from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";
import { ref as dbRef, push } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"; // Storage refs
import { database, storage } from "../../firebase"; // Don't forget to import storage

const AddProductForm = () => {
  const [productName, setProductName] = useState("");
  const [initialPrices, setInitialPrices] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [imageFile, setImageFile] = useState(null); // URL badulu File object
  const [loading, setLoading] = useState(false); // Uploading indicator

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Please select an image!");
      return;
    }

    setLoading(true);
    try {
      // 1. Image ni Firebase Storage ki upload cheyadam
      const fileRef = storageRef(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(fileRef, imageFile);
      
      // 2. Upload aina image URL ni pondhadam
      const imageUrl = await getDownloadURL(fileRef);

      // 3. Database lo product data save cheyadam
      const newProduct = {
        name: productName,
        initialPrices: parseFloat(initialPrices),
        price: parseFloat(productPrice),
        description: productDescription,
        image: imageUrl, // Ikada kotha URL pamaali
        quantity: 0,
      };

      const productsRef = dbRef(database, "products");
      await push(productsRef, newProduct);

      // Form Reset
      setProductName("");
      setInitialPrices("");
      setProductPrice("");
      setProductDescription("");
      setImageFile(null);
      document.getElementById("fileInput").value = ""; // Reset file input field

      alert("Product added successfully with image!");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Check if storage is exported!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-primary text-white fw-bold">Add New Product</Card.Header>
      <Card.Body>
        <Form onSubmit={handleAddProduct}>
          <Form.Group className="mb-3">
            <Form.Label>Product Name</Form.Label>
            <Form.Control
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </Form.Group>

          <div className="d-flex gap-3 mb-3">
            <Form.Group className="w-50">
              <Form.Label>Initial Price (₹)</Form.Label>
              <Form.Control
                type="number"
                value={initialPrices}
                onChange={(e) => setInitialPrices(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="w-50">
              <Form.Label>Current Price (₹)</Form.Label>
              <Form.Control
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                required
              />
            </Form.Group>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Product Image (Select File)</Form.Label>
            <Form.Control
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 py-2" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "🚀 Add Product"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AddProductForm;