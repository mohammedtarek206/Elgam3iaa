import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  School, 
  CalendarCheck, 
  Wallet, 
  Gift, 
  Trophy, 
  FileText,
  Search,
  Plus,
  Printer
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, color: '#3498db' },
  { id: 'students', label: 'إدارة الطلاب', icon: Users, color: '#2ecc71' },
  { id: 'sheikhs', label: 'إدارة الشيوخ', icon: UserRound, color: '#9b59b6' },
  { id: 'classes', label: 'إدارة الفصول', icon: School, color: '#e67e22' },
  { id: 'attendance', label: 'الحضور والغياب', icon: CalendarCheck, color: '#e74c3c' },
  { id: 'finance', label: 'إدارة النقدية', icon: Wallet, color: '#1abc9c' },
  { id: 'grants', label: 'المنح والعطاءات', icon: Gift, color: '#f1c40f' },
  { id: 'exams', label: 'الاختبارات والمسابقات', icon: Trophy, color: '#d35400' },
  { id: 'reports', label: 'التقارير', icon: FileText, color: '#7f8c8d' },
];

import StudentManager from './components/StudentManager';
import SheikhManager from './components/SheikhManager';
import ClassManager from './components/ClassManager';
import AttendanceManager from './components/AttendanceManager';
import FinanceManager from './components/FinanceManager';
import GrantsManager from './components/GrantsManager';
import ExamsManager from './components/ExamsManager';
import ReportsManager from './components/ReportsManager';
import Dashboard from './components/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderHome = () => (
    <div className="dashboard-grid">
      {menuItems.map((item) => (
        <button 
          key={item.id} 
          className="menu-card fade-in" 
          onClick={() => setCurrentPage(item.id)}
        >
          <div className="icon-wrapper" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
            <item.icon size={48} />
          </div>
          <span className="menu-label">{item.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="app-container" dir="rtl">
      <header className="main-header">
        <h1>منصة الجمعية الشرعية</h1>
        <div className="header-actions">
          <button className="icon-btn" title="بحث"><Search size={24} /></button>
          <button className="icon-btn" title="طباعة"><Printer size={24} /></button>
        </div>
      </header>

      <main className="content">
        {currentPage === 'home' ? (
          <div className="welcome-section">
            <h2>مرحباً بك في نظام إدارة مكتب التحفيظ</h2>
            <p>اختر قسماً للمتابعة</p>
          </div>
        ) : (
          <button className="back-btn" onClick={() => setCurrentPage('home')}>← العودة للرئيسية</button>
        )}

        {currentPage === 'home' && renderHome()}
        {currentPage === 'students' && <StudentManager />}
        {currentPage === 'sheikhs' && <SheikhManager />}
        {currentPage === 'classes' && <ClassManager />}
        {currentPage === 'attendance' && <AttendanceManager />}
        {currentPage === 'finance' && <FinanceManager />}
        {currentPage === 'grants' && <GrantsManager />}
        {currentPage === 'exams' && <ExamsManager />}
        {currentPage === 'reports' && <ReportsManager />}
        
        {currentPage === 'dashboard' && <Dashboard />}
      </main>

      <style>{`
        .app-container {
          min-height: 100vh;
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .main-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          border-bottom: 3px solid var(--accent);
          padding-bottom: 20px;
          padding-top: 10px;
        }

        .main-header h1 {
          font-size: 2.2rem;
          color: var(--primary);
          font-weight: 800;
          letter-spacing: -1px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .welcome-section {
          text-align: center;
          margin-bottom: 40px;
        }

        .welcome-section h2 {
          font-size: 1.8rem;
          color: var(--secondary);
          margin-bottom: 8px;
        }

        .welcome-section p {
          color: #666;
          font-size: 1.1rem;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          padding: 12px;
        }

        .menu-card {
          background: var(--white);
          padding: 32px 16px;
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid transparent;
        }

        .menu-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.12);
          border-color: var(--accent);
        }

        .icon-wrapper {
          width: 90px;
          height: 90px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .menu-card:hover .icon-wrapper {
          transform: scale(1.1);
        }

        .menu-label {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary);
          text-align: center;
        }

        .icon-btn {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: var(--white);
          box-shadow: var(--shadow);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--secondary);
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: var(--primary);
          color: var(--white);
          transform: translateY(-2px);
        }

        .back-btn {
          margin-bottom: 32px;
          padding: 10px 24px;
          background: var(--white);
          color: var(--primary);
          border: 2px solid var(--primary);
          border-radius: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: var(--primary);
          color: var(--white);
        }

        .module-placeholder {
          text-align: center;
          padding: 80px;
          background: var(--white);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
        }

        @media (max-width: 640px) {
          .dashboard-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          
          .menu-card {
            padding: 24px 12px;
          }

          .icon-wrapper {
            width: 70px;
            height: 70px;
          }

          .menu-label {
            font-size: 1rem;
          }

          .main-header h1 {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
