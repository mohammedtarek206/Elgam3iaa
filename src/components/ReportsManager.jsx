import React, { useState, useEffect } from 'react';
import { FileText, Printer, BarChart3, Users, Wallet, Calendar, AlertCircle, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_URL = '/api';

const ReportsManager = () => {
  const [stats, setStats] = useState({
    studentsCount: 0,
    classesCount: 0,
    sheikhsCount: 0,
    totalIncome: 0,
    loading: true,
    data: { students: [], sheikhs: [], classes: [], transactions: [], attendance: [] }
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [studRes, classRes, sheikhRes, transRes, attRes] = await Promise.all([
        fetch(`${API_URL}/students`, { headers }),
        fetch(`${API_URL}/classes`, { headers }),
        fetch(`${API_URL}/sheikhs`, { headers }),
        fetch(`${API_URL}/transactions`, { headers }),
        fetch(`${API_URL}/attendance`, { headers })
      ]);
      
      const [studData, classData, sheikhData, transData, attData] = await Promise.all([
        studRes.json(),
        classRes.json(),
        sheikhRes.json(),
        transRes.json(),
        attRes.json()
      ]);

      // Ensure all are arrays before using .length
      const students = Array.isArray(studData) ? studData : [];
      const classes = Array.isArray(classData) ? classData : [];
      const sheikhs = Array.isArray(sheikhData) ? sheikhData : [];
      const transactions = Array.isArray(transData) ? transData : [];
      const attendance = Array.isArray(attData) ? attData : [];

      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      setStats({
        studentsCount: students.length,
        classesCount: classes.length,
        sheikhsCount: sheikhs.length,
        totalIncome: income,
        loading: false,
        data: { students, sheikhs, classes, transactions, attendance }
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const handleExport = (type) => {
    const { students, sheikhs, transactions, attendance } = stats.data;
    let dataToExport = [];
    let fileName = "";

    switch (type) {
      case 'attendance':
        fileName = "تقرير_الحضور.xlsx";
        dataToExport = attendance.flatMap(record => 
          record.records.map(r => ({
            'التاريخ': record.date,
            'النوع': record.attendanceType === 'student' ? 'طالب' : 'شيخ',
            'الاسم': r.name,
            'الحالة': r.status === 'present' ? 'حاضر' : r.status === 'absent' ? 'غائب' : 'متأخر'
          }))
        );
        break;

      case 'finance':
        fileName = "تقرير_المالية.xlsx";
        dataToExport = transactions.map(t => ({
          'التاريخ': t.date,
          'النوع': t.type === 'income' ? 'إيراد' : 'مصروف',
          'البند': t.category,
          'الاسم': t.refName || 'عام',
          'المبلغ': t.amount,
          'ملاحظات': t.notes || ''
        }));
        break;

      case 'sheikhs':
        fileName = "كشف_رواتب_الشيوخ.xlsx";
        dataToExport = sheikhs.map(s => {
          const studentCount = students.filter(student => student.sheikh === s.name).length;
          return {
            'الاسم': s.name,
            'الهاتف': s.phone,
            'الفصول': (s.assignedClasses || []).join(', '),
            'عدد الطلاب': studentCount,
            'الراتب': s.salary,
            'تاريخ التعيين': s.hireDate
          };
        });
        break;

      case 'late':
        fileName = "كشف_المتأخرين_عن_الدفع.xlsx";
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        dataToExport = students.filter(s => {
          const paidThisMonth = transactions.some(t => 
            t.refId === s._id && t.date.startsWith(currentMonth) && t.type === 'income'
          );
          return !paidThisMonth && (s.monthlyFees > 0);
        }).map(s => ({
          'الاسم': s.name,
          'الهاتف': s.phone,
          'الفصل': s.className,
          'المبلغ المطلوب': s.monthlyFees
        }));
        break;

      default:
        return;
    }

    if (dataToExport.length === 0) {
      alert("لا توجد بيانات لتصديرها");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reports");
    XLSX.writeFile(wb, fileName);
  };

  const reports = [
    { id: 'attendance', title: 'تقرير حضور الطلاب', icon: Users, color: '#3498db' },
    { id: 'finance', title: 'تقرير المدفوعات والإيرادات', icon: Wallet, color: '#2ecc71' },
    { id: 'sheikhs', title: 'تقرير رواتب ومكافآت الشيوخ', icon: BarChart3, color: '#9b59b6' },
    { id: 'late', title: 'الطلاب المتأخرين في الدفع', icon: AlertCircle, color: '#e74c3c' },
  ];

  return (
    <div className="reports-manager fade-in">
      <div className="module-header">
        <h2>التقارير والإحصائيات</h2>
      </div>

      <div className="reports-grid no-print">
        {reports.map((report, index) => (
          <div key={index} className="report-card">
            <div className="report-icon" style={{ backgroundColor: `${report.color}20`, color: report.color }}>
              <report.icon size={32} />
            </div>
            <div className="report-info">
              <h3>{report.title}</h3>
              <p>إصدار تقرير مفصل بالبيانات والإحصائيات الحديثة.</p>
            </div>
            <div className="report-actions">
              <button className="export-report-btn" onClick={() => handleExport(report.id)}>
                <FileDown size={18} />
                تصدير إكسيل
              </button>
              <button className="print-report-btn" onClick={() => window.print()}>
                <Printer size={18} />
                طباعة
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-stats">
        <h3 className="no-print">نظرة عامة على النظام</h3>
        <div className="charts-placeholder">
          <div className="stat-box">
            <span>إجمالي عدد الطلاب</span>
            <strong>{stats.studentsCount} طالب</strong>
          </div>
          <div className="stat-box">
            <span>إجمالي عدد الفصول</span>
            <strong>{stats.classesCount} حلقة</strong>
          </div>
          <div className="stat-box">
            <span>إجمالي عدد الشيوخ</span>
            <strong>{stats.sheikhsCount} محفظ</strong>
          </div>
          <div className="stat-box">
            <span>إجمالي الإيرادات</span>
            <strong>{stats.totalIncome.toLocaleString()} ج.م</strong>
          </div>
        </div>
      </div>

      <style>{`
        .reports-manager {
          padding: 24px;
          background: var(--white);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin: 32px 0;
        }

        .report-card {
          border: 1px solid var(--gray-light);
          padding: 24px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 20px;
          transition: all 0.2s;
        }

        .report-card:hover { transform: translateY(-5px); box-shadow: var(--shadow); }

        .report-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .report-info h3 { color: var(--primary); margin-bottom: 8px; }
        .report-info p { font-size: 0.9rem; color: #777; }

        .report-actions {
          display: flex;
          gap: 10px;
          margin-top: auto;
        }

        .export-report-btn, .print-report-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 700;
          transition: all 0.2s;
        }

        .export-report-btn {
          background: #f1c40f;
          color: #333;
        }

        .print-report-btn {
          background: var(--primary);
          color: var(--white);
        }

        .export-report-btn:hover { background: #d4ac0d; }
        .print-report-btn:hover { background: var(--primary-dark); }

        .dashboard-stats h3 { margin-bottom: 24px; color: var(--secondary); }
        .charts-placeholder {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-box {
          background: var(--gray-light);
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        }

        .stat-box span { display: block; font-size: 0.9rem; color: #666; margin-bottom: 8px; }
        .stat-box strong { font-size: 1.8rem; color: var(--primary); }

        @media print {
          .no-print { display: none !important; }
          .reports-manager { box-shadow: none; padding: 0; }
          .stat-box { border: 1px solid #eee; }
        }
      `}</style>
    </div>
  );
};

export default ReportsManager;
