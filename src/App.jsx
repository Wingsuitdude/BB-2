import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { SpaceBackground } from './components/layout/SpaceBackground';
import { HomePage } from './pages/HomePage';
import { BasesPage } from './pages/BasesPage';
import { BaseDetailPage } from './pages/BaseDetailPage';
import { TalentPage } from './pages/TalentPage';
import { RewardsPage } from './pages/RewardsPage';
import { CreateBasePage } from './pages/CreateBasePage';
import { MessagesPage } from './pages/MessagesPage';
import { ConnectionsPage } from './pages/ConnectionsPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-300">
        <SpaceBackground />
        <div className="relative z-10">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/bases" element={<BasesPage />} />
              <Route path="/bases/:id" element={<BaseDetailPage />} />
              <Route path="/talent" element={<TalentPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/bases/create" element={<CreateBasePage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/connections" element={<ConnectionsPage />} />
              <Route path="/profile/:address" element={<ProfilePage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}