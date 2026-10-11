import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutCustomer } from "../services/api";
import { clearCart, selectCartCount } from "../features/cart/cartSlice";
import { clearWishlist, selectWishlistCount } from "../features/wishlist/wishlistSlice";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dispatch = useDispatch();
  const wishlistCount = useSelector(selectWishlistCount);
  const itemCount = useSelector(selectCartCount);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutCustomer();
    } finally {
      dispatch(clearCart());
      dispatch(clearWishlist());
      // Navigate even if the server has already cleared an expired cookie.
      navigate("/login", { replace: true });
    }
  }

  return (
    <nav className="navbar">
      <Link className="brand" aria-label="ShopKart home" to="/home">
        ShopKart
      </Link>
      <Link className="nav-home" to="/home">Home</Link>
      <Link className="nav-products" to="/products">Products</Link>
      <Link className="nav-wishlist" to="/wishlist">Wishlist{wishlistCount !== null ? ` (${wishlistCount})` : ""}</Link>
      <Link className="nav-cart" to="/cart">Cart ({itemCount})</Link>
      <Link className="nav-orders" to="/orders">My Orders</Link>
      <button
        className="logout-button"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? "Logging out…" : "Logout"}
      </button>
    </nav>
  );
}
