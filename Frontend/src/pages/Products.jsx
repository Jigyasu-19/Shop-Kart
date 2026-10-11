import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../features/products/productsSlice";

const categories = ["Electronics", "Fashion", "Books", "Home"];

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const { loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ search: search.trim(), category, sort }));
  }, [dispatch, search, category, sort]);

  return (
    <>
      <Navbar />
      <main className="catalog-page">
        <header className="catalog-heading">
          <div><p className="eyebrow">SHOPKART CATALOG</p><h1>Find your next favorite</h1>
            <p className="subtext">Browse the latest products, all in one place.</p></div>
        </header>
        <section className="catalog-toolbar" aria-label="Product filters">
          <label className="search-control"><span className="sr-only">Search products</span>
            <input type="search" placeholder="Search products..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <label className="filter-control"><span className="sr-only">Filter by category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">All Categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="filter-control"><span className="sr-only">Sort products by price</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="">Default order</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option>
            </select>
          </label>
        </section>
        {loading ? <p className="catalog-message" role="status">Loading products...</p>
          : error ? <p className="catalog-message error-message" role="alert">Something went wrong while loading products.</p>
            : products.length === 0 ? <p className="catalog-message">No products found.</p>
              : <section className="product-grid" aria-label="Products">{products.map((product) => <ProductCard key={product._id} product={product} />)}</section>}
      </main>
    </>
  );
}
