'use client';

import { AuthGuard } from './AuthGuard';

export default function Home() {
  return (
    <AuthGuard>
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Three-Way Match Engine</h1>
        <p className="text-gray-500 mt-2">App shell coming next.</p>
      </div>
    </AuthGuard>
  );
}
