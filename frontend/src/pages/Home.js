import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, ShoppingCart, Star, Filter } from 'lucide-react';

function Home({ user, updateCartCount }) {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [selectedCategory, search]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (search) params.search = search;
      const response = await axios.get('/api/books', { params });
      setBooks(response.data);
    } catch (err) {
      console.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(['All', ...response.data]);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const addToCart = async (bookId) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      setAddingToCart(bookId);
      await axios.post('/api/cart', { book_id: bookId, quantity: 1 });
      updateCartCount();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-4xl font-bold mb-4">Добро пожаловать в BookShop</h1>
        <p className="text-lg opacity-90">Откройте для себя мир книг. Более 10,000 наименований!</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Поиск книг..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="h-5 w-5 text-gray-500 flex-shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map(book => (
            <div key={book.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/book/${book.id}`}>
                <img
                  src={book.image_url}
                  alt={book.title}
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{book.rating}</span>
                  <span className="text-xs text-gray-400 ml-2">({book.category})</span>
                </div>
                <Link to={`/book/${book.id}`}>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-primary-600">{book.title}</h3>
                </Link>
                <p className="text-sm text-gray-500 mb-3">{book.author}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary-600">${book.price}</span>
                  <button
                    onClick={() => addToCart(book.id)}
                    disabled={addingToCart === book.id}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {addingToCart === book.id ? '...' : 'В корзину'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && books.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Книги не найдены</p>
        </div>
      )}
    </div>
  );
}

export default Home;
