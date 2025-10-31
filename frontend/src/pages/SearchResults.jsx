import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const query = new URLSearchParams(location.search).get("q");

  useEffect(() => {
    if (query) {
      fetchResults(query);
    }
  }, [query]);

  const fetchResults = async (q) => {
    try {
      const data = await api.searchProducts(q);
      setProducts(data.results || data.items || []);
    } catch (error) {
      console.error("❌ Search failed:", error);
      setProducts([]);
    }
  };

  return (
  <>
  <Navbar/>
  
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">
        Search results for “{query}”
      </h2>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="border rounded-lg p-4 cursor-pointer hover:shadow-md"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover mb-3"
              />
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600">₹{product.price}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No products found.</p>
      )}
    </div>
    <Footer/>
    </>
  );
}
