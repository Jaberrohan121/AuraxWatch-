
import React, { useState } from 'react';
import { User } from '../types';
import { ADMIN_CREDENTIALS } from '../constants';

interface AuthProps {
  store: any;
  onAuthenticated: () => void;
}

export const AuthView: React.FC<AuthProps> = ({ store, onAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Check Admin
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        const adminUser: User = {
          id: 'admin',
          email: ADMIN_CREDENTIALS.email,
          fullName: 'Main Admin',
          phone: '000',
          address: 'Headquarters',
          role: 'ADMIN',
          createdAt: Date.now(),
        };
        store.login(adminUser);
        onAuthenticated();
        return;
      }

      // Check User
      const user = store.users.find((u: User) => u.email === email && u.password === password);
      if (user) {
        store.login(user);
        onAuthenticated();
      } else {
        setError('Invalid credentials');
      }
    } else {
      // Register
      if (store.users.find((u: User) => u.email === email)) {
        setError('User already exists');
        return;
      }

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        fullName,
        phone,
        address,
        password,
        role: 'USER',
        createdAt: Date.now(),
      };

      store.registerUser(newUser);
      store.login(newUser);
      onAuthenticated();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">AURAX</h1>
          <p className="text-gray-500 mt-2 font-medium">Fine Horology Store</p>
        </div>

        <h2 className="text-2xl font-semibold mb-6 text-center">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h2>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <input
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
                placeholder="Delivery Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </>
          )}
          <input
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            className="w-full bg-black text-white p-3 rounded-lg font-semibold hover:bg-gray-800 transition transform active:scale-95"
            type="submit"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-black font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};
