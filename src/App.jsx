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
  Printer,
  UserPlus
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, color: '#3498db' },
  { id: 'students', label: 'إدارة الطلاب', icon: Users, color: '#2ecc71' },
  { id: 'sheikhs', label: 'إدارة المحفظين', icon: UserRound, color: '#9b59b6' },
  { id: 'classes', label: 'إدارة الفصول', icon: School, color: '#e67e22' },
  { id: 'attendance', label: 'الحضور والغياب', icon: CalendarCheck, color: '#e74c3c' },
  { id: 'finance', label: 'إدارة النقدية', icon: Wallet, color: '#1abc9c' },
  { id: 'grants', label: 'المنح والعطاءات', icon: Gift, color: '#f1c40f' },
  { id: 'exams', label: 'الاختبارات والمسابقات', icon: Trophy, color: '#d35400' },
  { id: 'registration', label: 'طلبات الالتحاق', icon: UserPlus, color: '#f39c12' },
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
import RegistrationManager from './components/RegistrationManager';
import StudentRegistration from './components/StudentRegistration';
import ParentFollowUp from './components/ParentFollowUp';
import SheikhRegistration from './components/SheikhRegistration';

import Login from './components/Login';
import { LogOut } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isParentFollowup, setIsParentFollowup] = useState(false);
  const [isSheikhRegistering, setIsSheikhRegistering] = useState(false);
  
  // Listen for registration event from Login
  React.useEffect(() => {
    const handleOpenReg = () => setIsRegistering(true);
    const handleOpenParent = () => setIsParentFollowup(true);
    const handleOpenSheikh = () => setIsSheikhRegistering(true);
    window.addEventListener('open-registration', handleOpenReg);
    window.addEventListener('open-parent-followup', handleOpenParent);
    window.addEventListener('open-sheikh-registration', handleOpenSheikh);
    return () => {
      window.removeEventListener('open-registration', handleOpenReg);
      window.removeEventListener('open-parent-followup', handleOpenParent);
      window.removeEventListener('open-sheikh-registration', handleOpenSheikh);
    };
  }, []);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('home');
  };

  if (!user) {
    if (isRegistering) {
      return <StudentRegistration onBack={() => setIsRegistering(false)} />;
    }
    if (isParentFollowup) {
      return <ParentFollowUp onBack={() => setIsParentFollowup(false)} />;
    }
    if (isSheikhRegistering) {
      return <SheikhRegistration onBack={() => setIsSheikhRegistering(false)} />;
    }
    return (
      <div className="login-page-wrapper" dir="rtl">
        <main className="content">
          <Login onLogin={setUser} />
        </main>
      </div>
    );
  }

  const renderHome = () => {
    // Filter items based on role
    const allowedIds = user.role === 'admin' 
      ? menuItems.map(i => i.id) 
      : ['students', 'sheikhs', 'attendance', 'finance', 'classes'];
    
    const filteredItems = menuItems.filter(item => allowedIds.includes(item.id));

    // Calculate rows dynamically based on filtered list
    const rows = [];
    if (user.role === 'admin') {
      rows.push(filteredItems.slice(0, 4));
      rows.push(filteredItems.slice(4, 7));
      rows.push(filteredItems.slice(7, 10)); // Adjusted for extra item
    } else {
      // For manager, simpler 3-2 layout
      rows.push(filteredItems.slice(0, 3));
      rows.push(filteredItems.slice(3, 5));
    }

    return (
      <div className="pyramid-container">
        {rows.map((row, idx) => (
          <div key={idx} className={`menu-row row-${idx + 1}`}>
            {row.map((item) => (
              <button 
                key={item.id} 
                className="menu-card fade-in" 
                onClick={() => setCurrentPage(item.id)}
              >
                <div className="icon-wrapper" style={{ color: item.color }}>
                  <item.icon size={56} />
                </div>
                <span className="menu-label">{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app-container" dir="rtl">
      <header className="main-header">
        <div className="header-brand">
          <img src="/شعار_الجمعية_الشرعية.png" alt="اللوجو" className="header-logo" />
          <div className="header-info">
            <h1>الجمعية الشرعية كفر طلا</h1>
            <span className="subtitle">مكتب تحفيظ القران الكريم</span>
            <span className="user-welcome">مرحباً، {user.username}</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="icon-btn" title="بحث"><Search size={24} /></button>
          <button className="icon-btn" title="طباعة"><Printer size={24} /></button>
          <button className="icon-btn logout-btn" title="تسجيل الخروج" onClick={handleLogout}>
            <LogOut size={24} />
          </button>
        </div>
      </header>

      <main className="content">
        {currentPage === 'home' ? (
          <div className="welcome-section">
            <img src="/شعار_الجمعية_الشرعية.png" alt="الجمعية الشرعية" className="home-hero-logo" />
            <h2>الجمعية الشرعية كفر طلا</h2>
            <p>مكتب تحفيظ القران الكريم</p>
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
        {currentPage === 'registration' && <RegistrationManager />}
      </main>

      <style>{`
        .login-page-wrapper {
          min-height: 100vh;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%);
        }

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

        .header-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .user-welcome {
          font-size: 0.9rem;
          color: var(--secondary);
          font-weight: 600;
        }

        .main-header h1 {
          font-size: 2.2rem;
          color: var(--primary);
          font-weight: 800;
          letter-spacing: -1px;
          line-height: 1.2;
        }

        .subtitle {
          font-size: 1.1rem;
          color: var(--secondary);
          font-weight: 600;
          margin-bottom: 8px;
        }

        .logout-btn {
          color: #e74c3c !important;
        }

        .logout-btn:hover {
          background: #e74c3c !important;
          color: white !important;
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

        .header-brand {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-logo {
          width: 100px;
          height: 100px;
          object-fit: contain;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
        }

        .pyramid-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
          align-items: center;
          padding: 20px 0;
        }

        .menu-row {
          display: flex;
          gap: 24px;
          justify-content: center;
          width: 100%;
        }

        .menu-card {
          width: 220px;
          padding: 32px 16px;
          border-radius: var(--radius);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.6);
        }

        .home-hero-logo {
          width: 180px;
          height: 180px;
          object-fit: contain;
          margin-bottom: 20px;
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.15));
          animation: logoFloat 3s ease-in-out infinite;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
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
