import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Clock, MapPin, Users, FileDown, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_URL = '/api';

const ClassManager = () => {
  const [classes, setClasses] = useState([]);
  const [sheikhs, setSheikhs] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [classRes, sheikhRes, studRes, attRes] = await Promise.all([
        fetch(`${API_URL}/classes`, { headers }),
        fetch(`${API_URL}/sheikhs`, { headers }),
        fetch(`${API_URL}/students`, { headers }),
        fetch(`${API_URL}/attendance`, { headers })
      ]);
      const [classData, sheikhData, studData, attData] = await Promise.all([
        classRes.json(),
        sheikhRes.json(),
        studRes.json(),
        attRes.json()
      ]);
      setClasses(classData);
      setSheikhs(sheikhData);
      setStudents(studData);
      setAttendanceHistory(attData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    studentsCount: '',
    location: '',
    timing: ''
  });

  const handleOpenForm = (cls = null) => {
    if (cls) {
      setEditingClass(cls);
      setFormData(cls);
    } else {
      setEditingClass(null);
      setFormData({
        name: '',
        studentsCount: '',
        location: '',
        timing: ''
      });
    }
    setShowForm(true);
  };

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const method = editingClass ? 'PUT' : 'POST';
    const url = editingClass ? `${API_URL}/classes/${editingClass._id}` : `${API_URL}/classes`;
    const token = localStorage.getItem('token');

    try {
      console.log(`Sending ${method} request to ${url}...`);
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchData();
        setShowForm(false);
        alert(editingClass ? 'تم التعديل بنجاح' : 'تم إضافة الفصل بنجاح');
      } else {
        const errData = await res.json();
        alert(`خطأ من السيرفر: ${errData.message || 'فشل الحفظ'}`);
      }
    } catch (err) {
      console.error('Error saving class:', err);
      alert('لا يمكن الاتصال بالسيرفر! تأكد من تشغيل الـ Backend');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الفصل؟')) {
      const token = localStorage.getItem('token');
      try {
        await fetch(`${API_URL}/classes/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchData();
      } catch (err) {
        console.error('Error deleting class:', err);
      }
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredClasses.map(c => ({
      'اسم الفصل': c.name,
      'الشيخ': c.sheikh,
      'عدد الطلاب': c.studentsCount,
      'المكان': c.location,
      'المواعيد': c.timing
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Classes");
    XLSX.writeFile(wb, "الفصول.xlsx");
  };

  const filteredClasses = classes.filter(c => 
    c.name.includes(searchTerm)
  );

  const getSheikhsForClass = (className) => {
    return sheikhs
      .filter(s => s.assignedClasses && s.assignedClasses.includes(className))
      .map(s => s.name)
      .join('، ') || 'غير معين';
  };

  return (
    <div className="class-manager">
      <div className="module-header no-print">
        <div className="header-left">
          <h2>إدارة الفصول (حلقات التحفيظ)</h2>
          <span className="count-badge">{classes.length} حلقة</span>
        </div>
        <div className="header-actions">
          <button className="export-btn" onClick={exportToExcel} title="تصدير إلى إكسيل">
            <FileDown size={20} />
            تصدير
          </button>
          <button className="print-btn" onClick={() => window.print()} title="طباعة">
            <Printer size={20} />
            طباعة
          </button>
          <button className="add-btn" onClick={() => handleOpenForm()}>
            <Plus size={20} />
            إضافة فصل جديد
          </button>
        </div>
      </div>

      <div className="search-bar no-print">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="بحث عن فصل أو شيخ..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="class-grid">
        {filteredClasses.map(cls => (
          <div key={cls._id} className="class-card fade-in">
            <div className="card-top">
              <h3>{cls.name}</h3>
              <div className="card-actions no-print">
                <button onClick={() => handleOpenForm(cls)}><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(cls._id)} className="delete"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="card-body">
              <div className="info-row">
                <Users size={18} />
                <span>الشيخ المسؤول: <strong>{getSheikhsForClass(cls.name)}</strong></span>
              </div>
              <div className="info-row">
                <Users size={18} />
                <span>عدد الطلاب: <strong>{students.filter(s => s.className === cls.name).length}</strong></span>
              </div>
              <div className="info-row">
                <Check size={18} color="#2ecc71" />
                <span>نسبة الانضباط: <strong>{(() => {
                  const classStudents = students.filter(s => s.className === cls.name);
                  const classStudentIds = classStudents.map(s => s._id);
                  const relevantHistory = attendanceHistory.filter(h => h.attendanceType === 'student' && h.records.some(r => classStudentIds.includes(r.personId)));
                  
                  if (relevantHistory.length === 0) return '0%';
                  
                  let totalPresent = 0;
                  let totalPossible = 0;
                  
                  relevantHistory.forEach(h => {
                    const classRecords = h.records.filter(r => classStudentIds.includes(r.personId));
                    totalPresent += classRecords.filter(r => r.status === 'present' || r.status === 'late').length;
                    totalPossible += classRecords.length;
                  });
                  
                  return Math.round((totalPresent / totalPossible) * 100) + '%';
                })()}</strong></span>
              </div>
              <div className="info-row">
                <MapPin size={18} />
                <span>المكان: <strong>{cls.location}</strong></span>
              </div>
              <div className="info-row">
                <Clock size={18} />
                <span>المواعيد: <strong>{cls.timing}</strong></span>
              </div>
            </div>
            <div className="card-footer no-print">
              <button className="stats-btn" onClick={() => {
                const classStudents = students.filter(s => s.className === cls.name);
                const classStudentIds = classStudents.map(s => s._id);
                const presentCount = attendanceHistory.filter(h => h.attendanceType === 'student').reduce((acc, h) => {
                  return acc + h.records.filter(r => classStudentIds.includes(r.personId) && (r.status === 'present' || r.status === 'late')).length;
                }, 0);
                const totalCount = attendanceHistory.filter(h => h.attendanceType === 'student').reduce((acc, h) => {
                  return acc + h.records.filter(r => classStudentIds.includes(r.personId)).length;
                }, 0);
                alert(`إحصائيات الفصل (${cls.name}):\n- إجمالي الطلاب: ${classStudents.length}\n- إجمالي أيام الحضور المسجلة: ${totalCount}\n- إجمالي مرات الحضور: ${presentCount}\n- النسبة العامة: ${totalCount > 0 ? Math.round((presentCount/totalCount)*100) : 0}%`);
              }}>عرض إحصائيات متقدمة</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay no-print">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>{editingClass ? 'تعديل بيانات الفصل' : 'إضافة فصل جديد'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>اسم الفصل</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>عدد الطلاب</label>
                  <input type="number" required value={formData.studentsCount} onChange={e => setFormData({...formData, studentsCount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>المكان</label>
                  <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div className="form-group full-width">
                  <label>المواعيد (مثال: بعد المغرب)</label>
                  <input required value={formData.timing} onChange={e => setFormData({...formData, timing: e.target.value})} />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={saving}>
                  {saving ? 'جاري الحفظ...' : (editingClass ? 'حفظ التعديلات' : 'إضافة الفصل')}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .class-manager {
          padding: 20px;
        }

        .class-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }

        .class-card {
          background: var(--white);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 20px;
          border-right: 6px solid var(--accent);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--gray-light);
          padding-bottom: 10px;
        }

        .card-top h3 { color: var(--primary); font-size: 1.2rem; }

        .card-actions { display: flex; gap: 10px; }
        .card-actions button { color: #666; }
        .card-actions button.delete:hover { color: #e74c3c; }

        .info-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          color: #555;
        }

        .info-row strong { color: var(--secondary); }

        .card-footer {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px dashed #ddd;
          text-align: center;
        }
        .stats-btn {
          background: #3498db;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.9rem;
        }
        @media print {
          .no-print { display: none !important; }
          .class-manager { padding: 0 !important; }
          .class-card { border: 1px solid #eee; box-shadow: none; break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

export default ClassManager;
