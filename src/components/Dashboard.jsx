import React, { useState, useEffect } from 'react';
import { Users, UserRound, School, Wallet, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const API_URL = '/api';

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [sheikhs, setSheikhs] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({
    studentCount: 0,
    sheikhCount: 0,
    totalClasses: 0,
    revenue: 0,
    attendanceRate: 0,
    loading: true
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const res = await fetch(`${API_URL}/stats`, { headers });
      const data = await res.json();
      
      setStudents(data.recentStudents || []); // Used for activity list
      
      setStats({
        totalRevenue: data.totalRevenue,
        totalStudents: data.totalStudents,
        totalSheikhs: data.totalSheikhs,
        totalClasses: data.totalClasses,
        attendanceRate: data.attendanceRate,
        loading: false
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return <div className="loading-state">جاري تحميل البيانات...</div>;
  }

  const statCards = [
    { title: 'إجمالي الطلاب', value: stats.totalStudents, icon: Users, color: '#3498db', trend: '+12%', isUp: true },
    { title: 'إجمالي المحفظين', value: stats.totalSheikhs, icon: UserRound, color: '#9b59b6', trend: '+2', isUp: true },
    { title: 'نسبة الحضور اليوم', value: `${stats.attendanceRate}%`, icon: Calendar, color: '#27ae60', trend: 'مباشر', isUp: true },
    { title: 'حلقات التحفيظ', value: stats.totalClasses, icon: School, color: '#e67e22', trend: 'فعال', isUp: true },
    { title: 'إجمالي الدخل', value: `${stats.totalRevenue.toLocaleString()} ج.م`, icon: Wallet, color: '#2ecc71', trend: '+8%', isUp: true },
  ];

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <h2>نظرة عامة على الجمعية</h2>
        <p>إحصائيات مباشرة ومتابعة شاملة لكافة الأنشطة</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
              <card.icon size={28} />
            </div>
            <div className="stat-details">
              <span className="stat-title">{card.title}</span>
              <div className="stat-value-row">
                <span className="stat-value">{card.value}</span>
                <span className={`stat-trend ${card.isUp ? 'up' : 'down'}`}>
                  {card.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {card.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-main-grid">
        <div className="chart-section main-card">
          <div className="card-header">
            <h3>معدل التدفق المالي</h3>
            <TrendingUp size={20} color="#666" />
          </div>
          <div className="visual-chart">
            <div className="chart-bars">
              {[60, 80, 45, 90, 70, 100, 85].map((h, i) => (
                <div key={i} className="bar-wrapper">
                  <div className="bar" style={{ height: `${h}%` }}></div>
                  <span className="bar-label">{['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="recent-activity main-card">
          <div className="card-header">
            <h3>آخر التحديثات</h3>
            <Calendar size={20} color="#666" />
          </div>
          <div className="activity-list">
            {stats.loading ? (
              <p>جاري التحميل...</p>
            ) : (
              // Show last 5 students as "Recent Activity"
              [...students].reverse().slice(0, 5).map(s => (
                <div key={s._id} className="activity-item">
                  <div className="activity-bullet green"></div>
                  <div className="activity-info">
                    <strong>إضافة طالب جديد</strong>
                    <span>تم تسجيل الطالب {s.name} في فصل {s.className}</span>
                  </div>
                </div>
              ))
            )}
            {students.length === 0 && <p style={{textAlign:'center', color:'#888'}}>لا يوجد نشاط مؤخراً</p>}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .dashboard-header h2 { font-size: 1.8rem; color: var(--primary); margin-bottom: 4px; }
        .dashboard-header p { color: #666; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: var(--white);
          padding: 24px;
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          display: flex;
          align-items: center;
          gap: 20px;
          transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-5px); }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-details { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .stat-title { font-size: 0.95rem; color: #777; font-weight: 600; }
        .stat-value-row { display: flex; justify-content: space-between; align-items: baseline; }
        .stat-value { font-size: 1.6rem; font-weight: 800; color: var(--secondary); }
        
        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
        }
        .stat-trend.up { background: #eafaf1; color: #2ecc71; }
        .stat-trend.down { background: #fdedec; color: #e74c3c; }

        .dashboard-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .main-card {
          background: var(--white);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 24px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .card-header h3 { font-size: 1.2rem; color: var(--secondary); }

        .visual-chart {
          height: 250px;
          display: flex;
          align-items: flex-end;
          padding-bottom: 20px;
        }

        .chart-bars {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          gap: 15px;
        }

        .bar-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          height: 100%;
          justify-content: flex-end;
        }

        .bar {
          width: 100%;
          background: linear-gradient(to top, var(--primary), var(--accent));
          border-radius: 8px 8px 0 0;
          transition: height 1s ease-out;
          opacity: 0.8;
        }
        .bar:hover { opacity: 1; }

        .bar-label { font-size: 0.8rem; color: #777; font-weight: 600; }

        .activity-list { display: flex; flex-direction: column; gap: 20px; }
        .activity-item { display: flex; gap: 16px; align-items: flex-start; }
        .activity-bullet { width: 10px; height: 10px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
        .activity-bullet.green { background: #2ecc71; box-shadow: 0 0 0 4px #eafaf1; }
        .activity-bullet.orange { background: #e67e22; box-shadow: 0 0 0 4px #fef5e7; }
        .activity-bullet.blue { background: #3498db; box-shadow: 0 0 0 4px #ebf5fb; }

        .activity-info { display: flex; flex-direction: column; gap: 4px; }
        .activity-info strong { font-size: 0.95rem; color: var(--secondary); }
        .activity-info span { font-size: 0.85rem; color: #777; }

        @media (max-width: 900px) {
          .dashboard-main-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
