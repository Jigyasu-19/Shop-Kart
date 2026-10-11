import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrder } from "../services/api";

const money = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

export default function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getOrder(id).then((data) => { if (active) setOrder(data.order); })
      .catch((requestError) => { if (active) setError(requestError.message); });
    return () => { active = false; };
  }, [id]);
  return <><Navbar /><main className="cart-page">
    {error ? <section className="catalog-message error-message" role="alert">Unable to load this order: {error}</section>
      : !order ? <p className="catalog-message" role="status">Loading order…</p>
        : <section className="order-confirmation"><p className="eyebrow">{location.state?.confirmed ? "PAYMENT VERIFIED" : "ORDER DETAILS"}</p><h1>{location.state?.confirmed ? "Order Placed Successfully" : "Order Details"}</h1>
          <p>Your order has been saved successfully.</p><dl><div><dt>Order ID</dt><dd>{order._id}</dd></div><div><dt>Total</dt><dd>{money(order.totalAmount)}</dd></div><div><dt>Payment</dt><dd>{order.paymentStatus}</dd></div><div><dt>Status</dt><dd>{order.status.replaceAll("_", " ")}</dd></div></dl>
          <h2>Items</h2><ul>{order.items.map((item, index) => <li key={`${item.product}-${index}`}>{item.name} × {item.quantity} · {money(item.price)}</li>)}</ul>
          <h2>Shipping to</h2><p>{order.shippingAddress.fullName}<br />{order.shippingAddress.addressLine1}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}<br />{order.shippingAddress.phone}</p>
          <div className="order-actions"><Link className="primary-button browse-wishlist-button" to="/orders">View My Orders</Link><Link to="/products">Continue Shopping</Link></div>
        </section>}
  </main></>;
}
