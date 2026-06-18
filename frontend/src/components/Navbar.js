import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ShoppingCart, User, Menu, X, LogOut, Package, Shield } from 'lucide-react';

function Navbar({ user, logout, cartCount }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <span className="font-bold text-xl text-gray-900">BookShop</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Каталог
            </Link>
            
            {user ? (
              <>
                <Link to="/cart" className="relative text-gray-700 hover:text-primary-600 transition-colors">
                  <ShoppingCart className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/orders" className="text-gray-700 hover:text-primary-600 transition-colors">
                  <Package className="h-6 w-6" />
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-700 hover:text-primary-600 transition-colors">
                    <Shield className="h-6 w-6" />
                  </Link>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-5 w-5" />
                  <span className="text-sm">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Вход
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden flex items-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <Link to="/" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
              Каталог
            </Link>
            {user ? (
              <>
                <Link to="/cart" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Корзина ({cartCount})
                </Link>
                <Link to="/orders" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Заказы
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                    Админ
                  </Link>
                )}
                <button onClick={handleLogout} className="block py-2 text-red-600">
                  Выход
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Вход
                </Link>
                <Link to="/register" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Регистрация
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
