import React, { useState } from "react";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateNepaliPhone = (phone) => /^((\+977)?98[0-9]{8})$/.test(phone);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateNepaliPhone(formData.phone)) {
      alert("Please enter a valid Nepali phone number.");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val) data.append(key, val);
    });

    try {
      const response = await fetch("http://localhost:5000/submit-order", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Order submitted successfully!");
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      alert("Submission failed. Try again later.");
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "1rem" }}>
      <h2>Allurer Sketch Studio</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email (optional)"
          onChange={handleChange}
        />
        <textarea
          name="address"
          placeholder="Temporary Address"
          onChange={handleChange}
          required
        />
        <textarea
          name="notes"
          placeholder="How You Want It"
          onChange={handleChange}
        />
        <input
          name="file"
          type="file"
          accept="image/*"
          onChange={handleChange}
          required
        />
        <button type="submit">Submit Order</button>
      </form>
    </div>
  );
}

export default App;