import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";
import { removeWishlistItem } from "../features/wishlist/wishlistSlice";

export default function WishlistCard({ product }) {
  const [error, setError] = useState("");
  const [moving, setMoving] = useState(false);
  const dispatch = useDispatch();
  const cartPending = useSelector((state) => state.cart.pendingIds.includes(product._id));
  const wishlistPending = useSelector((state) => state.wishlist.pendingIds.includes(product._id));

  async function handleMoveToCart() {
    if (moving || cartPending || wishlistPending) return;
    setMoving(true);
    setError("");
    try {
      await dispatch(addToCart(product._id)).unwrap();
      await dispatch(removeWishlistItem(product._id)).unwrap();
    } catch {
      setError("Unable to move product to cart. Please try again.");
    } finally {
      setMoving(false);
    }
  }

  async function handleRemove() {
    if (wishlistPending) return;
    setError("");
    try {
      await dispatch(removeWishlistItem(product._id)).unwrap();
    } catch {
      setError("Unable to remove product. Please try again.");
    }
  }

  return (
    <article className="product-card wishlist-card">
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
        <button className="primary-button move-cart-action" type="button" onClick={handleMoveToCart} disabled={moving || cartPending || wishlistPending || product.stock < 1}>
          {moving ? "Moving..." : "Move to Cart"}
        </button>
        <button className="wishlist-action remove-action" type="button" onClick={handleRemove} disabled={wishlistPending}>
          {wishlistPending ? "Removing..." : "Remove ♥"}
        </button>
        {error && <p className="wishlist-inline-error" role="alert">{error}</p>}
      </div>
    </article>
  );
}
