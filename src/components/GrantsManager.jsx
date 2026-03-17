import React, { useState, useEffect } from 'react';
import { Gift, Heart, ShieldCheck, Plus, Search, User, X, FileDown, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_URL = '/api';

const GrantsManager = () => {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // Added state for form visibility
  const [formData, setFormData] = useState({ // Added state for form data
    studentName: '',
    type: 'إعفاء من الرسوم',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    reason: ''
  });

  useEffect(() => {
    fetchGrants();
  }, []);

  const fetchGrants = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` }; // Define headers once
    try {
      const res = await fetch(`${API_URL}/grants`, { headers }); // Use headers object
      const data = await res.json();
      if (Array.isArray(data)) {
        setGrants(data);
      } else {
        console.error('API returned non-array for grants:', data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching grants:', err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/grants`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchGrants();
        setShowForm(false);
        setFormData({
          studentName: '',
          type: 'إعفاء من الرسوم',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          reason: ''
        });
      }
    } catch (err) {
      console.error('Error saving grant:', err);
    }
  };

  const exportToExcel = () => {
    const dataToExport = grants.map(g => ({
      'اسم الطالب': g.studentName,
      'نوع المنحة': g.type,
      'القيمة': g.amount,
      'التاريخ': g.date,
      'السبب': g.reason
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Grants");
    XLSX.writeFile(wb, "المنح.xlsx");
  };

  return (
    <div className="grants-manager fade-in">
      <div className="module-header no-print">
        <h2>المنح والعطاءات (دعم الطلاب)</h2>
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
            إضافة منحة جديدة
          </button>
        </div>
      </div>

      <div className="grants-grid">
        <div className="grant-type-card">
          <ShieldCheck size={40} color="#2ecc71" />
          <h3>إعفاء من الرسوم</h3>
          <p>إعفاء كلي أو جزئي للطلاب غير القادرين.</p>
        </div>
        <div className="grant-type-card">
          <Heart size={40} color="#e74c3c" />
          <h3>دعم مادي</h3>
          <p>مساعدات مالية مباشرة للحالات الإنسانية.</p>
        </div>
        <div className="grant-type-card">
          <Gift size={40} color="#f1c40f" />
          <h3>منحة حفظ</h3>
          <p>مكافآت تشجيعية للطلاب المتميزين في الحفظ.</p>
        </div>
      </div>

      <div className="recent-grants">
        <h3>سجل المنح الأخير</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>اسم الطالب</th>
                <th>نوع المنحة</th>
                <th>القيمة</th>
                <th>التاريخ</th>
                <th>السبب</th>
              </tr>
            </thead>
            <tbody>
              {grants.map(g => (
                <tr key={g._id}>
                  <td className="font-bold">{g.studentName}</td>
                  <td>{g.type}</td>
                  <td>{g.amount} ج.م</td>
                  <td>{g.date}</td>
                  <td>{g.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>إضافة منحة جديدة</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>اسم الطالب</label>
                  <input required value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>نوع المنحة</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="إعفاء من الرسوم">إعفاء من الرسوم</option>
                    <option value="دعم مادي">دعم مادي</option>
                    <option value="منحة حفظ">منحة حفظ</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>القيمة (ج.م)</label>
                  <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>التاريخ</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div className="form-group full-width" style={{marginTop: '20px'}}>
                <label>السبب / ملاحظات</label>
                <textarea rows="3" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">حفظ المنحة</button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .grants-manager {
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

        .grants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 32px 0;
        }

        .grant-type-card {
          background: var(--gray-light);
          padding: 24px;
          border-radius: 12px;
          text-align: center;
          transition: transform 0.2s;
        }

        .grant-type-card:hover { transform: translateY(-5px); }
        .grant-type-card h3 { margin: 12px 0 8px; color: var(--primary); }
        .grant-type-card p { font-size: 0.9rem; color: #666; }

        .recent-grants h3 { margin-bottom: 20px; color: var(--secondary); }
      `}</style>
    </div>
  );
};

export default GrantsManager;
