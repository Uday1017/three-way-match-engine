'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { authStorage } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token } = await authApi.login(username, password);
      authStorage.setToken(token);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="w-full max-w-sm bg-cream-card p-8 rounded-lg shadow-sm border border-cream-border">
        <h1 className="text-xl font-semibold text-charcoal-text mb-1">Three-Way Match Engine</h1>
        <p className="text-sm text-text-muted mb-6">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-subtle mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-cream-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-subtle mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-cream-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-2 rounded-md text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
