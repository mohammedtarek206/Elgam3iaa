import React, { useState, useEffect } from 'react';
import { Briefcase, User, Phone, Fingerprint, Calendar, Check, X, Trash2, Search, FileText } from 'lucide-react';

const API_URL = '/api';

const JobApplicationsManager = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Approval Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    salary: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/job-applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      } else {
        console.error('Failed to fetch job applications');
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
      joinDate: new Date().toISOString().split('T')[0]
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
        alert('تمت الموافقة على الطلب وتعيين الموظف بنجاح');
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

  const handleReject = async (id) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/reject-job-application/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
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

  if (loading) return <div className="module-placeholder">جاري تحميل طلبات التوظيف...</div>;

  return (
    <div className="job-applications-manager fade-in" dir="rtl">
      <div className="module-header">
        <div className="header-left">
          <h2>إدارة طلبات التوظيف</h2>
          <span className="count-badge">{applications.length} طلب معلق</span>
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

      <div className="requests-grid">
        {filteredApps.map(app => (
          <div key={app._id} className="request-card job-app-card">
            <div className="request-card-header">
              <div className="user-avatar" style={{background: '#ebf5fb', color: '#2980b9'}}>
                <User size={30} />
              </div>
              <div className="user-main-info">
                <h3>{app.name}</h3>
                <span className="request-date">
                  <Calendar size={14} /> {new Date(app.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
              <div className="status-tag pending">انتظار</div>
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
              <div className="info-item full-width">
                <FileText size={16} />
                <span>المؤهل/ملاحظات: <strong>{app.notes || 'لا يوجد'}</strong></span>
              </div>
            </div>

            <div className="request-card-actions">
              <button className="approve-btn job-approve" onClick={() => handleApproveClick(app)}>
                <Check size={18} />
                موافقة وتعيين
              </button>
              <button className="reject-btn" onClick={() => handleReject(app._id)}>
                <X size={18} />
                رفض
              </button>
              <button className="delete-btn" onClick={() => handleDelete(app._id)} title="حذف نهائي">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {filteredApps.length === 0 && (
          <div className="no-requests">
            {searchTerm ? 'لا توجد نتائج تطابق البحث' : 'لا توجد طلبات توظيف جديدة حالياً'}
          </div>
        )}
      </div>

      {showApproveModal && selectedApp && (
        <div className="modal-overlay no-print">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>تعيين الموظف: {selectedApp.name}</h3>
              <button className="close-btn" onClick={() => setShowApproveModal(false)}><X size={24} /></button>
            </div>
            <div className="approval-form-body">
              <p className="approval-tip">يرجى تحديد تفاصيل التعيين لإضافته لقائمة الموظفين:</p>
              
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

              <div className="modal-actions">
                <button 
                  className="confirm-approve-btn" 
                  onClick={handleConfirmApprove} 
                  disabled={!approvalData.salary || !approvalData.joinDate}
                  style={{ background: '#27ae60' }}
                >
                  <Check size={20} />
                  إكمال التعيين
                </button>
                <button className="close-modal-btn" onClick={() => setShowApproveModal(false)}>إلغاء</button>
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
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .header-left h2 {
          color: #2c3e50;
          margin-bottom: 5px;
        }

        .count-badge {
          background: #34495e;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
        }

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
          width: 300px;
          font-family: inherit;
          transition: all 0.3s;
        }

        .search-box input:focus {
          border-color: #34495e;
          outline: none;
          width: 350px;
          box-shadow: 0 0 0 4px rgba(52, 73, 94, 0.1);
        }

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .job-app-card {
           border-top: 5px solid #34495e !important;
        }

        .request-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.3s;
          position: relative;
        }

        .request-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .request-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
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
          left: 24px;
          top: 24px;
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
          left: 24px;
          top: 54px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
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

        .full-width {
          grid-column: 1 / -1;
        }

        .request-card-actions {
          display: flex;
          gap: 10px;
        }

        .approve-btn, .reject-btn, .delete-btn {
          padding: 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }

        .job-approve {
          flex: 2;
          background: #ebf9f1;
          color: #27ae60;
        }

        .job-approve:hover {
          background: #27ae60;
          color: white;
        }

        .reject-btn {
          flex: 1;
          background: #fdedec;
          color: #e74c3c;
        }

        .reject-btn:hover {
          background: #e74c3c;
          color: white;
        }

        .delete-btn {
          background: #f4f6f7;
          color: #7f8c8d;
          padding: 10px 15px;
        }

        .delete-btn:hover {
          background: #7f8c8d;
          color: white;
        }

        .no-requests {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px;
          color: #95a5a6;
          font-size: 1.2rem;
          background: white;
          border-radius: 20px;
          border: 2px dashed #ddd;
        }

        @media (max-width: 600px) {
          .module-header {
            flex-direction: column;
            align-items: stretch;
          }
          .search-box input {
            width: 100%;
          }
          .search-box input:focus {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default JobApplicationsManager;
