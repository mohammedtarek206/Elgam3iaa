import React, { useState, useEffect } from 'react';
import { Gift, Heart, ShieldCheck, Plus, Search, User, X, FileDown, Printer, Star, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_URL = '/api';

const GrantsManager = () => {
  const [grants, setGrants] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    type: 'السداد لغير القادرين',
    amount: '',
    unit: '',
    donorName: '',
    grantingEntity: '',
    date: new Date().toISOString().split('T')[0],
    reason: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [grantsRes, initRes] = await Promise.all([
        fetch(`${API_URL}/grants`, { headers }),
        fetch(`${API_URL}/init-data`, { headers })
      ]);
      const grantsData = await grantsRes.json();
      const initData = await initRes.json();
      
      if (Array.isArray(grantsData)) setGrants(grantsData);
      if (initData && initData.students) setStudents(initData.students);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
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
        fetchData();
        setShowForm(false);
        resetForm();
      }
    } catch (err) {
      console.error('Error saving grant:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      studentName: '',
      type: 'السداد لغير القادرين',
      amount: '',
      unit: '',
      donorName: '',
      grantingEntity: '',
      date: new Date().toISOString().split('T')[0],
      reason: ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/grants/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Error deleting grant:', err);
    }
  };

  const exportToExcel = () => {
    const dataToExport = grants.map(g => ({
      'اسم الطالب': g.studentName,
      'نوع المنحة': g.type,
      'القيمة': g.amount || g.unit,
      'المتبرع': g.donorName,
      'الجهة': g.grantingEntity,
      'التاريخ': g.date,
      'السبب': g.reason
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Grants");
    XLSX.writeFile(wb, "المنح_والعطاءات.xlsx");
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
          <h3>السداد لغير القادرين</h3>
          <p>سداد الرسوم عن الطلاب المتعثرين مادياً.</p>
        </div>
        <div className="grant-type-card">
          <Heart size={40} color="#e74c3c" />
          <h3>دعم مادي</h3>
          <p>مساعدات مالية مباشرة للحالات الإنسانية.</p>
        </div>
        <div className="grant-type-card">
          <Gift size={40} color="#f1c40f" />
          <h3>دعم عيني</h3>
          <p>توزيع أدوات، ملابس، أو مواد تموينية.</p>
        </div>
        <div className="grant-type-card">
          <Star size={40} color="#3498db" />
          <h3>منحة حفظ</h3>
          <p>مكافآت التميز في حفظ القرآن الكريم.</p>
        </div>
      </div>

      <div className="recent-grants">
        <div className="section-header-flex">
          <h3>سجل المنح الأخير</h3>
          <div className="search-mini">
            <Search size={18} />
            <input 
              placeholder="بحث باسم الطالب..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>اسم الطالب</th>
                <th>نوع المنحة</th>
                <th>القيمة/الوحدة</th>
                <th>المتبرع/الجهة</th>
                <th>التاريخ</th>
                <th className="no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {(grants || []).filter(g => g && (g.studentName || g.studentId?.name || '').includes(searchTerm)).map(g => (
                <tr key={g._id}>
                  <td className="font-bold">{g.studentName || g.studentId?.name || 'طالب غير معروف'}</td>
                  <td>
                    <span className={`type-tag ${g.type === 'دعم عيني' ? 'kind' : 'money'}`}>
                      {g.type}
                    </span>
                  </td>
                  <td>{g.type === 'دعم عيني' ? (g.unit || '---') : `${g.amount || 0} ج.م`}</td>
                  <td>
                    <div className="donor-info">
                      <span>{g.donorName || '---'}</span>
                      <small>{g.grantingEntity}</small>
                    </div>
                  </td>
                  <td>{g.date}</td>
                  <td className="no-print">
                    <button className="delete-btn-table" onClick={() => handleDelete(g._id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content fade-in grants-modal">
            <div className="modal-header">
              <h3>إضافة منحة أو دعم جديد</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>اختيار الطالب</label>
                  <select 
                    required 
                    value={formData.studentId} 
                    onChange={e => {
                      const s = students.find(x => x._id === e.target.value);
                      setFormData({...formData, studentId: e.target.value, studentName: s ? s.name : ''});
                    }}
                  >
                    <option value="">-- اختر الطالب --</option>
                    {(students || []).map(s => (
                      <option key={s?._id} value={s?._id}>{s?.name} ({s?.className})</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>نوع المنحة</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="السداد لغير القادرين">السداد لغير القادرين</option>
                    <option value="دعم مادي">دعم مادي</option>
                    <option value="دعم عيني">دعم عيني</option>
                    <option value="منحة حفظ">منحة حفظ</option>
                  </select>
                </div>

                {formData.type === 'دعم عيني' ? (
                  <div className="form-group">
                    <label>الوحدة (مثل: كرتونة، حقيبة، قطعة)</label>
                    <input required placeholder="مثلاً: 2 كرتونة مواد غذائية" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>القيمة (ج.م)</label>
                    <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                  </div>
                )}

                <div className="form-group">
                  <label>اسم المتبرع (اختياري)</label>
                  <input placeholder="فاعل خير / اسم محدد" value={formData.donorName} onChange={e => setFormData({...formData, donorName: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>الجهة المانحة (اختياري)</label>
                  <input placeholder="الجمعية / جهة خارجية" value={formData.grantingEntity} onChange={e => setFormData({...formData, grantingEntity: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>التاريخ</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>

              <div className="form-group full-width" style={{marginTop: '20px'}}>
                <label>السبب / ملاحظات إضافية</label>
                <textarea rows="3" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}></textarea>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn primary">حفظ البيانات</button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .grant-type-card h3 { margin: 12px 0 8px; color: var(--primary); }
        .grant-type-card p { font-size: 0.9rem; color: #666; }

        .recent-grants h3 { margin-bottom: 20px; color: var(--secondary); }
      `}</style>
    </div>
  );
};

export default GrantsManager;
