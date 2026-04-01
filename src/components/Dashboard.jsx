import React, { useState, useEffect } from 'react';
import { Users, UserRound, School, Wallet, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, HandCoins, Gift, CheckCircle2, AlertCircle, FileDown, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_URL = '/api';

// Safe getter helpers - prevent ANY undefined.length crash
const safeArr = (val) => (Array.isArray(val) ? val : []);
const safeNum = (val) => (isNaN(Number(val)) ? 0 : Number(val) || 0);

const EMPTY_STATS = {
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
  recentInKind: [],
  financeStats: null,
  loading: true,
  error: null,
};

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [stats, setStats] = useState(EMPTY_STATS);

  useEffect(() => {
    fetchDashboardStats(selectedMonth);
  }, [selectedMonth]);

  const fetchDashboardStats = async (month) => {
    setStats(prev => ({ ...prev, loading: true, error: null }));
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setStats({ ...EMPTY_STATS, loading: false, error: 'لم يتم تسجيل الدخول' });
        return;
      }
      const res = await fetch(`${API_URL}/stats?month=${month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `خطأ من السيرفر: ${res.status}`);
      }

      const data = await res.json();

      // تأكيد أن data كائن حقيقي
      if (!data || typeof data !== 'object') throw new Error('بيانات غير صالحة من السيرفر');

      setStudents(safeArr(data.recentStudents));

      setStats({
        totalRevenue: safeNum(data.totalRevenue),
        totalStudents: safeNum(data.totalStudents),
        totalSheikhs: safeNum(data.totalSheikhs),
        totalClasses: safeNum(data.totalClasses),
        attendanceRate: safeNum(data.attendanceRate),
        atRiskStudents: safeArr(data.atRiskStudents),
        paidList: safeArr(data.paidList),
        unpaidList: safeArr(data.unpaidList),
        grantFundBalance: safeNum(data.grantFundBalance),
        inKindCount: safeNum(data.inKindCount),
        inKindInventory: safeArr(data.inKindInventory),
        recentInKind: safeArr(data.recentInKind),
        financeStats: data.financeStats || null,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setStats({ ...EMPTY_STATS, loading: false, error: err.message || 'خطأ في الاتصال بالسيرفر' });
    }
  };

  const exportFinance = (list, type) => {
    const arr = safeArr(list);
    if (!arr.length) return;
    const dataToExport = arr.map(s => ({
      'اسم الطالب': s.name || '',
      'الفصل': s.className || '',
      'المقدار الشهري': s.monthlyFees || '---',
      'الحالة': type === 'paid' ? 'تم السداد' : 'لم يسدد',
      'الشهر': selectedMonth
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Finance');
    XLSX.writeFile(wb, `تقرير_${type}_${selectedMonth}.xlsx`);
  };

  if (stats.loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⏳</div>
        <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>
        <h3 style={{ color: '#e74c3c', marginBottom: '10px' }}>تعذّر تحميل لوحة التحكم</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>{stats.error}</p>
        <button
          onClick={() => fetchDashboardStats(selectedMonth)}
          style={{ padding: '10px 24px', background: '#3498db', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '700' }}
        >
          🔄 إعادة المحاولة
        </button>
      </div>
    );
  }

  const paidList = safeArr(stats.paidList);
  const unpaidList = safeArr(stats.unpaidList);
  const atRiskStudents = safeArr(stats.atRiskStudents);
  const inKindInventory = safeArr(stats.inKindInventory);
  const recentInKind = safeArr(stats.recentInKind);

  const statCards = [
    { title: 'إجمالي الطلاب', value: stats.totalStudents, icon: Users, color: '#3498db', trend: 'نشط', isUp: true },
    { title: 'إجمالي المحفظين', value: stats.totalSheikhs, icon: UserRound, color: '#9b59b6', trend: 'نشط', isUp: true },
    { title: 'نسبة الحضور اليوم', value: `${stats.attendanceRate}%`, icon: Calendar, color: '#27ae60', trend: 'مباشر', isUp: true },
    { title: 'حلقات التحفيظ', value: stats.totalClasses, icon: School, color: '#e67e22', trend: 'فعال', isUp: true },
    { title: 'إجمالي الدخل النقدي', value: `${stats.totalRevenue.toLocaleString()} ج.م`, icon: Wallet, color: '#2ecc71', trend: '+8%', isUp: true },
    { title: 'رصيد صندوق المنح', value: `${stats.grantFundBalance.toLocaleString()} ج.م`, icon: HandCoins, color: '#f1c40f', trend: 'متوفر', isUp: true },
    { title: 'أنواع التبرعات العينية', value: stats.inKindCount, icon: Gift, color: '#e74c3c', trend: 'نشط', isUp: true },
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
          <div className="inventory-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {inKindInventory.length > 0 ? (
              inKindInventory.map((item, idx) => (
                <div key={idx} className="inventory-item" style={{ background: '#f8f9fa', padding: '10px', borderRadius: '8px', borderRight: '4px solid #e74c3c' }}>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>{item.unit}</div>
                  <div style={{ fontSize: '0.9rem', color: item.count > 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>{item.count} <small>وحدة</small></div>
                </div>
              ))
            ) : <p className="empty-msg">لا يوجد مخزون عيني حالياً</p>}
          </div>
        </div>

        <div className="section-header-row full-width" style={{ marginTop: '30px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="section-title">حالة التحصيل المالي للسداد</h3>
          <div className="month-picker" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: '700' }}>عرض شهر:</label>
            <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          </div>
        </div>

        <div className="finance-status-grid full-width">
          <div className="finance-card paid main-card">
            <div className="card-header">
              <h3 style={{ color: '#27ae60' }}>طلاب تم السداد لهم ({paidList.length})</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {paidList.length > 0 && <button className="export-mini-btn" onClick={() => exportFinance(paidList, 'paid')} title="تصدير Excel"><FileDown size={18} /></button>}
                <CheckCircle2 size={22} color="#27ae60" />
              </div>
            </div>
            <div className="mini-student-list">
              {paidList.length > 0 ? (
                paidList.map(s => (
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
              <h3 style={{ color: '#e74c3c' }}>طلاب لم يتم السداد لهم ({unpaidList.length})</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {unpaidList.length > 0 && <button className="export-mini-btn" onClick={() => exportFinance(unpaidList, 'unpaid')} title="تصدير Excel"><FileDown size={18} /></button>}
                <AlertCircle size={22} color="#e74c3c" />
              </div>
            </div>
            <div className="mini-student-list">
              {unpaidList.length > 0 ? (
                unpaidList.map(s => (
                  <div key={s._id} className="mini-student-item">
                    <div className="status-dot red"></div>
                    <div className="s-info">
                      <strong>{s.name}</strong>
                      <span style={{ color: '#e74c3c' }}>المبلغ: {s.monthlyFees} ج.م</span>
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
            {safeArr(students).slice(-3).reverse().map((s, idx) => (
              <div key={s._id || idx} className="activity-item">
                <div className="activity-bullet green"></div>
                <div className="activity-info">
                  <strong>طالب جديد</strong>
                  <span>تم تسجيل {s.name} في {s.className}</span>
                </div>
              </div>
            ))}
            {!safeArr(students).length && <p className="empty-msg">لا توجد إضافات حديثة</p>}
          </div>

          <div className="card-header" style={{ marginTop: '25px' }}>
            <h3>سجل التبرعات العارضة (عينية)</h3>
            <Gift size={20} color="#e74c3c" />
          </div>
          <div className="activity-list">
            {recentInKind.length > 0 ? (
              recentInKind.slice(0, 5).map((item, idx) => (
                <div key={item._id || idx} className="activity-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="activity-bullet" style={{ background: '#e74c3c' }}></div>
                    <div className="activity-info">
                      <strong>{item.refName || 'متبرع'}</strong>
                      <span>أهدى: {item.unit} | بتاريخ: {item.date}</span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (!window.confirm('هل تريد حذف هذا التبرع واسترداد الكمية للمتبرع؟')) return;
                      const res = await fetch(`/api/transactions/${item._id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                      });
                      if (res.ok) fetchDashboardStats(selectedMonth);
                    }}
                    style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: '5px' }}
                    title="حذف واسترداد"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : <p className="empty-msg">لا يوجد تبرعات عينية مسجلة مؤخراً</p>}
          </div>
        </div>

        {atRiskStudents.length > 0 && (
          <div className="attendance-alerts main-card full-width">
            <div className="card-header">
              <h3 style={{ color: '#e74c3c' }}>تنبيهات الحضور والغياب</h3>
              <Calendar size={20} color="#e74c3c" />
            </div>
            <div className="alerts-grid">
              {atRiskStudents.map((student, idx) => (
                <div key={student._id || idx} className={`alert-card ${student.absenceCount > 6 ? 'critical' : 'warning'}`}>
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

        .export-mini-btn {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #27ae60;
          border-radius: 6px;
          padding: 4px 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .full-width { grid-column: 1 / -1; }

        @media (max-width: 900px) {
          .dashboard-main-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
