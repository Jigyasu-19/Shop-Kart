import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";
import { toggleWishlist } from "../features/wishlist/wishlistSlice";

export default function ProductCard({ product }) {
  const [wishlistError, setWishlistError] = useState("");
  const [cartError, setCartError] = useState("");
  const dispatch = useDispatch();
  const saved = useSelector((state) => state.wishlist.items.some((item) => item._id === product._id));
  const wishlistPending = useSelector((state) => state.wishlist.pendingIds.includes(product._id));
  const adding = useSelector((state) => state.cart.pendingIds.includes(product._id));

  async function handleAddToCart() {
    setCartError("");
    try { await dispatch(addToCart(product._id)).unwrap(); }
    catch { setCartError("Unable to add this product. Please check your stock or sign in."); }
  }

  async function handleWishlistClick() {
    if (wishlistPending) return;
    setWishlistError("");
    try {
      await dispatch(toggleWishlist(product)).unwrap();
    } catch (error) {
      setWishlistError(error.message === "Unauthorized" ? "Please log in to update your wishlist." : "Unable to update wishlist. Please try again.");
    }
  }

  return (
    <article className="product-card">
      <Link className="product-image-link" to={`/products/${product._id}`} aria-label={`View ${product.name}`}>
        <img className="product-image" src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <div className="product-card-content">
        <p className="product-category">{product.category}</p>
        <h2>{product.name}</h2>
        <p className="product-price">₹{Number(product.price).toLocaleString("en-IN")}</p>
        <p className={product.stock > 0 ? "stock-status" : "stock-status out-of-stock"}>
          {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
        </p>
        <Link className="details-button" to={`/products/${product._id}`}>View Details</Link>
        <button className="primary-button add-cart-button" type="button" onClick={handleAddToCart} disabled={adding || product.stock < 1}>
          {adding ? "Adding..." : "Add to Cart"}
        </button>
        {cartError && <p className="wishlist-inline-error" role="alert">{cartError}</p>}
        <button className={`wishlist-action${saved ? " is-saved" : ""}`} type="button" onClick={handleWishlistClick} disabled={wishlistPending}>
          {wishlistPending ? "⏳ Saving..." : saved ? "♥ Remove from Wishlist" : "♡ Add to Wishlist"}
        </button>
        {wishlistError && <p className="wishlist-inline-error" role="alert">{wishlistError}</p>}
      </div>
    </article>
  );
}
