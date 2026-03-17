import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, Star, Clock, FileDown, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_URL = '/api';

const StudentManager = () => {
  const [students, setStudents] = useState(() => JSON.parse(localStorage.getItem('cache_students')) || []);
  const [sheikhs, setSheikhs] = useState(() => JSON.parse(localStorage.getItem('cache_sheikhs')) || []);
  const [classes, setClasses] = useState(() => JSON.parse(localStorage.getItem('cache_classes')) || []);
  const [loading, setLoading] = useState(!students.length);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const [user] = useState(() => JSON.parse(localStorage.getItem('user')) || { role: 'admin' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchStudentAttendance = async (studentId) => {
    const token = localStorage.getItem('token');
    try {
      // Fetch only student-type attendance
      const res = await fetch(`${API_URL}/attendance?type=student`, { headers: { 'Authorization': `Bearer ${token}` } });
      const allAtt = await res.json();
      setAttendanceHistory(allAtt);
    } catch (err) {}
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const res = await fetch(`${API_URL}/init-data`, { headers });
      const data = await res.json();
      setStudents(data.students);
      setSheikhs(data.sheikhs);
      setClasses(data.classes);
      
      // Update Cache
      localStorage.setItem('cache_students', JSON.stringify(data.students));
      localStorage.setItem('cache_sheikhs', JSON.stringify(data.sheikhs));
      localStorage.setItem('cache_classes', JSON.stringify(data.classes));
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching students:', err);
      setLoading(false);
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    sheikh: '',
    className: '',
    level: '',
    currentSurah: '',
    socialStatus: 'عادي',
    birthDate: '',
    monthlyFees: '',
    joinDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleOpenForm = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({ ...student, className: student.className || student.class });
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        phone: '',
        sheikh: '',
        className: '',
        level: '',
        currentSurah: '',
        socialStatus: 'عادي',
        birthDate: '',
        monthlyFees: '',
        joinDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
    setShowForm(true);
  };

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const method = editingStudent ? 'PUT' : 'POST';
    const url = editingStudent ? `${API_URL}/students/${editingStudent._id}` : `${API_URL}/students`;
    
    const token = localStorage.getItem('token');

    // Ensure monthlyFees is a number
    const payload = {
      ...formData,
      monthlyFees: Number(formData.monthlyFees)
    };

    try {
      console.log(`Sending ${method} request to ${url}...`);
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        fetchData();
        setShowForm(false);
        alert(editingStudent ? 'تم التعديل بنجاح' : 'تم إضافة الطالب بنجاح');
      } else {
        const errData = await res.json();
        alert(`خطأ من السيرفر: ${errData.message || 'فشل الحفظ'}`);
      }
    } catch (err) {
      console.error('Error saving student:', err);
      alert('لا يمكن الاتصال بالسيرفر! يرجى التأكد من أنك مسجل الدخول.');
    } finally {
      setSaving(false);
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredStudents.map(s => ({
      'الاسم': s.name,
      'الهاتف': s.phone,
      'الشيخ': s.sheikh,
      'الفصل': s.className || s.class,
      'المستوى': s.level,
      'الرسوم': s.monthlyFees,
      'تاريخ الاشتراك': s.joinDate
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "الطلاب.xlsx");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
      const token = localStorage.getItem('token');
      try {
        await fetch(`${API_URL}/students/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchData();
      } catch (err) {
        console.error('Error deleting student:', err);
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.phone && s.phone.includes(searchTerm))
  );

  const [viewingStudent, setViewingStudent] = useState(null);

  const handleViewProfile = (student) => {
    setViewingStudent(student);
    fetchStudentAttendance(student._id);
  };

  const renderProfile = (student) => (
    <div className="modal-overlay">
      <div className="modal-content profile-content fade-in">
        <div className="modal-header">
          <h3>ملف الطالب: {student.name}</h3>
          <button className="close-btn" onClick={() => setViewingStudent(null)}><X size={24} /></button>
        </div>
        
        <div className="profile-grid">
          <div className="profile-stat-card">
            <Check size={32} color="#2ecc71" />
            <div className="stat-info">
              <span>نسبة الحضور</span>
              <strong>{(() => {
                const totalDays = attendanceHistory.filter(h => h.attendanceType === 'student' && h.records.some(r => r.personId === student._id)).length;
                if (totalDays === 0) return '0%';
                const presentDays = attendanceHistory.filter(h => h.attendanceType === 'student' && h.records.some(r => r.personId === student._id && (r.status === 'present' || r.status === 'late'))).length;
                return Math.round((presentDays / totalDays) * 100) + '%';
              })()}</strong>
            </div>
          </div>
          <div className="profile-stat-card">
            <Star size={32} color="#f1c40f" />
            <div className="stat-info">
              <span>المستوى الحالي</span>
              <strong>{student.level}</strong>
            </div>
          </div>
          <div className="profile-stat-card">
            <Clock size={32} color="#e67e22" />
            <div className="stat-info">
              <span>آخر سورة</span>
              <strong>{student.currentSurah || 'غير محدد'}</strong>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <div className="tab-header">
            <button className="active">النتائج والاختبارات</button>
            <button>سجل الحضور</button>
            <button>الأقساط والمدفوعات</button>
          </div>
          <div className="tab-content">
            <div className="mini-table">
              <table>
                <thead>
                  <tr>
                    <th>الاختبار</th>
                    <th>التاريخ</th>
                    <th>الدرجة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>جزء عم</td>
                    <td>2026-02-10</td>
                    <td>98/100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="student-manager">
      <div className="module-header no-print">
        <div className="header-left">
          <h2>إدارة الطلاب</h2>
          <span className="count-badge">{students.length} طالب</span>
        </div>
        <div className="header-actions">
          <button className="add-btn" onClick={() => handleOpenForm()}>
            <Plus size={20} />
            إضافة طالب جديد
          </button>
          <button className="export-btn" onClick={exportToExcel} title="تصدير إلى إكسيل">
            <FileDown size={20} />
            تصدير
          </button>
          <button className="print-btn" onClick={handlePrint} title="طباعة">
            <Printer size={20} />
            طباعة
          </button>
        </div>
      </div>

      <div className="search-bar no-print">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="بحث عن طالب بالاسم أو الرقم..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>اسم الطالب</th>
              <th>رقم الهاتف</th>
              <th>الشيخ</th>
              <th>الفصل</th>
              <th>المستوى</th>
              <th>الرسوم</th>
              <th className="no-print">العمليات</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? filteredStudents.map((student, index) => (
              <tr key={student._id}>
                <td>{index + 1}</td>
                <td className="font-bold stud-link" onClick={() => handleViewProfile(student)}>{student.name}</td>
                <td>{student.phone}</td>
                <td>{student.sheikh}</td>
                <td>{student.className || student.class}</td>
                <td><span className="level-badge">{student.level}</span></td>
                <td>{student.monthlyFees} ج.م</td>
                <td className="actions no-print">
                  <button className="edit-btn" onClick={() => handleOpenForm(student)}><Edit2 size={18} /></button>
                  {user.role === 'admin' && (
                    <button className="delete-btn" onClick={() => handleDelete(student._id)}><Trash2 size={18} /></button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>لا يوجد طلاب مطابقين للبحث</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewingStudent && renderProfile(viewingStudent)}

      {showForm && (
        <div className="modal-overlay no-print">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>{editingStudent ? 'تعديل بيانات طالب' : 'إضافة طالب جديد'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>اسم الطالب</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>رقم هاتف ولي الأمر</label>
                  <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>الفصل</label>
                  <select required value={formData.className} onChange={e => setFormData({...formData, className: e.target.value, sheikh: ''})}>
                    <option value="">اختر الفصل...</option>
                    {classes.map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>الشيخ</label>
                  <select required value={formData.sheikh} onChange={e => setFormData({...formData, sheikh: e.target.value})}>
                    <option value="">اختر الشيخ...</option>
                    {sheikhs
                      .filter(s => !formData.className || (s.assignedClasses && s.assignedClasses.includes(formData.className)))
                      .map(s => (
                        <option key={s._id} value={s.name}>{s.name}</option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>المستوى (مثلاً: جزء عم)</label>
                  <input required value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>السورة الحالية</label>
                  <input value={formData.currentSurah} onChange={e => setFormData({...formData, currentSurah: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>الحالة الاجتماعية</label>
                  <select value={formData.socialStatus} onChange={e => setFormData({...formData, socialStatus: e.target.value})}>
                    <option value="عادي">عادي</option>
                    <option value="يتيم">يتيم</option>
                    <option value="غير قادر">غير قادر</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>تاريخ الميلاد</label>
                  <input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>الرسوم الشهرية</label>
                  <input type="number" required value={formData.monthlyFees} onChange={e => setFormData({...formData, monthlyFees: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>تاريخ الاشتراك</label>
                  <input type="date" value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} />
                </div>
              </div>
              <div className="form-group full-width">
                <label>ملاحظات</label>
                <textarea rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={saving}>
                  {saving ? 'جاري الحفظ...' : (editingStudent ? 'حفظ التعديلات' : 'إضافة الطالب')}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .student-manager {
          background: var(--white);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow);
        }

        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .count-badge {
          background: var(--accent);
          color: var(--white);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .add-btn, .export-btn, .print-btn {
          padding: 10px 18px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          transition: all 0.2s;
        }

        .add-btn { background: var(--accent); color: var(--white); }
        .export-btn { background: #27ae60; color: var(--white); }
        .print-btn { background: #7f8c8d; color: var(--white); }
        
        .add-btn:hover, .export-btn:hover, .print-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .search-bar {
          position: relative;
          margin-bottom: 24px;
        }

        .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }

        .search-bar input {
          width: 100%;
          padding: 12px 48px 12px 12px;
          border: 2px solid var(--gray-light);
          border-radius: 8px;
          font-size: 1rem;
        }

        .table-container {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: right;
        }

        th {
          background: var(--gray-light);
          padding: 16px;
          color: var(--secondary);
          font-weight: 800;
        }

        td {
          padding: 16px;
          border-bottom: 1px solid var(--gray-light);
        }

        .level-badge {
          background: #e1f5fe;
          color: #0277bd;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .edit-btn, .delete-btn {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .edit-btn { color: #3498db; background: #ebf5fb; }
        .edit-btn:hover { background: #d6eaf8; }
        .delete-btn { color: #e74c3c; background: #fdedec; }
        .delete-btn:hover { background: #fadbd8; }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
        }

        .modal-content {
          background: var(--white);
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: var(--radius);
          padding: 32px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .full-width { grid-column: span 2; }

        label { font-weight: 700; color: var(--secondary); }
        input, select, textarea {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-family: inherit;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 32px;
        }

        .submit-btn {
          background: var(--accent);
          color: var(--white);
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 700;
        }

        .cancel-btn {
          background: #eee;
          padding: 12px 24px;
          border-radius: 8px;
        }

        @media screen {
          .print-only { display: none; }
        }

        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .student-manager { box-shadow: none !important; padding: 0 !important; }
          table { border: 1px solid #eee; }
          th { background: #f9f9f9 !important; color: black !important; }
        }

        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr; }
          .full-width { grid-column: span 1; }
          .header-actions { flex-direction: column; gap: 5px; }
        }
      `}</style>
    </div>
  );
};

export default StudentManager;
