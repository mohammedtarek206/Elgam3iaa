import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Calendar, Star, Users, CheckCircle, X, FileDown, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_URL = '/api';

const ExamsManager = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/exams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setExams(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setLoading(false);
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    className: '',
    results: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/exams`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchExams();
        setShowForm(false);
        setFormData({ name: '', date: new Date().toISOString().split('T')[0], className: '', results: [] });
      }
    } catch (err) {
      console.error('Error saving exam:', err);
    }
  };

  const exportToExcel = () => {
    const dataToExport = exams.map(e => ({
      'اسم الاختبار': e.name,
      'التاريخ': e.date,
      'الفصل': e.className
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exams");
    XLSX.writeFile(wb, "الاختبارات.xlsx");
  };

  return (
    <div className="exams-manager fade-in">
      <div className="module-header no-print">
        <h2>الاختبارات والمسابقات</h2>
        <div className="header-actions">
          <button className="export-btn" onClick={exportToExcel} title="تصدير إلى إكسيل">
            <FileDown size={20} />
            تصدير
          </button>
          <button className="print-btn" onClick={() => window.print()} title="طباعة">
            <Printer size={20} />
            طباعة
          </button>
          <button className="add-btn" onClick={() => setShowForm(true)}>
            <Plus size={20} />
            إضافة اختبار جديد
          </button>
        </div>
      </div>

      <div className="exams-grid">
        {exams.map(exam => (
          <div key={exam._id} className="exam-card">
            <div className="exam-icon">
              <Trophy size={32} color="#f1c40f" />
            </div>
            <div className="exam-info">
              <h3>{exam.name}</h3>
              <div className="exam-meta">
                <div className="meta-item"><Calendar size={16} /> {exam.date}</div>
                <div className="meta-item"><Users size={16} /> {exam.className}</div>
              </div>
            </div>
            <button className="view-results-btn">عرض النتائج</button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>إضافة اختبار/مسابقة جديدة</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>اسم الاختبار/المسابقة</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>التاريخ</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="form-group full-width">
                  <label>الفصل / عام</label>
                  <input required placeholder="مثلاً: فصل الفاروق، أو عام للجميع" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">حفظ الاختبار</button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="recent-results">
        <h3>نتائج الطلاب الأخيرة</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>اسم الطالب</th>
                <th>الاختبار</th>
                <th>الدرجة</th>
                <th>التقدير</th>
                <th>المكافأة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold">أحمد محمد علي</td>
                <td>اختبار جزء عم</td>
                <td>95/100</td>
                <td><span className="grade-pill excelent">ممتاز</span></td>
                <td>مصحف + شهادة تقدير</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .exams-manager {
          background: var(--white);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow);
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .export-btn { background: #27ae60; color: white; display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 8px; font-weight: 700; }
        .print-btn { background: #7f8c8d; color: white; display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 8px; font-weight: 700; }

        .exams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin: 32px 0;
        }

        .exam-card {
          border: 2px solid var(--gray-light);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: border-color 0.2s;
        }

        .exam-card:hover { border-color: var(--accent); }

        .exam-info h3 { color: var(--primary); margin-bottom: 8px; }

        .exam-meta {
          display: flex;
          gap: 16px;
          color: #666;
          font-size: 0.9rem;
        }

        .meta-item { display: flex; align-items: center; gap: 6px; }

        .view-results-btn {
          width: 100%;
          padding: 10px;
          background: var(--gray-light);
          border-radius: 8px;
          font-weight: 700;
          color: var(--primary);
        }

        .grade-pill {
          padding: 4px 10px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.8rem;
        }

        .grade-pill.excelent { background: #e8f5e9; color: #2e7d32; }
      `}</style>
    </div>
  );
};

export default ExamsManager;
