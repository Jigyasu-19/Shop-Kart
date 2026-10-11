import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import { fetchWishlist, selectWishlistItems } from "../features/wishlist/wishlistSlice";

export default function Wishlist() {
  const dispatch = useDispatch();
  const products = useSelector(selectWishlistItems);
  const { loading, error } = useSelector((state) => state.wishlist);

  return (
    <>
      <Navbar />
      <main className="catalog-page wishlist-page">
        <header className="catalog-heading wishlist-heading">
          <div>
            <p className="eyebrow">SAVED FOR LATER</p>
            <h1>My Wishlist</h1>
            {!loading && !error && <p className="subtext">{products.length} {products.length === 1 ? "product" : "products"} saved</p>}
          </div>
        </header>
        {loading ? <p className="catalog-message" role="status">Loading your wishlist...</p>
          : error ? <section className="catalog-message error-message" role="alert">
            <p>Unable to load wishlist.</p>
            <button className="primary-button retry-button" type="button" onClick={() => dispatch(fetchWishlist())}>Try Again</button>
          </section>
            : products.length === 0 ? <section className="wishlist-empty">
              <span className="empty-heart" aria-hidden="true">♡</span>
              <h2>Your wishlist is empty ❤️</h2>
              <p>Start saving products you love and find them here later.</p>
              <Link className="primary-button browse-wishlist-button" to="/products">Browse Products</Link>
            </section>
              : <section className="product-grid" aria-label="Saved products">{products.map((product) => (
                <WishlistCard key={product._id} product={product} />
              ))}</section>}
      </main>
    </>
  );
}
