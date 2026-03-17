import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, User, DollarSign, Award, AlertTriangle, Users as UsersIcon, FileDown, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_URL = '/api';

const SheikhManager = () => {
  const [sheikhs, setSheikhs] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const [user] = useState(() => JSON.parse(localStorage.getItem('user')) || { role: 'admin' });

  useEffect(() => {
    fetchData();
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/attendance`, { headers: { 'Authorization': `Bearer ${token}` } });
      setAttendanceHistory(await res.json());
    } catch (err) {}
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [sheikhRes, classRes, studRes] = await Promise.all([
        fetch(`${API_URL}/sheikhs`, { headers }),
        fetch(`${API_URL}/classes`, { headers }),
        fetch(`${API_URL}/students`, { headers })
      ]);
      const [sheikhData, classData, studData] = await Promise.all([
        sheikhRes.json(),
        classRes.json(),
        studRes.json()
      ]);
      setSheikhs(sheikhData);
      setClasses(classData);
      setStudents(studData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [editingSheikh, setEditingSheikh] = useState(null);
  const [viewingSheikh, setViewingSheikh] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    assignedClasses: [],
    hireDate: new Date().toISOString().split('T')[0],
    salary: '',
    qualification: '',
    notes: ''
  });

  const handleOpenForm = (sheikh = null) => {
    if (sheikh) {
      setEditingSheikh(sheikh);
      setFormData(sheikh);
    } else {
      setEditingSheikh(null);
      setFormData({
        name: '',
        phone: '',
        address: '',
        assignedClasses: [],
        hireDate: new Date().toISOString().split('T')[0],
        salary: '',
        notes: ''
      });
    }
    setShowForm(true);
  };

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const method = editingSheikh ? 'PUT' : 'POST';
    const url = editingSheikh ? `${API_URL}/sheikhs/${editingSheikh._id}` : `${API_URL}/sheikhs`;
    
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
        alert(editingSheikh ? 'تم التعديل بنجاح' : 'تم إضافة الشيخ بنجاح');
      } else {
        const errData = await res.json();
        alert(`خطأ من السيرفر: ${errData.message || 'فشل الحفظ'}`);
      }
    } catch (err) {
      console.error('Error saving sheikh:', err);
      alert('لا يمكن الاتصال بالسيرفر! يرجى التأكد من أنك مسجل الدخول.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الشيخ؟')) {
      const token = localStorage.getItem('token');
      try {
        await fetch(`${API_URL}/sheikhs/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchData();
      } catch (err) {
        console.error('Error deleting sheikh:', err);
      }
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredSheikhs.map(s => {
      const count = students.filter(student => student.sheikh === s.name).length;
      return {
        'الاسم': s.name,
        'الهاتف': s.phone,
        'الفصول': (s.assignedClasses || []).join(', '),
        'تاريخ التعيين': s.hireDate,
        'الراتب': s.salary,
        'عدد الطلاب': count
      };
    });
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheikhs");
    XLSX.writeFile(wb, "الشيوخ.xlsx");
  };

  const filteredSheikhs = sheikhs.filter(s => 
    s.name.includes(searchTerm) || 
    s.phone.includes(searchTerm) ||
    (s.assignedClasses && s.assignedClasses.some(className => className.includes(searchTerm)))
  );

  const renderProfile = (sheikh) => {
    const sheikhStudents = students.filter(s => s.sheikh === sheikh.name);
    
    return (
      <div className="modal-overlay">
        <div className="modal-content profile-content fade-in">
          <div className="modal-header">
            <h3>صفحة {sheikh.name}</h3>
            <button className="close-btn" onClick={() => setViewingSheikh(null)}><X size={24} /></button>
          </div>
          
          <div className="profile-grid">
            <div className="profile-stat-card">
              <UsersIcon size={32} color="#3498db" />
              <div className="stat-info">
                <span>عدد الطلاب</span>
                <strong>{sheikhStudents.length} طالب</strong>
              </div>
            </div>
            <div className="profile-stat-card">
              <Check size={32} color="#2ecc71" />
              <div className="stat-info">
                <span>نسبة الحضور</span>
                <strong>{(() => {
                  const totalDays = attendanceHistory.filter(h => h.attendanceType === 'sheikh' && h.records.some(r => r.personId === sheikh._id)).length;
                  if (totalDays === 0) return '0%';
                  const presentDays = attendanceHistory.filter(h => h.attendanceType === 'sheikh' && h.records.some(r => r.personId === sheikh._id && (r.status === 'present' || r.status === 'late'))).length;
                  return Math.round((presentDays / totalDays) * 100) + '%';
                })()}</strong>
              </div>
            </div>
            <div className="profile-stat-card">
              <DollarSign size={32} color="#2ecc71" />
              <div className="stat-info">
                <span>الراتب</span>
                <strong>{sheikh.salary} ج.م</strong>
              </div>
            </div>
          </div>
  
          <div className="profile-tabs">
            <div className="tab-header">
              <button className="active">الطلاب التابعين</button>
              <button>المكافآت والجزاءات</button>
              <button>الحضور والغياب</button>
            </div>
            <div className="tab-content">
              <div className="mini-table">
                <table>
                  <thead>
                    <tr>
                      <th>اسم الطالب</th>
                      <th>المستوى</th>
                      <th>الفصل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sheikhStudents.map(s => (
                      <tr key={s._id}>
                        <td>{s.name}</td>
                        <td>{s.level}</td>
                        <td>{s.className}</td>
                      </tr>
                    ))}
                    {sheikhStudents.length === 0 && (
                      <tr><td colSpan="3" style={{textAlign:'center'}}>لا يوجد طلاب لهذا الشيخ</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="sheikh-manager">
      <div className="module-header no-print">
        <div className="header-left">
          <h2>إدارة الشيوخ</h2>
          <span className="count-badge">{sheikhs.length} محفظ</span>
        </div>
        <div className="header-actions">
          <button className="add-btn" onClick={() => handleOpenForm()}>
            <Plus size={20} />
            إضافة شيخ جديد
          </button>
          <button className="export-btn" onClick={exportToExcel} title="تصدير إلى إكسيل">
            <FileDown size={20} />
            تصدير
          </button>
          <button className="print-btn" onClick={() => window.print()} title="طباعة">
            <Printer size={20} />
            طباعة
          </button>
        </div>
      </div>

      <div className="search-bar no-print">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="بحث عن شيخ بالاسم أو الرقم..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
               <th>#</th>
               <th>اسم الشيخ</th>
               <th>المستوى/الإجازة</th>
               <th>الرقم القومي</th>
              <th>رقم الهاتف</th>
              <th>الفصول المسؤولة عنها</th>
              <th>تاريخ التعيين</th>
              <th>عدد الطلاب</th>
              <th className="no-print">الالتحكم</th>
            </tr>
          </thead>
          <tbody>
            {filteredSheikhs.map((sheikh, index) => (
              <tr key={sheikh._id}>
                <td>{index + 1}</td>
                <td className="font-bold flex-cell" onClick={() => setViewingSheikh(sheikh)}>
                  <User size={18} className="user-icon" />
                   {sheikh.name}
                </td>
                <td className="text-primary font-bold">{sheikh.qualification || '---'}</td>
                <td>{sheikh.nationalId || '---'}</td>
                <td>{sheikh.phone}</td>
                <td>
                  <div className="tag-list">
                    {(sheikh.assignedClasses || []).map((c, i) => (
                      <span key={i} className="class-tag">{c}</span>
                    ))}
                  </div>
                </td>
                <td>{sheikh.hireDate}</td>
                <td>{students.filter(s => s.sheikh === sheikh.name).length}</td>
                <td className="actions no-print">
                  <button className="edit-btn" onClick={() => handleOpenForm(sheikh)}><Edit2 size={18} /></button>
                  {user.role === 'admin' && (
                    <button className="delete-btn" onClick={() => handleDelete(sheikh._id)}><Trash2 size={18} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay no-print">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>{editingSheikh ? 'تعديل بيانات شيخ' : 'إضافة شيخ جديد'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>اسم الشيخ</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>الرقم القومي</label>
                  <input value={formData.nationalId} onChange={e => setFormData({...formData, nationalId: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>المستوى التعليمي / الإجازة</label>
                  <input placeholder="مثلاً: لسانس أصول دين / إجازة حفص" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>رقم الهاتف</label>
                  <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group full-width">
                  <label>العنوان</label>
                  <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                 <div className="form-group full-width">
                  <label>الفصول المسؤول عنها (اختر واحد أو أكثر)</label>
                  <div className="checkbox-group">
                    {classes.map(c => (
                      <label key={c._id} className="checkbox-item">
                        <input 
                          type="checkbox" 
                          checked={formData.assignedClasses && formData.assignedClasses.includes(c.name)}
                          onChange={(e) => {
                            const newClasses = e.target.checked 
                              ? [...(formData.assignedClasses || []), c.name]
                              : (formData.assignedClasses || []).filter(name => name !== c.name);
                            setFormData({...formData, assignedClasses: newClasses});
                          }} 
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>تاريخ التعيين</label>
                  <input type="date" value={formData.hireDate} onChange={e => setFormData({...formData, hireDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>الراتب أو المكافأة</label>
                  <input type="number" required value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
                </div>
              </div>
              <div className="form-group full-width" style={{marginTop: '20px'}}>
                <label>ملاحظات</label>
                <textarea rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={saving}>
                  {saving ? 'جاري الحفظ...' : (editingSheikh ? 'حفظ التعديلات' : 'إضافة الشيخ')}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingSheikh && renderProfile(viewingSheikh)}

      <style>{`
        .checkbox-group {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.95rem;
        }
        .tag-list { display: flex; flex-wrap: wrap; gap: 4px; }
        .class-tag { 
          background: var(--primary-light); 
          color: var(--primary); 
          padding: 2px 8px; 
          border-radius: 4px; 
          font-size: 0.8rem;
          font-weight: 600;
        }
        .profile-content {
          max-width: 900px;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .profile-stat-card {
          background: var(--gray-light);
          padding: 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .stat-info span { font-size: 0.9rem; color: #666; }
        .stat-info strong { font-size: 1.4rem; display: block; color: var(--primary); }

        .profile-tabs {
          border: 1px solid var(--gray-light);
          border-radius: 8px;
          overflow: hidden;
        }

        .tab-header {
          display: flex;
          background: var(--gray-light);
        }

        .tab-header button {
          flex: 1;
          padding: 12px;
          font-weight: 700;
          color: #666;
        }

        .tab-header button.active {
          background: var(--white);
          color: var(--primary);
          border-top: 3px solid var(--accent);
        }

        .tab-content {
          padding: 20px;
        }

        .mini-table table {
          font-size: 0.9rem;
        }

        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-left: 4px;
        }

        .status-dot.green { background: #2ecc71; }
      `}</style>
    </div>
  );
};

export default SheikhManager;
