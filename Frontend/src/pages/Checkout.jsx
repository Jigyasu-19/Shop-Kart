import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import { clearCart, fetchCart, selectCartItems, selectCartSubtotal } from "../features/cart/cartSlice";
import { createPaymentOrder, verifyPayment } from "../services/api";

const fields = [["fullName", "Full name"], ["phone", "Phone number"], ["addressLine1", "Address line"], ["city", "City"], ["state", "State"], ["pincode", "Pincode"]];
const initialAddress = Object.fromEntries(fields.map(([key]) => [key, ""]));
const money = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function validate(address) {
  for (const [key, label] of fields) if (!address[key].trim()) return `${label} is required.`;
  if (!/^\+?[0-9][0-9\s-]{8,14}$/.test(address.phone.trim())) return "Enter a valid phone number.";
  if (!/^\d{6}$/.test(address.pincode.trim())) return "Pincode must contain 6 digits.";
  return "";
}

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const cartLoading = useSelector((state) => state.cart.loading);
  const cartError = useSelector((state) => state.cart.error);
  const subtotal = useSelector(selectCartSubtotal);
  const [address, setAddress] = useState(initialAddress);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validate(address);
    if (validationError) { setError(validationError); return; }
    setLoading(true); setError("");
    try {
      const shippingAddress = Object.fromEntries(Object.entries(address).map(([key, value]) => [key, value.trim()]));
      const paymentOrder = await createPaymentOrder(shippingAddress);
      if (!(await loadRazorpayScript())) throw new Error("Could not load Razorpay Checkout. Your cart is unchanged; please try again.");
      const checkout = new window.Razorpay({
        key: paymentOrder.key, amount: paymentOrder.amount, currency: paymentOrder.currency,
        name: "ShopKart", description: "ShopKart Order", order_id: paymentOrder.razorpayOrderId,
        prefill: { name: shippingAddress.fullName, contact: shippingAddress.phone },
        handler: async (response) => {
          try {
            await verifyPayment({ shopKartOrderId: paymentOrder.shopKartOrderId, ...response });
            dispatch(clearCart());
            navigate(`/orders/${paymentOrder.shopKartOrderId}`, { state: { confirmed: true } });
          } catch (verificationError) {
            setError(`${verificationError.message} Your cart has not been cleared.`);
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: "#0f766e" },
      });
      checkout.on("payment.failed", (response) => {
        setError(response.error?.description || "Payment failed. Your cart has not been cleared. Please try again.");
        setLoading(false);
      });
      checkout.open();
    } catch (paymentError) { setError(paymentError.message); setLoading(false); }
  }

  return <><Navbar /><main className="cart-page">
    <header className="catalog-heading"><div><p className="eyebrow">SECURE CHECKOUT</p><h1>Checkout</h1></div></header>
    {cartLoading ? <p className="catalog-message" role="status">Loading your cart…</p> : cartError && !cartItems.length ? <section className="catalog-message error-message" role="alert"><p>Unable to load your cart: {cartError}</p><button className="primary-button retry-button" onClick={() => dispatch(fetchCart())}>Try Again</button></section> : !cartItems.length ? <section className="wishlist-empty"><h2>Your cart is empty</h2><p>Add products before checking out.</p><Link className="primary-button browse-wishlist-button" to="/products">Browse Products</Link></section> :
      <div className="checkout-layout"><form className="checkout-form" onSubmit={handleSubmit} noValidate>
        <h2>Shipping Details</h2>
        {fields.map(([key, label]) => <label className="field" key={key}>{label}<input value={address[key]} onChange={(event) => setAddress({ ...address, [key]: event.target.value })} autoComplete={key === "addressLine1" ? "street-address" : key === "fullName" ? "name" : key} inputMode={key === "phone" || key === "pincode" ? "numeric" : undefined} /></label>)}
        {error && <p className="alert error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={loading}>{loading ? "Preparing payment…" : "Place Order · Pay with Razorpay"}</button>
        <small>Razorpay Test Mode payment. Your cart clears only after payment verification.</small>
      </form><aside className="order-summary"><h2>Order Summary</h2>
        {cartItems.map((item) => <p key={item.product?._id}><span>{item.product?.name || "Product"} × {item.quantity}</span><strong>{money(Number(item.product?.price || 0) * item.quantity)}</strong></p>)}
        <p className="summary-total"><span>Total</span><strong>{money(subtotal)}</strong></p>
      </aside></div>}
  </main></>;
}
