import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import { fetchProduct } from "../features/products/productsSlice";
import { addToCart } from "../features/cart/cartSlice";

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected: product, loading, error } = useSelector((state) => state.products);
  const adding = useSelector((state) => state.cart.pendingIds.includes(id));
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    dispatch(fetchProduct(id));
  }, [id]);

  return <><Navbar /><main className="details-page">
    {loading ? <p className="catalog-message" role="status">Loading product...</p>
      : error || !product ? <section className="catalog-message error-message" role="alert">Something went wrong while loading this product.<p><Link to="/products">Back to products</Link></p></section>
        : <>
          <Link className="back-link" to="/products">← Back to products</Link>
          <article className="details-card">
            <div className="details-image-wrap"><img src={product.image} alt={product.name} /></div>
            <div className="details-content"><p className="product-category">{product.category}</p><h1>{product.name}</h1>
              <p className="details-price">₹{Number(product.price).toLocaleString("en-IN")}</p>
              <p className="details-description">{product.description}</p>
              <p className={product.stock > 0 ? "stock-status" : "stock-status out-of-stock"}>{product.stock > 0 ? `${product.stock} units left` : "Out of stock"}</p>
              <button className="primary-button add-cart-button" type="button" disabled={product.stock < 1 || adding} onClick={async () => { setCartError(""); try { await dispatch(addToCart(product._id)).unwrap(); } catch { setCartError("Unable to add this product. Please check stock or sign in."); } }}>{adding ? "Adding..." : "Add to Cart"}</button>
              {cartError && <p className="wishlist-inline-error" role="alert">{cartError}</p>}
            </div>
          </article>
        </>}
  </main></>;
}
