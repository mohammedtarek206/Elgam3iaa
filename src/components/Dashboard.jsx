import React, { useState, useEffect } from 'react';
import { Users, UserRound, School, Wallet, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, HandCoins, Gift, CheckCircle2, AlertCircle, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_URL = '/api';

const Dashboard = () => {
  const [students, setStudents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cache_recent_students')) || []; }
    catch(e) { return []; }
  });
  const [sheikhs, setSheikhs] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    totalSheikhs: 0,
    totalClasses: 0,
    attendanceRate: 0,
    grantFundBalance: 0,
    inKindCount: 0,
    paidList: [],
    unpaidList: [],
    atRiskStudents: [],
    inKindInventory: [],
    loading: true
  });

  useEffect(() => {
    fetchDashboardStats(selectedMonth);
  }, [selectedMonth]);

  const fetchDashboardStats = async (month) => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const res = await fetch(`${API_URL}/stats?month=${month}`, { headers });
      const data = await res.json();
      
      setStudents(data.recentStudents || []);
      
      const statsData = {
        totalRevenue: data.totalRevenue || 0,
        totalStudents: data.totalStudents,
        totalSheikhs: data.totalSheikhs,
        totalClasses: data.totalClasses,
        attendanceRate: data.attendanceRate,
        atRiskStudents: data.atRiskStudents || [],
        paidList: data.paidList || [],
        unpaidList: data.unpaidList || [],
        grantFundBalance: data.grantFundBalance || 0,
        inKindCount: data.inKindCount || 0,
        inKindInventory: data.inKindInventory || [],
        loading: false
      };

      setStats(statsData);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const exportFinance = (list, type) => {
    const dataToExport = list.map(s => ({
      'اسم الطالب': s.name,
      'الفصل': s.className,
      'المقدار الشهري': s.monthlyFees || '---',
      'الحالة': type === 'paid' ? 'تم السداد' : 'لم يسدد',
      'الشهر': selectedMonth
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Finance");
    XLSX.writeFile(wb, `تقرير_${type}_${selectedMonth}.xlsx`);
  };

  if (stats.loading) {
    return <div className="loading-state">جاري تحميل البيانات...</div>;
  }

  const statCards = [
    { title: 'إجمالي الطلاب', value: stats.totalStudents, icon: Users, color: '#3498db', trend: '+12%', isUp: true },
    { title: 'إجمالي المحفظين', value: stats.totalSheikhs, icon: UserRound, color: '#9b59b6', trend: '+2', isUp: true },
    { title: 'نسبة الحضور اليوم', value: `${stats.attendanceRate}%`, icon: Calendar, color: '#27ae60', trend: 'مباشر', isUp: true },
    { title: 'حلقات التحفيظ', value: stats.totalClasses, icon: School, color: '#e67e22', trend: 'فعال', isUp: true },
    { title: 'إجمالي الدخل النقدي', value: `${(stats.totalRevenue || 0).toLocaleString()} ج.م`, icon: Wallet, color: '#2ecc71', trend: '+8%', isUp: true },
    { title: 'رصيد صندوق المنح', value: `${(stats.grantFundBalance || 0).toLocaleString()} ج.م`, icon: HandCoins, color: '#f1c40f', trend: 'متوفر', isUp: true },
    { title: 'أنواع التبرعات العينية', value: stats.inKindCount || 0, icon: Gift, color: '#e74c3c', trend: 'نشط', isUp: true },
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

        <div className="inkind-inventory main-card">
          <div className="card-header">
            <h3>المخزون العيني المتوفر (جرد حي)</h3>
            <Gift size={20} color="#e74c3c" />
          </div>
          <div className="inventory-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px'}}>
            {stats.inKindInventory?.length > 0 ? (
              stats.inKindInventory.map((item, idx) => (
                <div key={idx} className="inventory-item" style={{background: '#f8f9fa', padding: '10px', borderRadius: '8px', borderRight: '4px solid #e74c3c'}}>
                  <div style={{fontWeight: 'bold', color: '#333'}}>{item.unit}</div>
                  <div style={{fontSize: '0.9rem', color: item.count > 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold'}}>{item.count} <small>وحدة</small></div>
                </div>
              ))
            ) : <p className="empty-msg">لا يوجد مخزون عيني حالياً</p>}
          </div>
        </div>

        <div className="section-header-row full-width" style={{marginTop: '30px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h3 className="section-title">حالة التحصيل المالي للسداد</h3>
          <div className="month-picker" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <label style={{fontWeight: '700'}}>عرض شهر:</label>
            <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd'}} />
          </div>
        </div>

        <div className="finance-status-grid full-width">
          <div className="finance-card paid main-card">
            <div className="card-header">
              <h3 style={{color: '#27ae60'}}>طلاب تم السداد لهم ({stats.paidList.length})</h3>
              <div style={{display: 'flex', gap: '8px'}}>
                {stats.paidList.length > 0 && <button className="export-mini-btn" onClick={() => exportFinance(stats.paidList, 'paid')} title="تصدير Excel"><FileDown size={18} /></button>}
                <CheckCircle2 size={22} color="#27ae60" />
              </div>
            </div>
            <div className="mini-student-list">
              {stats.paidList.length > 0 ? (
                stats.paidList.map(s => (
                  <div key={s._id} className="mini-student-item">
                    <div className="status-dot green"></div>
                    <div className="s-info">
                      <strong>{s.name}</strong>
                      <span>{s.className}</span>
                    </div>
                  </div>
                ))
              ) : <p className="empty-msg">لا يوجد طلاب مسددين لهذا الشهر</p>}
            </div>
          </div>

          <div className="finance-card unpaid main-card">
            <div className="card-header">
              <h3 style={{color: '#e74c3c'}}>طلاب لم يتم السداد لهم ({stats.unpaidList.length})</h3>
              <div style={{display: 'flex', gap: '8px'}}>
                {stats.unpaidList.length > 0 && <button className="export-mini-btn" onClick={() => exportFinance(stats.unpaidList, 'unpaid')} title="تصدير Excel"><FileDown size={18} /></button>}
                <AlertCircle size={22} color="#e74c3c" />
              </div>
            </div>
            <div className="mini-student-list">
              {stats.unpaidList.length > 0 ? (
                stats.unpaidList.map(s => (
                  <div key={s._id} className="mini-student-item">
                    <div className="status-dot red"></div>
                    <div className="s-info">
                      <strong>{s.name}</strong>
                      <span style={{color: '#e74c3c'}}>المبلغ: {s.monthlyFees} ج.م</span>
                    </div>
                  </div>
                ))
              ) : <p className="empty-msg">الكل مسدد لهذا الشهر، استمروا!</p>}
            </div>
          </div>
        </div>

        <div className="recent-activity main-card">
          <div className="card-header">
            <h3>آخر الإضافات</h3>
            <Calendar size={20} color="#666" />
          </div>
          <div className="activity-list">
            {(students || []).slice(-3).reverse().map(s => (
              <div key={s._id} className="activity-item">
                <div className="activity-bullet green"></div>
                <div className="activity-info">
                  <strong>طالب جديد</strong>
                  <span>تم تسجيل {s.name} في {s.className}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card-header" style={{marginTop: '25px'}}>
            <h3>سجل التبرعات العارضة (عينية)</h3>
            <Gift size={20} color="#e74c3c" />
          </div>
          <div className="activity-list">
            {stats.recentInKind?.length > 0 ? (
              stats.recentInKind.slice(0, 5).map((item, idx) => (
                <div key={idx} className="activity-item">
                  <div className="activity-bullet" style={{background: '#e74c3c'}}></div>
                  <div className="activity-info">
                    <strong>{item.refName || 'متبرع'}</strong>
                    <span>أهدى: {item.unit} | بتاريخ: {item.date}</span>
                  </div>
                </div>
              ))
            ) : <p className="empty-msg">لا يوجد تبرعات عينية مسجلة مؤخراً</p>}
          </div>
        </div>

        {stats.atRiskStudents && stats.atRiskStudents.length > 0 && (
          <div className="attendance-alerts main-card full-width">
            <div className="card-header">
              <h3 style={{color: '#e74c3c'}}>تنبيهات الحضور والغياب</h3>
              <Calendar size={20} color="#e74c3c" />
            </div>
            <div className="alerts-grid">
              {stats.atRiskStudents.map(student => (
                <div key={student._id} className={`alert-card ${student.absenceCount > 6 ? 'critical' : 'warning'}`}>
                  <div className="alert-info">
                    <strong>{student.name}</strong>
                    <span>فصل: {student.className}</span>
                  </div>
                  <div className="alert-stats">
                    <span className="absence-count">{student.absenceCount} غيابات</span>
                    <span className="absence-status">
                      {student.absenceCount > 6 ? 'منقطع' : 'تنبيه'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.financeStats && (
          <div className="finance-status-section main-card full-width">
            <div className="card-header">
              <h3>حالة السداد (الشهر الحالي)</h3>
              <Wallet size={20} color="#666" />
            </div>
            <div className="finance-status-grid">
              <div className="finance-stat-card paid">
                <div className="stat-main">
                  <span className="label">سددوا الرسوم</span>
                  <span className="value">{stats.financeStats.paidCount} طالب</span>
                </div>
                <div className="mini-list">
                  {(stats.financeStats.paidStudents || []).slice(0, 3).map((s, i) => (
                    <div key={i} className="mini-item">✓ {s.name}</div>
                  ))}
                  {(stats.financeStats.paidStudents || []).length > 3 && <div className="more">+ {(stats.financeStats.paidStudents || []).length - 3} آخرين</div>}
                </div>
              </div>
              <div className="stat-box unpaid">
                <span className="label">غير مسددين</span>
                <span className="value">{(stats.financeStats.unpaidCount || 0)} طالب</span>
                <div className="mini-list">
                  {(stats.financeStats.unpaidStudents || []).slice(0, 3).map((s, i) => (
                    <div key={i} className="mini-item">✗ {s.name}</div>
                  ))}
                  {(stats.financeStats.unpaidStudents || []).length > 3 && <div className="more">+ {(stats.financeStats.unpaidStudents || []).length - 3} آخرين</div>}
                </div>
              </div>
            </div>
          </div>
        )}
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

        .attendance-alerts { margin-top: 24px; border-top: 4px solid #e74c3c; }
        .alerts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .alert-card { padding: 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border-right: 4px solid; }
        .alert-card.warning { background: #fef9c3; border-color: #f1c40f; color: #854d0e; }
        .alert-card.critical { background: #fdedec; border-color: #e74c3c; color: #943126; animation: softPulse 2s infinite; }
        
        @keyframes softPulse {
          0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
          100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
        }

        .alert-info { display: flex; flex-direction: column; }
        .alert-info strong { font-size: 1rem; }
        .alert-info span { font-size: 0.85rem; opacity: 0.8; }
        
        .alert-stats { text-align: left; display: flex; flex-direction: column; align-items: flex-end; }
        .absence-count { font-weight: 800; font-size: 1.1rem; }
        .absence-status { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; background: rgba(0,0,0,0.05); padding: 2px 8px; border-radius: 4px; }

        .finance-status-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .finance-stat-card { padding: 20px; border-radius: 16px; display: flex; flex-direction: column; gap: 15px; }
        .finance-stat-card.paid { background: #f0fdf4; border: 1px solid #bbf7d0; }
        .finance-stat-card.unpaid { background: #fef2f2; border: 1px solid #fecaca; }
        
        .finance-stat-card .stat-main { display: flex; flex-direction: column; }
        .finance-stat-card .stat-main .label { font-size: 0.9rem; color: #666; font-weight: 600; }
        .finance-stat-card .stat-main .value { font-size: 1.5rem; font-weight: 800; color: var(--secondary); }
        
        .student-peek-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .peek-item { background: rgba(255,255,255,0.6); padding: 2px 8px; border-radius: 6px; font-size: 0.8rem; color: #444; }
        .peek-item-more { font-size: 0.8rem; color: #888; font-weight: 600; align-self: center; }

        @media (max-width: 900px) {
          .dashboard-main-grid { grid-template-columns: 1fr; }
        }

        .finance-status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 24px; }
        .finance-card h3 { font-size: 1.1rem; margin-bottom: 0; }
        .mini-student-list { max-height: 300px; overflow-y: auto; padding-right: 8px; margin-top: 15px; }
        .mini-student-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid #f0f0f0; transition: 0.2s; }
        .mini-student-item:hover { background: #f9f9f9; }
        .status-dot { width: 10px; height: 10px; border-radius: 50%; }
        .status-dot.green { background: #27ae60; box-shadow: 0 0 8px rgba(39, 174, 96, 0.4); }
        .status-dot.red { background: #e74c3c; box-shadow: 0 0 8px rgba(231, 76, 60, 0.4); }
        .s-info { display: flex; flex-direction: column; }
        .s-info strong { font-size: 0.95rem; color: #333; }
        .s-info span { font-size: 0.8rem; color: #666; }
        .empty-msg { text-align: center; color: #999; padding: 20px; font-size: 0.9rem; }
      `}</style>
    </div>
  );
};

export default Dashboard;
