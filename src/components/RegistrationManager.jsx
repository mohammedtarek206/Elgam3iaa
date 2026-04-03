import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, User, Phone, BookOpen, Calendar, Check, X, Shield, Plus, Building, Users } from 'lucide-react';

const API_URL = '/api';

const RegistrationManager = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [studentRequests, setStudentRequests] = useState([]);
  const [sheikhRequests, setSheikhRequests] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sheikhs, setSheikhs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedStudentRequest, setSelectedStudentRequest] = useState(null);
  const [showStudentApproveModal, setShowStudentApproveModal] = useState(false);
  const [studentApprovalData, setStudentApprovalData] = useState({
    className: '',
    sheikh: ''
  });

  const [selectedSheikhRequest, setSelectedSheikhRequest] = useState(null);
  const [showSheikhApproveModal, setShowSheikhApproveModal] = useState(false);
  const [sheikhApprovalData, setSheikhApprovalData] = useState({
    assignedClasses: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [studentsRes, sheikhsRes, initRes] = await Promise.all([
        fetch(`${API_URL}/admin/student-requests`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/sheikh-requests`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/init-data`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const [studentsData, sheikhsData, initData] = await Promise.all([
        studentsRes.json(),
        sheikhsRes.json(),
        initRes.json()
      ]);
      setStudentRequests(studentsData);
      setSheikhRequests(sheikhsData);
      setClasses(initData.classes || []);
      setSheikhs(initData.sheikhs || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentApprove = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/approve-student/${selectedStudentRequest._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(studentApprovalData)
      });
      if (res.ok) {
        alert('تم قبول الطالب بنجاح ونقله لقائمة الطلاب');
        setShowStudentApproveModal(false);
        fetchData(); // Refresh all
      } else {
        const data = await res.json();
        alert(data.message || 'خطأ في عملية القبول');
      }
    } catch (err) {
      alert('خطأ في الاتصال بالسيرفر');
    }
  };

  const handleSheikhApprove = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/approve-sheikh/${selectedSheikhRequest._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(sheikhApprovalData)
      });
      if (res.ok) {
        alert('تم قبول المحفظ وتسكينه بنجاح');
        setShowSheikhApproveModal(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'خطأ في عملية القبول');
      }
    } catch (err) {
      alert('خطأ في الاتصال بالسيرفر');
    }
  };

  const handleReject = async (id, type) => {
    if (!window.confirm('هل أنت متأكد من رفض وحذف هذا الطلب؟')) return;
    const token = localStorage.getItem('token');
    const endpoint = type === 'student' ? `/admin/reject-student/${id}` : `/admin/reject-sheikh/${id}`;

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) { }
  };

  if (loading) return <div className="module-placeholder">جاري تحميل الطلبات...</div>;

  return (
    <div className="registration-manager fade-in" dir="rtl">
      <div className="module-header">
        <div className="header-left">
          <h2>طلبات الالتحاق الجديدة</h2>
          <span className="count-badge">{(activeTab === 'students' ? (studentRequests || []) : (sheikhRequests || [])).length} طلب معلق</span>
        </div>
      </div>

      <div className="finance-tabs">
        <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
          <BookOpen size={18} /> طلبات الطلاب
        </button>
        <button className={activeTab === 'sheikhs' ? 'active' : ''} onClick={() => setActiveTab('sheikhs')}>
          <UserCheck size={18} /> طلبات المحفظين
        </button>
      </div>

      <div className="tab-container">
        {activeTab === 'students' && (
          <div className="requests-grid">
            {studentRequests.map(req => (
              <div key={req._id} className="request-card">
                <div className="request-card-header">
                  <div className="user-avatar">
                    <User size={30} />
                  </div>
                  <div className="user-main-info">
                    <h3>{req.name}</h3>
                    <span className="request-date"><Calendar size={14} /> {req.requestDate}</span>
                  </div>
                  <div className="status-tag pending">انتظار</div>
                  <div className="type-tag new-student">طالب جديد</div>
                </div>

                <div className="request-card-body">
                  <div className="info-item">
                    <Phone size={16} />
                    <span>هاتف الطالب: <strong>{req.phone || '---'}</strong></span>
                  </div>
                  <div className="info-item">
                    <Phone size={16} />
                    <span>هاتف ولي الأمر: <strong>{req.parentPhone}</strong></span>
                  </div>
                  <div className="info-item">
                    <BookOpen size={16} />
                    <span>المستوى: <strong>{req.level}</strong></span>
                  </div>
                  <div className="info-item">
                    <Shield size={16} />
                    <span>الرقم القومي: <strong>{req.nationalId}</strong></span>
                  </div>
                  {req.socialStatus && (
                    <div className="info-item">
                      <span className="social-badge">{req.socialStatus}</span>
                    </div>
                  )}
                </div>

                <div className="request-card-actions">
                  <button className="approve-btn" onClick={() => {
                    setSelectedStudentRequest(req);
                    setShowStudentApproveModal(true);
                  }}>
                    <UserCheck size={18} />
                    قبول وتسكين
                  </button>
                  <button className="reject-btn" onClick={() => handleReject(req._id, 'student')}>
                    <UserX size={18} />
                    رفض وحذف
                  </button>
                </div>
              </div>
            ))}
            {studentRequests.length === 0 && (
              <div className="no-requests"> لا توجد طلبات طلاب جديدة حالياً </div>
            )}
          </div>
        )}

        {activeTab === 'sheikhs' && (
          <div className="requests-grid">
            {sheikhRequests.map(req => (
              <div key={req._id} className="request-card">
                <div className="request-card-header">
                  <div className="user-avatar" style={{ background: '#fef5e7', color: '#d35400' }}>
                    <User size={30} />
                  </div>
                  <div className="user-main-info">
                    <h3>{req.name}</h3>
                    <span className="request-date"><Calendar size={14} /> {req.requestDate}</span>
                  </div>
                  <div className="status-tag pending">انتظار</div>
                  <div className="type-tag new-student" style={{ background: '#fef5e7', color: '#d35400', borderColor: '#d35400' }}>محفظ جديد</div>
                </div>

                <div className="request-card-body">
                  <div className="info-item">
                    <Phone size={16} />
                    <span>هاتف المحفظ: <strong>{req.phone}</strong></span>
                  </div>
                  <div className="info-item">
                    <BookOpen size={16} />
                    <span>المؤهل: <strong>{req.qualification}</strong></span>
                  </div>
                  <div className="info-item">
                    <Shield size={16} />
                    <span>الرقم القومي: <strong>{req.nationalId}</strong></span>
                  </div>
                  <div className="info-item full-width">
                    <Building size={16} />
                    <span>العنوان: <strong>{req.address}</strong></span>
                  </div>
                </div>

                <div className="request-card-actions">
                  <button className="approve-btn sheikh-approve" onClick={() => {
                    setSelectedSheikhRequest(req);
                    setShowSheikhApproveModal(true);
                  }}>
                    <UserCheck size={18} />
                    موافقة و تعيين
                  </button>
                  <button className="reject-btn" onClick={() => handleReject(req._id, 'sheikh')}>
                    <UserX size={18} />
                    رفض وحذف
                  </button>
                </div>
              </div>
            ))}
            {sheikhRequests.length === 0 && (
              <div className="no-requests"> لا توجد طلبات محفظين جديدة حالياً </div>
            )}
          </div>
        )}
      </div>

      {showStudentApproveModal && selectedStudentRequest && (
        <div className="modal-overlay no-print">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>قبول الطالب: {selectedStudentRequest.name}</h3>
              <button className="close-btn" onClick={() => setShowStudentApproveModal(false)}><X size={24} /></button>
            </div>
            <div className="approval-form-body">
              <p className="approval-tip">يرجى تحديد الفصل والمحفظ المسؤول عن الطالب قبل القبول النهائي:</p>

              <div className="approval-input-group">
                <label><Building size={18} /> تحديد الفصل</label>
                <select
                  required
                  value={studentApprovalData.className}
                  onChange={e => setStudentApprovalData({ ...studentApprovalData, className: e.target.value })}
                >
                  <option value="">-- اختر الفصل --</option>
                  {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="approval-input-group">
                <label><Users size={18} /> تحديد المحفظ المسؤول</label>
                <select
                  required
                  value={studentApprovalData.sheikh}
                  onChange={e => setStudentApprovalData({ ...studentApprovalData, sheikh: e.target.value })}
                >
                  <option value="">-- اختر المحفظ --</option>
                  {sheikhs.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div className="modal-actions">
                <button className="confirm-approve-btn" onClick={handleStudentApprove} disabled={!studentApprovalData.className || !studentApprovalData.sheikh}>
                  <Check size={20} />
                  إكمال القبول والتسكين
                </button>
                <button className="close-modal-btn" onClick={() => setShowStudentApproveModal(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSheikhApproveModal && selectedSheikhRequest && (
        <div className="modal-overlay no-print">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3 style={{ color: '#d35400' }}>تعيين المحفظ: {selectedSheikhRequest.name}</h3>
              <button className="close-btn" onClick={() => setShowSheikhApproveModal(false)}><X size={24} /></button>
            </div>
            <div className="approval-form-body">
              <p className="approval-tip">يجب إسناد المحفظ لفصل واحد على الأقل ليتم تسجيله بنجاح ضمن هيئة التدريس:</p>

              <div className="approval-input-group">
                <label><Building size={18} /> إسناد إلى فصول (يمكن اختيار أكثر من فصل)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  {classes.map(c => (
                    <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={sheikhApprovalData.assignedClasses && sheikhApprovalData.assignedClasses.includes(c.name)}
                        onChange={(e) => {
                          const newClasses = e.target.checked 
                            ? [...(sheikhApprovalData.assignedClasses || []), c.name]
                            : (sheikhApprovalData.assignedClasses || []).filter(name => name !== c.name);
                          setSheikhApprovalData({...sheikhApprovalData, assignedClasses: newClasses});
                        }} 
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button className="confirm-approve-btn sheikh-approve-submit" onClick={handleSheikhApprove} disabled={!sheikhApprovalData.assignedClasses || sheikhApprovalData.assignedClasses.length === 0}>
                  <Check size={20} />
                  تعيين وإسناد
                </button>
                <button className="close-modal-btn" onClick={() => setShowSheikhApproveModal(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .registration-manager {
          padding: 20px;
        }

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          margin-top: 24px;
        }

        .request-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          padding: 24px;
          border-top: 5px solid #f39c12;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.3s;
        }

        .request-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .request-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .user-avatar {
          width: 50px;
          height: 50px;
          background: #f8f9fa;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #95a5a6;
        }

        .user-main-info h3 {
          font-size: 1.1rem;
          color: #2c3e50;
          margin: 0;
        }

        .request-date {
          font-size: 0.8rem;
          color: #95a5a6;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .status-tag {
          position: absolute;
          left: 0;
          top: 0;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .status-tag.pending {
          background: #fef9e7;
          color: #f39c12;
        }

        .type-tag {
          position: absolute;
          left: 0;
          top: 30px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .type-tag.new-student {
          background: #e8f5e9;
          color: #27ae60;
          border: 1px solid #27ae60;
        }

        .request-card-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 12px 0;
          border-top: 1px solid #f8f9fa;
          border-bottom: 1px solid #f8f9fa;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          color: #555;
        }

        .social-badge {
          background: #fdedec;
          color: #e74c3c;
          padding: 4px 15px;
          border-radius: 15px;
          font-size: 0.85rem;
          font-weight: 800;
          border: 1px solid #e74c3c;
        }

        .request-card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .approve-btn, .reject-btn {
          padding: 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .approve-btn {
          background: #ebf9f1;
          color: #27ae60;
        }

        .approve-btn:hover {
          background: #27ae60;
          color: white;
        }

        .reject-btn {
          background: #fdedec;
          color: #e74c3c;
        }

        .reject-btn:hover {
          background: #e74c3c;
          color: white;
        }

        .no-requests {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px;
          color: #95a5a6;
          font-size: 1.2rem;
          background: #f8f9fa;
          border-radius: 20px;
          border: 2px dashed #ddd;
        }

        /* Modal specific styles */
        .approval-form-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 10px 0;
        }

        .approval-tip {
          color: #7f8c8d;
          font-weight: 600;
        }

        .approval-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .approval-input-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          color: #2c3e50;
        }

        .approval-input-group select {
          padding: 12px;
          border: 2px solid #ecf0f1;
          border-radius: 12px;
          font-family: inherit;
          font-size: 1rem;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .confirm-approve-btn {
          background: #27ae60;
          color: white;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .confirm-approve-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .finance-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          margin-bottom: 24px;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--gray-light);
        }

        .finance-tabs button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 700;
          color: #666;
          white-space: nowrap;
          border: none;
          background: transparent;
          cursor: pointer;
        }

        .finance-tabs button.active {
          background: var(--primary);
          color: var(--white);
        }

        .sheikh-approve {
          background: #fef5e7;
          color: #d35400;
        }

        .sheikh-approve:hover {
          background: #d35400;
          color: white;
        }

        .sheikh-approve-submit {
          background: #d35400;
        }

        .sheikh-approve-submit:disabled {
          background: #ccc;
        }

        .close-modal-btn {
          background: #eee;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default RegistrationManager;
