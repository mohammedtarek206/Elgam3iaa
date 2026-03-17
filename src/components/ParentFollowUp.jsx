import React, { useState } from 'react';
import { Search, ArrowRight, User, CalendarCheck, Wallet, Trophy, AlertCircle, BookOpen } from 'lucide-react';

const ParentFollowUp = ({ onBack }) => {
  const [nationalId, setNationalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentData, setStudentData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!nationalId.trim() || nationalId.length !== 14) {
      setError('يرجى إدخال رقم قومي صحيح (14 رقم)');
      return;
    }

    setLoading(true);
    setError('');
    setStudentData(null);

    try {
      const response = await fetch(`/api/public/student-followup/${nationalId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ أثناء جلب البيانات');
      }

      setStudentData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parent-followup-container fade-in" dir="rtl">
      <div className="container-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowRight size={20} />
          العودة لتسجيل الدخول
        </button>
        <h2>متابعة ولي الأمر</h2>
        <p>قم بإدخال الرقم القومي للطالب لعرض تفاصيل الحفظ، الحضور، الحسابات والاختبارات.</p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="الرقم القومي للطالب (14 رقم)"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
              maxLength="14"
              required
            />
            <button type="submit" disabled={loading} className="search-btn">
              {loading ? 'جاري البحث...' : <><Search size={20} /> بحث</>}
            </button>
          </div>
        </form>
        {error && (
          <div className="error-message fade-in">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {studentData && (
        <div className="student-dashboard fade-in">
          {/* Student Info Card */}
          <div className="dashboard-card info-card">
            <div className="card-header">
              <User className="card-icon" />
              <h3>البيانات الأساسية</h3>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">اسم الطالب:</span>
                <span className="info-value text-primary">{studentData.student.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">الفصل:</span>
                <span className="info-value">{studentData.student.className}</span>
              </div>
              <div className="info-item">
                <span className="info-label">الشيخ المحفظ:</span>
                <span className="info-value">{studentData.student.sheikh}</span>
              </div>
              <div className="info-item">
                <span className="info-label">المرحلة / المستوى:</span>
                <span className="info-value">{studentData.student.level || 'غير محدد'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">السورة الحالية:</span>
                <span className="info-value">{studentData.student.currentSurah || 'غير محدد'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">تاريخ الالتحاق:</span>
                <span className="info-value">{studentData.student.joinDate || 'غير محدد'}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Attendance Card */}
            <div className="dashboard-card">
              <div className="card-header">
                <CalendarCheck className="card-icon text-green" />
                <h3>سجل الحضور والغياب</h3>
              </div>
              <div className="card-content">
                {studentData.attendance && studentData.attendance.length > 0 ? (
                  <div className="table-responsive">
                    <table>
                      <thead>
                        <tr>
                          <th>التاريخ</th>
                          <th>الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentData.attendance.map((att, idx) => (
                          <tr key={idx}>
                            <td>{att.date}</td>
                            <td>
                              <span className={`status-badge ${att.status}`}>
                                {att.status === 'present' ? 'حاضر' : att.status === 'absent' ? 'غائب' : 'متأخر'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-data">لا توجد سجلات حضور</p>
                )}
              </div>
            </div>

            {/* Finance Card */}
            <div className="dashboard-card">
              <div className="card-header">
                <Wallet className="card-icon text-blue" />
                <h3>المدفوعات والحسابات</h3>
              </div>
              <div className="card-content">
                {studentData.transactions && studentData.transactions.length > 0 ? (
                  <div className="table-responsive">
                    <table>
                      <thead>
                        <tr>
                          <th>التاريخ</th>
                          <th>البيان</th>
                          <th>المبلغ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentData.transactions.map((t, idx) => (
                          <tr key={idx}>
                            <td>{t.date}</td>
                            <td>{t.notes || t.category}</td>
                            <td className="text-success">{t.amount} ج.م</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-data">لا توجد سجلات مالية</p>
                )}
              </div>
            </div>

            {/* Exams Card */}
            <div className="dashboard-card full-width">
              <div className="card-header">
                <Trophy className="card-icon text-orange" />
                <h3>نتائج الاختبارات</h3>
              </div>
              <div className="card-content">
                {studentData.exams && studentData.exams.length > 0 ? (
                  <div className="table-responsive">
                    <table>
                      <thead>
                        <tr>
                          <th>اسم الاختبار</th>
                          <th>التاريخ</th>
                          <th>الدرجة</th>
                          <th>التقدير</th>
                          <th>المكافأة</th>
                          <th>ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentData.exams.map((exam, idx) => (
                          <tr key={idx}>
                            <td>{exam.examName}</td>
                            <td>{exam.date}</td>
                            <td><strong>{exam.score}</strong></td>
                            <td>
                              <span className={`grade-badge ${exam.grade === 'ممتاز' ? 'excellent' : exam.grade === 'جيد جدا' ? 'vgood' : exam.grade === 'جيد' ? 'good' : 'acceptable'}`}>
                                {exam.grade || '-'}
                              </span>
                            </td>
                            <td>{exam.reward || '-'}</td>
                            <td>{exam.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-data">لا توجد نتائج اختبارات مسجلة</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .parent-followup-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%);
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .container-header {
          text-align: center;
          margin-bottom: 40px;
          width: 100%;
          max-width: 800px;
          position: relative;
        }

        .back-btn {
          position: absolute;
          right: 0;
          top: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary);
          background: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: var(--primary);
          color: white;
          transform: translateY(-2px);
        }

        .container-header h2 {
          color: var(--primary);
          font-size: 2.2rem;
          margin-bottom: 12px;
          margin-top: 40px;
        }
        
        @media (min-width: 768px) {
          .container-header h2 { margin-top: 0; }
        }

        .container-header p {
          color: #666;
          font-size: 1.1rem;
        }

        .search-section {
          width: 100%;
          max-width: 600px;
          margin-bottom: 40px;
        }

        .input-wrapper {
          display: flex;
          background: white;
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          border: 2px solid transparent;
          transition: all 0.3s;
        }
        
        .input-wrapper:focus-within {
          border-color: var(--accent);
          box-shadow: 0 10px 25px rgba(52, 152, 219, 0.2);
        }

        .input-wrapper input {
          flex: 1;
          border: none;
          padding: 12px 20px;
          font-size: 1.1rem;
          background: transparent;
          outline: none;
        }

        .search-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: bold;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .search-btn:hover:not(:disabled) {
          background: var(--secondary);
          transform: translateY(-2px);
        }
        
        .search-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          margin-top: 16px;
          background: #fee2e2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        .student-dashboard {
          width: 100%;
          max-width: 1000px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr 1fr;
          }
          .full-width {
            grid-column: 1 / -1;
          }
        }

        .dashboard-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.02);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #f0fdf4;
        }

        .card-header h3 {
          margin: 0;
          color: var(--text-color);
          font-size: 1.3rem;
        }

        .card-icon {
          background: #f8fafc;
          padding: 8px;
          border-radius: 12px;
          width: 40px;
          height: 40px;
        }

        .text-green { color: #2ecc71; background: #e8f5e9; }
        .text-blue { color: #3498db; background: #ebf5fb; }
        .text-orange { color: #f39c12; background: #fef5e7; }
        .text-primary { color: var(--primary); font-weight: bold; }
        .text-success { color: #27ae60; font-weight: bold; }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: #f8fafc;
          padding: 16px;
          border-radius: 12px;
        }

        .info-label {
          color: #64748b;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .info-value {
          color: var(--text-color);
          font-size: 1.1rem;
          font-weight: 500;
        }

        .table-responsive {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: right;
          padding: 12px;
          color: #64748b;
          font-weight: 600;
          font-size: 0.95rem;
          border-bottom: 2px solid #f1f5f9;
        }

        td {
          padding: 16px 12px;
          border-bottom: 1px solid #f1f5f9;
          color: var(--text-color);
        }

        tr:last-child td {
          border-bottom: none;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .status-badge.present { background: #dcfce7; color: #166534; }
        .status-badge.absent { background: #fee2e2; color: #991b1b; }
        .status-badge.late { background: #fef9c3; color: #854d0e; }

        .grade-badge {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: bold;
        }

        .grade-badge.excellent { background: #dcfce7; color: #166534; }
        .grade-badge.vgood { background: #e0f2fe; color: #0369a1; }
        .grade-badge.good { background: #fef9c3; color: #854d0e; }
        .grade-badge.acceptable { background: #ffedd5; color: #9a3412; }

        .no-data {
          text-align: center;
          color: #94a3b8;
          padding: 30px;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
};

export default ParentFollowUp;
