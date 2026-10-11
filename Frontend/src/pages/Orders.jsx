import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrders } from "../services/api";

const money = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;
const date = (value) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getOrders().then((data) => { if (active) setOrders(data.orders || []); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <><Navbar /><main className="cart-page"><header className="catalog-heading"><div><p className="eyebrow">YOUR PURCHASE HISTORY</p><h1>My Orders</h1></div></header>
    {loading ? <p className="catalog-message" role="status">Loading your orders…</p>
      : error ? <section className="catalog-message error-message" role="alert">Unable to load orders: {error}</section>
        : !orders.length ? <section className="wishlist-empty"><h2>You have not placed any orders yet.</h2><Link className="primary-button browse-wishlist-button" to="/products">Start Shopping</Link></section>
          : <div className="order-list">{orders.map((order) => <article className="order-card" key={order._id}>
            <div className="order-card-heading"><div><h2>Order #{order._id}</h2><p>{date(order.createdAt)}</p></div><span className={`order-status status-${order.status.toLowerCase()}`}>{order.status.replaceAll("_", " ")}</span></div>
            <ul>{order.items.map((item, index) => <li key={`${item.product}-${index}`}>{item.name} × {item.quantity}</li>)}</ul>
            <footer className="order-card-footer">
              <strong className="order-card-total">Total: {money(order.totalAmount)}</strong>
              <Link className="order-details-link" to={`/orders/${order._id}`}>View Details</Link>
            </footer>
          </article>)}</div>}
  </main></>;
}
