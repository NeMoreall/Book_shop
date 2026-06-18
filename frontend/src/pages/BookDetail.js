import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingCart, ArrowLeft, Loader2 } from 'lucide-react';

function BookDetail({ user, updateCartCount }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const response = await axios.get(`/api/books/${id}`);
      setBook(response.data);
    } catch (err) {
      console.error('Failed to fetch book');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      setAddingToCart(true);
      await axios.post('/api/cart', { book_id: id, quantity });
      updateCartCount();
      alert('Добавлено в корзину!');
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка добавления в корзину');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Книга не найдена</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Назад
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-8">
          <div>
            <img
              src={book.image_url}
              alt={book.title}
              className="w-full h-96 object-cover rounded-xl"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                {book.category}
              </span>
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-medium">{book.rating}</span>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-4">{book.author}</p>
            <p className="text-gray-700 mb-6">{book.description}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-primary-600">${book.price}</span>
              <span className={`text-sm ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {book.stock > 0 ? `В наличии: ${book.stock}` : 'Нет в наличии'}
              </span>
            </div>

            {book.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <label className="text-gray-700">Количество:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={addToCart}
              disabled={addingToCart || book.stock === 0}
              className="flex items-center justify-center gap-2 bg-primary-600 text-white py-4 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 text-lg font-medium"
            >
              {addingToCart ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <ShoppingCart className="h-6 w-6" />
              )}
              {addingToCart ? 'Добавление...' : 'Добавить в корзину'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetail;
