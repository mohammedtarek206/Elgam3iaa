import React, { useState, useEffect } from 'react';
import { Briefcase, User, Phone, Fingerprint, Calendar, Check, X, Trash2, Search, FileText, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

const API_URL = '/api';

const JobApplicationsManager = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  
  // Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    salary: '',
    joinDate: new Date().toISOString().split('T')[0],
    adminNotes: ''
  });
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/job-applications?status=${statusFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching job applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (app) => {
    setSelectedApp(app);
    setApprovalData({
      salary: '',
      joinDate: new Date().toISOString().split('T')[0],
      adminNotes: ''
    });
    setShowApproveModal(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedApp) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/approve-job-application/${selectedApp._id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(approvalData)
      });
      if (res.ok) {
        setShowApproveModal(false);
        fetchApplications();
      } else {
        const data = await res.json();
        alert(data.message || 'خطأ في عملية الموافقة');
      }
    } catch (err) {
      alert('خطأ في الاتصال بالسيرفر');
    }
  };

  const handleRejectClick = (app) => {
    setSelectedApp(app);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedApp) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/reject-job-application/${selectedApp._id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ rejectionReason })
      });
      if (res.ok) {
        setShowRejectModal(false);
        fetchApplications();
      } else {
        const data = await res.json();
        alert(data.message || 'خطأ في عملية الرفض');
      }
    } catch (err) {
      alert('خطأ في الاتصال بالسيرفر');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/job-applications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch (err) {
      alert('خطأ في الاتصال بالسيرفر');
    }
  };

  const filteredApps = applications.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.nationalId.includes(searchTerm) ||
    app.jobType.includes(searchTerm)
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'accepted': return <span className="status-tag badge-accepted"><CheckCircle size={14} /> مقبول</span>;
      case 'rejected': return <span className="status-tag badge-rejected"><XCircle size={14} /> مرفوض</span>;
      default: return <span className="status-tag badge-pending"><Clock size={14} /> انتظار</span>;
    }
  };

  if (loading && applications.length === 0) return <div className="module-placeholder">جاري تحميل طلبات التوظيف...</div>;

  return (
    <div className="job-applications-manager fade-in" dir="rtl">
      <div className="module-header">
        <div className="header-left">
          <h2>إدارة طلبات التوظيف</h2>
          <span className="count-badge">{applications.length} طلب {statusFilter === 'pending' ? 'معلق' : statusFilter === 'accepted' ? 'مقبول' : statusFilter === 'rejected' ? 'مرفوض' : ''}</span>
        </div>
        <div className="header-right">
          <div className="search-box">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="بحث بالاسم أو الرقم القومي..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="status-filter-bar">
        <button className={`filter-btn ${statusFilter === 'pending' ? 'active-pending' : ''}`} onClick={() => setStatusFilter('pending')}>⏳ قيد الانتظار</button>
        <button className={`filter-btn ${statusFilter === 'accepted' ? 'active-approved' : ''}`} onClick={() => setStatusFilter('accepted')}>✅ المقبولين</button>
        <button className={`filter-btn ${statusFilter === 'rejected' ? 'active-rejected' : ''}`} onClick={() => setStatusFilter('rejected')}>❌ المرفوضين</button>
        <button className={`filter-btn ${statusFilter === 'all' ? 'active-all' : ''}`} onClick={() => setStatusFilter('all')}>📋 الكل</button>
      </div>

      <div className="requests-grid">
        {filteredApps.map(app => (
          <div key={app._id} className={`request-card job-app-card card-${app.status}`}>
            <div className="request-card-header">
              <div className="user-avatar" style={{background: app.status === 'accepted' ? '#e8f5e9' : app.status === 'rejected' ? '#fdedec' : '#ebf5fb', color: app.status === 'accepted' ? '#27ae60' : app.status === 'rejected' ? '#e74c3c' : '#2980b9'}}>
                <User size={30} />
              </div>
              <div className="user-main-info">
                <h3>{app.name}</h3>
                <span className="request-date">
                  <Calendar size={14} /> {new Date(app.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
              {getStatusBadge(app.status)}
              <div className="type-tag job-type">{app.jobType}</div>
            </div>

            <div className="request-card-body">
              <div className="info-item">
                <Phone size={16} />
                <span>هاتف التواصل: <strong>{app.phone}</strong></span>
              </div>
              <div className="info-item">
                <Fingerprint size={16} />
                <span>الرقم القومي: <strong>{app.nationalId}</strong></span>
              </div>
              
              {app.status === 'accepted' ? (
                <div className="approval-info">
                  <div className="approval-row">💰 الراتب: <strong>{app.salary} ج.م</strong></div>
                  <div className="approval-row">📅 تاريخ البدء: <strong>{app.joinDate}</strong></div>
                  {app.adminNotes && <div className="approval-row">📝 ملاحظات: {app.adminNotes}</div>}
                </div>
              ) : app.status === 'rejected' ? (
                <div className="rejection-info">
                  <AlertCircle size={16} />
                  <span>سبب الرفض: <strong>{app.rejectionReason || 'غير محدد'}</strong></span>
                </div>
              ) : (
                <div className="info-item full-width">
                  <FileText size={16} />
                  <span>المؤهل/ملاحظات: <strong>{app.notes || 'لا يوجد'}</strong></span>
                </div>
              )}
            </div>

            <div className="request-card-actions">
              {app.status === 'pending' ? (
                <>
                  <button className="approve-btn job-approve" onClick={() => handleApproveClick(app)}>
                    <Check size={18} /> موافقة وتعيين
                  </button>
                  <button className="reject-btn" onClick={() => handleRejectClick(app)}>
                    <X size={18} /> رفض
                  </button>
                </>
              ) : (
                <button className="delete-btn full-width-btn" onClick={() => handleDelete(app._id)}>
                  <Trash2 size={18} /> حذف الطلب من السجلات
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredApps.length === 0 && (
          <div className="no-requests">
            {searchTerm ? 'لا توجد نتائج تطابق البحث' : 'لا توجد طلبات في هذه الفئة حالياً'}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedApp && (
        <div className="modal-overlay no-print">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>تعيين الموظف: {selectedApp.name}</h3>
              <button className="close-btn" onClick={() => setShowApproveModal(false)}><X size={24} /></button>
            </div>
            <div className="approval-form-body">
              <p className="approval-tip">تحديد تفاصيل الوظيفة:</p>
              
              <div className="approval-input-group">
                <label>الراتب الشهري (ج.م)</label>
                <input 
                  type="number" 
                  required 
                  placeholder="مثال: 3000"
                  value={approvalData.salary} 
                  onChange={e => setApprovalData({...approvalData, salary: e.target.value})}
                />
              </div>

              <div className="approval-input-group">
                <label>تاريخ التعيين</label>
                <input 
                  type="date" 
                  required 
                  value={approvalData.joinDate} 
                  onChange={e => setApprovalData({...approvalData, joinDate: e.target.value})}
                />
              </div>

              <div className="approval-input-group">
                <label>ملاحظات إضافية (تظهر للموظف)</label>
                <textarea 
                  placeholder="ملاحظات اختيارية..."
                  value={approvalData.adminNotes} 
                  onChange={e => setApprovalData({...approvalData, adminNotes: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="modal-actions">
                <button 
                  className="confirm-approve-btn" 
                  onClick={handleConfirmApprove} 
                  disabled={!approvalData.salary || !approvalData.joinDate}
                  style={{ background: '#27ae60' }}
                >
                  <Check size={20} /> إكمال التعيين
                </button>
                <button className="close-modal-btn" onClick={() => setShowApproveModal(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApp && (
        <div className="modal-overlay no-print">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3 style={{ color: '#e74c3c' }}>رفض طلب التوظيف</h3>
              <button className="close-btn" onClick={() => setShowRejectModal(false)}><X size={24} /></button>
            </div>
            <div className="approval-form-body">
              <p className="approval-tip">لماذا يتم رفض طلب <strong>{selectedApp.name}</strong>؟</p>
              
              <div className="approval-input-group">
                <label>سبب الرفض</label>
                <textarea 
                  placeholder="اكتب سبب الرفض ليظهر للمتقدم..."
                  value={rejectionReason} 
                  onChange={e => setRejectionReason(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="modal-actions">
                <button 
                  className="confirm-approve-btn" 
                  onClick={handleConfirmReject} 
                  disabled={!rejectionReason}
                  style={{ background: '#e74c3c' }}
                >
                  <X size={20} /> تأكيد الرفض
                </button>
                <button className="close-modal-btn" onClick={() => setShowRejectModal(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .job-applications-manager {
          padding: 20px;
        }

        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .header-left h2 {
          color: #2c3e50;
          margin-bottom: 5px;
          font-weight: 800;
        }

        .count-badge {
          background: #34495e;
          color: white;
          padding: 4px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .status-filter-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 25px;
          overflow-x: auto;
          padding-bottom: 10px;
        }

        .filter-btn {
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          border: 2px solid #ecf0f1;
          background: white;
          color: #7f8c8d;
          cursor: pointer;
          transition: all 0.3s;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-btn:hover {
          border-color: #bdc3c7;
          background: #f8f9fa;
        }

        .active-pending { border-color: #f39c12; color: #f39c12; background: #fef9e7; }
        .active-approved { border-color: #27ae60; color: #27ae60; background: #e8f5e9; }
        .active-rejected { border-color: #e74c3c; color: #e74c3c; background: #fdedec; }
        .active-all { border-color: #34495e; color: #34495e; background: #ebedef; }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-box svg {
          position: absolute;
          right: 15px;
          color: #95a5a6;
        }

        .search-box input {
          padding: 12px 45px 12px 15px;
          border: 2px solid #ecf0f1;
          border-radius: 12px;
          width: 280px;
          font-family: inherit;
          transition: all 0.3s;
        }

        .search-box input:focus {
          border-color: #34495e;
          outline: none;
          width: 320px;
          box-shadow: 0 0 0 4px rgba(52, 73, 94, 0.1);
        }

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }

        .request-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.3s;
          position: relative;
          border-top: 5px solid #34495e;
        }

        .card-accepted { border-top-color: #27ae60; }
        .card-rejected { border-top-color: #e74c3c; }
        .card-pending { border-top-color: #f39c12; }

        .request-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.1);
        }

        .request-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 55px;
          height: 55px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-main-info h3 {
          font-size: 1.15rem;
          color: #2c3e50;
          margin: 0;
          font-weight: 800;
        }

        .request-date {
          font-size: 0.85rem;
          color: #95a5a6;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .status-tag {
          position: absolute;
          left: 20px;
          top: 20px;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .badge-pending { background: #fef9e7; color: #f39c12; }
        .badge-accepted { background: #e8f5e9; color: #27ae60; }
        .badge-rejected { background: #fdedec; color: #e74c3c; }

        .type-tag {
          position: absolute;
          left: 20px;
          top: 52px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .job-type {
          background: #ebf5fb;
          color: #2980b9;
          border: 1px solid #2980b9;
        }

        .request-card-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 15px 0;
          border-top: 1px solid #f8f9fa;
          border-bottom: 1px solid #f8f9fa;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.95rem;
          color: #444;
        }

        .approval-info {
          background: #f0f7f4;
          padding: 12px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-right: 4px solid #27ae60;
        }

        .rejection-info {
          background: #fff5f5;
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #c0392b;
          border-right: 4px solid #e74c3c;
          font-size: 0.9rem;
        }

        .request-card-actions {
          display: flex;
          gap: 12px;
          margin-top: 5px;
        }

        .approve-btn, .reject-btn, .delete-btn {
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 800;
          font-size: 0.95rem;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
        }

        .job-approve {
          flex: 2;
          background: #27ae60;
          color: white;
        }

        .job-approve:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
        }

        .reject-btn {
          flex: 1;
          background: #fdedec;
          color: #e74c3c;
          border: 1px solid #facaca;
        }

        .reject-btn:hover {
          background: #e74c3c;
          color: white;
        }

        .delete-btn {
          background: #f7f9fa;
          color: #7f8c8d;
          border: 1px solid #eee;
        }

        .full-width-btn { width: 100%; }

        .delete-btn:hover {
          background: #e74c3c;
          color: white;
          border-color: #e74c3c;
        }

        .approval-input-group textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #ecf0f1;
          border-radius: 10px;
          font-family: inherit;
          font-size: 0.95rem;
          resize: none;
        }

        .approval-input-group textarea:focus {
          border-color: #3498db;
          outline: none;
        }

        .no-requests {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 20px;
          color: #95a5a6;
          font-size: 1.3rem;
          background: white;
          border-radius: 30px;
          border: 3px dashed #eee;
          font-weight: 700;
        }

        @media (max-width: 600px) {
          .module-header {
            flex-direction: column;
            align-items: stretch;
          }
          .search-box input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default JobApplicationsManager;
