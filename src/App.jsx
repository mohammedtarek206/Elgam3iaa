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
  UserPlus,
  Briefcase,
  Ticket,
  MessageSquare
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
  { id: 'employees', label: 'إدارة الموظفين', icon: UserRound, color: '#16a085' },
  { id: 'registration', label: 'طلبات الالتحاق', icon: UserPlus, color: '#f39c12' },
  { id: 'job-applications', label: 'طلبات التوظيف', icon: Briefcase, color: '#34495e' },
  { id: 'ticket-submission', label: 'الشكاوي والمقترحات', icon: Ticket, color: '#e67e22' },
  { id: 'ticket-tracking', label: 'متابعة الشكوى والاقتراح', icon: Search, color: '#e67e22' },
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
import JobApplicationForm from './components/JobApplicationForm';
import JobApplicationsManager from './components/JobApplicationsManager';
import EmployeeManager from './components/EmployeeManager';
import TicketSubmission from './components/TicketSubmission';
import TicketTracking from './components/TicketTracking';
import TicketManager from './components/TicketManager';

import Login from './components/Login';
import { LogOut, AlertTriangle, RefreshCcw } from 'lucide-react';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#fff' }}>
          <AlertTriangle size={64} color="#e74c3c" />
          <h2>حدث خطأ غير متوقع</h2>
          <p style={{ color: '#666', margin: '15px 0' }}>{this.state.error?.message || "حدث خطأ أثناء تشغيل هذا الجزء من المنصة"}</p>
          <button 
            style={{ padding: '10px 20px', background: '#3498db', color: '#fff', borderRadius: '8px' }}
            onClick={() => window.location.reload()}
          >
            <RefreshCcw size={16} /> إعادة تحميل الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isParentFollowup, setIsParentFollowup] = useState(false);
  const [isSheikhRegistering, setIsSheikhRegistering] = useState(false);
  const [isJobApplying, setIsJobApplying] = useState(false);
  const [isTicketSubmitting, setIsTicketSubmitting] = useState(false);
  const [isTicketTracking, setIsTicketTracking] = useState(false);
  
  // Listen for registration event from Login
  React.useEffect(() => {
    const handleOpenReg = () => setIsRegistering(true);
    const handleOpenParent = () => setIsParentFollowup(true);
    const handleOpenSheikh = () => setIsSheikhRegistering(true);
    const handleOpenJob = () => setIsJobApplying(true);
    const handleOpenTicketSub = () => setIsTicketSubmitting(true);
    const handleOpenTicketTrack = () => setIsTicketTracking(true);

    window.addEventListener('open-registration', handleOpenReg);
    window.addEventListener('open-parent-followup', handleOpenParent);
    window.addEventListener('open-sheikh-registration', handleOpenSheikh);
    window.addEventListener('open-job-application', handleOpenJob);
    window.addEventListener('open-ticket-submission', handleOpenTicketSub);
    window.addEventListener('open-ticket-tracking', handleOpenTicketTrack);

    return () => {
      window.removeEventListener('open-registration', handleOpenReg);
      window.removeEventListener('open-parent-followup', handleOpenParent);
      window.removeEventListener('open-sheikh-registration', handleOpenSheikh);
      window.removeEventListener('open-job-application', handleOpenJob);
      window.removeEventListener('open-ticket-submission', handleOpenTicketSub);
      window.removeEventListener('open-ticket-tracking', handleOpenTicketTrack);
    };
  }, []);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser || savedUser === 'undefined') return null;
    try { return JSON.parse(savedUser); }
    catch(e) { return null; }
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
    if (isJobApplying) {
      return <JobApplicationForm onBack={() => setIsJobApplying(false)} />;
    }
    if (isTicketSubmitting) {
      return <TicketSubmission onBack={() => setIsTicketSubmitting(false)} />;
    }
    if (isTicketTracking) {
      return <TicketTracking onBack={() => setIsTicketTracking(false)} />;
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

    if (user.role !== 'admin') {
      // Simple grid for managers
      return (
        <div className="pyramid-container">
          <div className="menu-row">
            {filteredItems.map(item => (
              <button key={item.id} className="menu-card" onClick={() => setCurrentPage(item.id)}>
                <div className="icon-wrapper" style={{ color: item.color }}><item.icon size={48} /></div>
                <span className="menu-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Role == admin: 6 left, 6 right, others bottom
    const leftItems = filteredItems.slice(0, 6);
    const rightItems = filteredItems.slice(6, 12);
    const bottomItems = filteredItems.slice(12);

    return (
      <div className="orbit-wrapper fade-in">
        <div className="orbit-main-grid">
          {/* Left Column */}
          <div className="orbit-side-grid left-side">
            {leftItems.map(item => (
              <button key={item.id} className="orbit-card" onClick={() => setCurrentPage(item.id)}>
                <div className="orbit-icon-box" style={{ color: item.color }}>
                  <item.icon size={36} />
                </div>
                <span className="orbit-label">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Center Column: Logo */}
          <div className="orbit-center">
            <div className="logo-glow-wrapper">
              <img src="/shariaa_logo.png" alt="Logo" className="orbit-hero-logo" />
              <div className="logo-text-overlay">
                <h3>الجمعية الشرعية</h3>
                <p>مكتب تحفيظ كفر طلا</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="orbit-side-grid right-side">
            {rightItems.map(item => (
              <button key={item.id} className="orbit-card" onClick={() => setCurrentPage(item.id)}>
                <div className="orbit-icon-box" style={{ color: item.color }}>
                  <item.icon size={36} />
                </div>
                <span className="orbit-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="orbit-bottom-row">
          {bottomItems.map(item => (
            <button key={item.id} className="orbit-card secondary" onClick={() => setCurrentPage(item.id)}>
              <div className="orbit-icon-box" style={{ color: item.color }}>
                <item.icon size={36} />
              </div>
              <span className="orbit-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container" dir="rtl">
      <header className="main-header">
        <div className="header-brand">
          <img src="/shariaa_logo.png" alt="اللوجو" className="header-logo" />
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
        <ErrorBoundary>
          {currentPage === 'home' ? (
            null
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
          {currentPage === 'job-applications' && <JobApplicationsManager />}
          {currentPage === 'employees' && <EmployeeManager />}
          {currentPage === 'tickets' && <TicketManager />}
        </ErrorBoundary>
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

        .orbit-wrapper {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .orbit-main-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr 1fr;
          gap: 30px;
          align-items: center;
        }

        .orbit-side-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .orbit-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .logo-glow-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .logo-glow-wrapper::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(39, 174, 96, 0.15) 0%, transparent 70%);
          z-index: -1;
          animation: logoPulse 4s ease-in-out infinite;
        }

        @keyframes logoPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
        }

        .orbit-hero-logo {
          width: 250px;
          height: 250px;
          object-fit: contain;
          filter: drop-shadow(0 15px 30px rgba(0,0,0,0.15));
          margin-bottom: 20px;
        }

        .logo-text-overlay h3 {
          font-size: 1.8rem;
          color: var(--primary);
          margin: 0;
          font-weight: 800;
        }

        .logo-text-overlay p {
          color: var(--secondary);
          font-weight: 600;
          margin: 5px 0 0;
        }

        .orbit-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          padding: 24px 15px;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
        }

        .orbit-card:hover {
          transform: translateY(-8px) scale(1.02);
          background: white;
          box-shadow: 0 20px 35px rgba(0,0,0,0.1);
          border-color: var(--accent);
        }

        .orbit-icon-box {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.8);
          transition: transform 0.3s ease;
        }

        .orbit-card:hover .orbit-icon-box {
          transform: rotate(5deg) scale(1.1);
        }

        .orbit-label {
          font-size: 1rem;
          font-weight: 700;
          color: #2c3e50;
          text-align: center;
          line-height: 1.3;
        }

        .orbit-bottom-row {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 10px;
        }

        .orbit-card.secondary {
          width: 200px;
          padding: 20px;
        }

        @media (max-width: 1100px) {
          .orbit-main-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .orbit-side-grid {
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            order: 2;
          }
          .orbit-center {
            order: 1;
            margin-bottom: 20px;
          }
          .orbit-bottom-row {
            flex-wrap: wrap;
            order: 3;
          }
          .orbit-hero-logo { width: 180px; height: 180px; }
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
