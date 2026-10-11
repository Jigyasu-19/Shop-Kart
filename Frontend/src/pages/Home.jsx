import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCurrentCustomer } from "../services/api";

export default function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    let active = true;
    getCurrentCustomer()
      .then((data) => {
        if (active) setCustomer(data);
      })
      .catch(() => navigate("/login", { replace: true }));
    return () => {
      active = false;
    };
  }, [navigate]);

  if (!customer)
    return <main className="loading-page">Checking your session…</main>;

  const name = customer.fullName || customer.name || "Customer";
  const phone = customer.phone || "Not provided";
  return (
    <>
      <Navbar />
      <main className="home-page">
        <section className="welcome-card">
          <p className="eyebrow">YOUR ACCOUNT</p>
          <h1>Welcome, {name}!</h1>
          <p className="subtext">You are securely logged in to ShopKart.</p>
          <button className="primary-button browse-button" onClick={() => navigate("/products")}>Browse Products</button>
          <div className="profile-details">
            <ProfileItem label="Customer name" value={name} />
            <ProfileItem label="Email" value={customer.email} />
            <ProfileItem label="Phone number" value={phone} />
          </div>
        </section>
      </main>
    </>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div className="profile-item">
      <span>{label}</span>
      <strong>{value || "Not provided"}</strong>
    </div>
  );
}
