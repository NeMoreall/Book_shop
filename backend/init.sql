CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100),
    stock INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)
);

-- Insert sample books
INSERT INTO books (title, author, description, price, image_url, category, stock, rating) VALUES
('1984', 'George Orwell', 'Dystopian social science fiction novel', 15.99, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', 'Fiction', 50, 4.8),
('To Kill a Mockingbird', 'Harper Lee', 'Classic of modern American literature', 14.50, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400', 'Fiction', 40, 4.9),
('The Great Gatsby', 'F. Scott Fitzgerald', 'Jazz Age novel', 13.99, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', 'Fiction', 35, 4.5),
('Pride and Prejudice', 'Jane Austen', 'Romantic novel', 12.99, 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400', 'Romance', 45, 4.7),
('The Catcher in the Rye', 'J.D. Salinger', 'Coming-of-age novel', 14.99, 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400', 'Fiction', 30, 4.3),
('Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', 'Fantasy novel', 18.99, 'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=400', 'Fantasy', 100, 4.9),
('The Hobbit', 'J.R.R. Tolkien', 'Fantasy adventure', 16.99, 'https://images.unsplash.com/photo-1621351183012-e4f99762a2f0?w=400', 'Fantasy', 60, 4.8),
('Sapiens', 'Yuval Noah Harari', 'A Brief History of Humankind', 22.99, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400', 'Non-Fiction', 55, 4.7),
('Atomic Habits', 'James Clear', 'Self-improvement book', 19.99, 'https://images.unsplash.com/photo-1553729784-e91953dec042?w=400', 'Self-Help', 70, 4.8),
('The Psychology of Money', 'Morgan Housel', 'Personal finance', 17.99, 'https://images.unsplash.com/photo-1554774853-71015e28c1ea?w=400', 'Finance', 40, 4.6),
('Clean Code', 'Robert C. Martin', 'Software engineering', 42.99, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', 'Technology', 25, 4.9),
('The Pragmatic Programmer', 'Andrew Hunt', 'Software development', 49.99, 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400', 'Technology', 20, 4.8);

-- Insert admin user (password: admin123)
INSERT INTO users (email, password, name, role) VALUES
('admin@bookshop.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin');
