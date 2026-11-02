/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { OpportunityDiscoveryView } from './components/OpportunityDiscoveryView';
import { PeopleDiscoveryView } from './components/PeopleDiscoveryView';
import { NetworkingCrmView } from './components/NetworkingCrmView';
import { ApplicationTrackerView } from './components/ApplicationTrackerView';
import { ResumeManagerView } from './components/ResumeManagerView';
import { StudentProfileView } from './components/StudentProfileView';
import { AiCareerAssistantView } from './components/AiCareerAssistantView';
import { AutomationCenterView } from './components/AutomationCenterView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Check URL query param for default tab or autostart
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} />;
      case 'opportunities':
        return <OpportunityDiscoveryView setActiveTab={setActiveTab} />;
      case 'people':
        return <PeopleDiscoveryView setActiveTab={setActiveTab} />;
      case 'networking':
        return <NetworkingCrmView />;
      case 'applications':
        return <ApplicationTrackerView setActiveTab={setActiveTab} />;
      case 'resume':
        return <ResumeManagerView />;
      case 'assistant':
        return <AiCareerAssistantView setActiveTab={setActiveTab} />;
      case 'automation':
        return <AutomationCenterView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'profile':
        return <StudentProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          {renderActiveView()}
        </main>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
