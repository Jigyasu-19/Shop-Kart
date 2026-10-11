import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateCartQuantity } from "../features/cart/cartSlice";

const money = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

export default function CartItem({ item }) {
  const { product, quantity } = item;
  const dispatch = useDispatch();
  const busy = useSelector((state) => state.cart.pendingIds.includes(product._id));

  return <article className="cart-item">
    <img src={product.image} alt={product.name} />
    <div className="cart-item-info">
      <p className="product-category">{product.category}</p>
      <h2>{product.name}</h2>
      <p className="cart-unit-price">{money(product.price)} each</p>
      <button className="cart-remove-action" disabled={busy} onClick={() => dispatch(removeFromCart(product._id))}>Remove</button>
      <div className="quantity-controls">
        <button aria-label={`Decrease ${product.name} quantity`} disabled={busy || quantity <= 1} onClick={() => dispatch(updateCartQuantity({ productId: product._id, quantity: quantity - 1 }))}>−</button>
        <span>{quantity}</span>
        <button aria-label={`Increase ${product.name} quantity`} disabled={busy || quantity >= product.stock} onClick={() => dispatch(updateCartQuantity({ productId: product._id, quantity: quantity + 1 }))}>+</button>
      </div>
      {quantity >= product.stock && product.stock > 0 && <small className="cart-stock-note">Maximum available quantity</small>}
    </div>
    <strong className="cart-line-total">{money(product.price * quantity)}</strong>
  </article>;
}
