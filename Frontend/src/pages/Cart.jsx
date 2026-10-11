import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, selectCartCount, selectCartItems, selectCartSubtotal } from "../features/cart/cartSlice";

const money = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

export default function Cart() {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const itemCount = useSelector(selectCartCount);
  const subtotal = useSelector(selectCartSubtotal);
  const { loading, error } = useSelector((state) => state.cart);
  return <><Navbar /><main className="cart-page">
    <header className="catalog-heading"><div><p className="eyebrow">READY WHEN YOU ARE</p><h1>My Cart</h1></div></header>
    {loading ? <p className="catalog-message" role="status">Loading your cart...</p>
      : error && !cartItems.length ? <section className="catalog-message error-message" role="alert"><p>Unable to load your cart.</p><button className="primary-button retry-button" onClick={() => dispatch(fetchCart())}>Try Again</button></section>
        : !cartItems.length ? <section className="wishlist-empty"><span className="empty-heart" aria-hidden="true">🛒</span><h2>Your cart is empty</h2><p>Looks like you haven't added anything yet.</p><Link className="primary-button browse-wishlist-button" to="/products">Browse Products</Link></section>
          : <div className="cart-layout"><section className="cart-items" aria-label="Cart items">
            {error && <p className="alert error" role="alert">{error}</p>}
            {cartItems.map((item) => item.product && <CartItem key={item.product._id} item={item} />)}
          </section><aside className="order-summary"><h2>Order Summary</h2><p><span>Items</span><strong>{itemCount}</strong></p><p className="summary-total"><span>Subtotal</span><strong>{money(subtotal)}</strong></p><Link className="primary-button checkout-button checkout-link" to="/checkout">Proceed to Checkout</Link><small>Review your order and shipping details.</small></aside></div>}
  </main></>;
}
