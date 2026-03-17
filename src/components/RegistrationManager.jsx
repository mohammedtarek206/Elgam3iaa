import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, User, Phone, BookOpen, Calendar, Check, X, Shield, Plus, Building, Users } from 'lucide-react';

const API_URL = '/api';

const RegistrationManager = () => {
  const [requests, setRequests] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sheikhs, setSheikhs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  
  const [approvalData, setApprovalData] = useState({
    className: '',
    sheikh: ''
  });

  useEffect(() => {
    fetchRequests();
    fetchInitData();
  }, []);

  const fetchRequests = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/student-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitData = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/init-data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setClasses(data.classes || []);
      setSheikhs(data.sheikhs || []);
    } catch (err) {}
  };

  const handleApprove = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/approve-student/${selectedRequest._id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(approvalData)
      });
      if (res.ok) {
        alert('تم قبول الطالب بنجاح ونقله لقائمة الطلاب');
        setShowApproveModal(false);
        fetchRequests();
      } else {
        const data = await res.json();
        alert(data.message || 'خطأ في عملية القبول');
      }
    } catch (err) {
      alert('خطأ في الاتصال بالسيرفر');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('هل أنت متأكد من رفض وحذف هذا الطلب؟')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/reject-student/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {}
  };

  if (loading) return <div className="module-placeholder">جاري تحميل الطلبات...</div>;

  return (
    <div className="registration-manager fade-in" dir="rtl">
      <div className="module-header">
        <div className="header-left">
          <h2>طلبات الالتحاق الجديدة</h2>
          <span className="count-badge">{requests.length} طلب معلق</span>
        </div>
      </div>

      <div className="requests-grid">
        {requests.map(req => (
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
                setSelectedRequest(req);
                setShowApproveModal(true);
              }}>
                <UserCheck size={18} />
                قبول وتسكين
              </button>
              <button className="reject-btn" onClick={() => handleReject(req._id)}>
                <UserX size={18} />
                رفض وحذف
              </button>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="no-requests"> لا توجد طلبات التحاق جديدة حالياً </div>
        )}
      </div>

      {showApproveModal && (
        <div className="modal-overlay no-print">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>قبول الطالب: {selectedRequest.name}</h3>
              <button className="close-btn" onClick={() => setShowApproveModal(false)}><X size={24} /></button>
            </div>
            <div className="approval-form-body">
              <p className="approval-tip">يرجى تحديد الفصل والمحفظ المسؤول عن الطالب قبل القبول النهائي:</p>
              
              <div className="approval-input-group">
                <label><Building size={18} /> تحديد الفصل</label>
                <select 
                  required 
                  value={approvalData.className} 
                  onChange={e => setApprovalData({...approvalData, className: e.target.value})}
                >
                  <option value="">-- اختر الفصل --</option>
                  {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="approval-input-group">
                <label><Users size={18} /> تحديد المحفظ المسؤول</label>
                <select 
                  required 
                  value={approvalData.sheikh} 
                  onChange={e => setApprovalData({...approvalData, sheikh: e.target.value})}
                >
                  <option value="">-- اختر المحفظ --</option>
                  {sheikhs.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div className="modal-actions">
                <button className="confirm-approve-btn" onClick={handleApprove} disabled={!approvalData.className || !approvalData.sheikh}>
                  <Check size={20} />
                  إكمال القبول والتسكين
                </button>
                <button className="close-modal-btn" onClick={() => setShowApproveModal(false)}>إلغاء</button>
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

        .close-modal-btn {
          background: #eee;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default RegistrationManager;
