import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, Briefcase, Phone, Fingerprint, Calendar, FileText, User } from 'lucide-react';

const API_URL = '/api';

const EmployeeManager = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    phone: '',
    jobType: '',
    salary: '',
    joinDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        ...employee,
        salary: employee.salary.toString()
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        nationalId: '',
        phone: '',
        jobType: '',
        salary: '',
        joinDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const method = editingEmployee ? 'PUT' : 'POST';
    const url = editingEmployee ? `${API_URL}/employees/${editingEmployee._id}` : `${API_URL}/employees`;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          salary: Number(formData.salary)
        })
      });

      if (res.ok) {
        fetchEmployees();
        setShowForm(false);
        alert(editingEmployee ? 'تم تعديل بيانات الموظف بنجاح' : 'تم إضافة الموظف بنجاح');
      } else {
        const data = await res.json();
        alert(data.message || 'حدث خطأ أثناء الحفظ');
      }
    } catch (err) {
      alert('خطأ في الاتصال بالسيرفر');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchEmployees();
      }
    } catch (err) {
      alert('خطأ في الاتصال بالسيرفر');
    }
  };

  const handleToggleActive = async (employee) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/employees/${employee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !employee.isActive })
      });
      if (res.ok) {
        fetchEmployees();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.nationalId.includes(searchTerm);
    const matchesFilter = jobTypeFilter === '' || emp.jobType === jobTypeFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="module-placeholder">جاري تحميل بيانات الموظفين...</div>;

  return (
    <div className="employee-manager fade-in" dir="rtl">
      <div className="module-header">
        <div className="header-left">
          <h2>إدارة الموظفين</h2>
          <span className="count-badge">{employees.length} موظف</span>
        </div>
        <div className="header-actions">
          <button className="add-btn" onClick={() => handleOpenForm()}>
            <Plus size={20} />
            إضافة موظف جديد
          </button>
        </div>
      </div>

      <div className="search-bar">
        <div className="filter-group">
          <select 
            className="filter-select"
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
          >
            <option value="">جميع الوظائف</option>
            <option value="عامل نظافة">عامل نظافة</option>
            <option value="مشرف حلقات">مشرف حلقات</option>
            <option value="إداري">إداري</option>
          </select>
        </div>
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="بحث بالاسم أو الرقم القومي..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>اسم الموظف</th>
              <th>نوع الوظيفة</th>
              <th>الرقم القومي</th>
              <th>رقم الهاتف</th>
              <th>الراتب</th>
              <th>تاريخ التعيين</th>
              <th>الحالة</th>
              <th className="no-print">العمليات</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? filteredEmployees.map((emp, index) => (
              <tr key={emp._id}>
                <td>{index + 1}</td>
                <td className="font-bold">{emp.name}</td>
                <td><span className="job-type-badge">{emp.jobType}</span></td>
                <td>{emp.nationalId}</td>
                <td>{emp.phone}</td>
                <td className="font-bold">{emp.salary} ج.م</td>
                <td>{emp.joinDate}</td>
                <td>
                  <span 
                    className={`status-chip ${emp.isActive ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleActive(emp)}
                    style={{ cursor: 'pointer' }}
                  >
                    {emp.isActive ? 'نشط' : 'متوقف'}
                  </span>
                </td>
                <td className="actions no-print">
                  <button className="edit-btn" onClick={() => handleOpenForm(emp)}><Edit2 size={18} /></button>
                  <button className="delete-btn" onClick={() => handleDelete(emp._id)}><Trash2 size={18} /></button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="9" style={{textAlign: 'center', padding: '20px'}}>لا يوجد موظفين مطابقين للبحث</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay no-print">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>{editingEmployee ? 'تعديل بيانات موظف' : 'إضافة موظف جديد'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label><User size={16} /> اسم الموظف</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label><Fingerprint size={16} /> الرقم القومي</label>
                  <input required maxLength="14" minLength="14" value={formData.nationalId} onChange={e => setFormData({...formData, nationalId: e.target.value.replace(/\D/g, '')})} />
                </div>
                <div className="form-group">
                  <label><Phone size={16} /> رقم الهاتف</label>
                  <input required maxLength="11" minLength="11" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} />
                </div>
                <div className="form-group">
                  <label><Briefcase size={16} /> نوع الوظيفة</label>
                  <select required value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value})}>
                    <option value="">اختر الوظيفة...</option>
                    <option value="عامل نظافة">عامل نظافة</option>
                    <option value="مشرف حلقات">مشرف حلقات</option>
                    <option value="إداري">إداري</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>الراتب الشهري</label>
                  <input type="number" required value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
                </div>
                <div className="form-group">
                  <label><Calendar size={16} /> تاريخ التعيين</label>
                  <input type="date" required value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} />
                </div>
              </div>
              <div className="form-group full-width">
                <label><FileText size={16} /> ملاحظات</label>
                <textarea rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={saving}>
                  {saving ? 'جاري الحفظ...' : (editingEmployee ? 'حفظ التعديلات' : 'إضافة الموظف')}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .employee-manager {
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .job-type-badge {
          background: #ebf5fb;
          color: #2980b9;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          border: 1px solid #2980b9;
        }

        .search-bar {
          display: flex;
          gap: 15px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .filter-group {
          min-width: 200px;
        }

        .search-input-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          right: 12px;
          color: #94a3b8;
        }

        .search-input-wrapper input {
          width: 100%;
          padding: 10px 40px 10px 15px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.2s;
        }

        .search-input-wrapper input:focus {
          border-color: #3498db;
        }

        .filter-select {
          width: 100%;
          padding: 10px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          outline: none;
        }

        .status-chip {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .status-chip.active {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-chip.inactive {
          background: #ffebee;
          color: #c62828;
        }
      `}</style>
    </div>
  );
};

export default EmployeeManager;
