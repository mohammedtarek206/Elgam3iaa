import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Filter, 
  Search, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Send,
  X,
  Calendar,
  Mail,
  User,
  Layout,
  RefreshCw
} from 'lucide-react';

const API_URL = '/api';

const TicketManager = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/tickets?status=${filter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(data);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/tickets/${selectedTicket._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reply, status: statusUpdate })
      });
      
      if (res.ok) {
        alert('تم تحديث التذكرة بنجاح');
        fetchTickets();
        setSelectedTicket(null);
      } else {
        const data = await res.json();
        alert(data.message || 'حدث خطأ أثناء التحديث');
      }
    } catch (err) {
      alert('تعذر الاتصال بالسيرفر');
    } finally {
      setIsUpdating(false);
    }
  };

  const openTicket = (ticket) => {
    setSelectedTicket(ticket);
    setReply(ticket.reply || '');
    setStatusUpdate(ticket.status || 'Pending');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': { label: 'قيد الانتظار', class: 'pending', icon: Clock },
      'In Progress': { label: 'جاري العمل', class: 'progress', icon: RefreshCw },
      'Resolved': { label: 'تم الحل', class: 'resolved', icon: CheckCircle }
    };
    const { label, class: className, icon: Icon } = statusMap[status] || { label: status, class: '', icon: Info };
    return (
      <span className={`admin-status-badge ${className}`}>
        <Icon size={14} />
        {label}
      </span>
    );
  };

  return (
    <div className="manager-container fade-in" dir="rtl">
      <div className="manager-header">
        <div className="header-title">
          <Ticket size={32} />
          <h2>إدارة الشكاوي والمقترحات</h2>
        </div>
        
        <div className="header-filters">
          <div className="filter-group">
            <Filter size={18} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">كل الطلبات</option>
              <option value="Pending">قيد الانتظار</option>
              <option value="In Progress">جاري العمل</option>
              <option value="Resolved">تم الحل</option>
            </select>
          </div>
          <button className="refresh-btn" onClick={fetchTickets}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      <div className="tickets-grid-wrapper">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>جاري تحميل التذاكر...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} />
            <p>لا يوجد تذاكر مطابقة للفلاتر الحالية</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>رقم التذكرة</th>
                <th>النوع</th>
                <th>العنوان</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket._id}>
                  <td className="ticket-id-cell">{ticket.ticketId}</td>
                  <td>
                    <span className={`type-tag ${ticket.type}`}>
                      {ticket.type === 'Complaint' ? 'شكوى' : 'اقتراح'}
                    </span>
                  </td>
                  <td className="ticket-title-cell">{ticket.title}</td>
                  <td>{getStatusBadge(ticket.status)}</td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td>
                    <button className="view-ticket-btn" onClick={() => openTicket(ticket)}>
                      <Eye size={18} /> عرض وتحديث
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTicket && (
        <div className="modal-overlay">
          <div className="ticket-modal">
            <div className="modal-header">
              <div className="modal-title">
                <Ticket size={24} />
                <h3>تفاصيل التذكرة #{selectedTicket.ticketId}</h3>
              </div>
              <button className="close-modal" onClick={() => setSelectedTicket(null)}><X size={24} /></button>
            </div>

            <div className="modal-body">
              <div className="ticket-info-card">
                <div className="info-grid">
                  <div className="info-item">
                    <label><User size={16} /> الاسم</label>
                    <span>{selectedTicket.name || 'غير مذكور'}</span>
                  </div>
                  <div className="info-item">
                    <label><Mail size={16} /> البريد الإلكتروني</label>
                    <span className="email-span">{selectedTicket.email}</span>
                  </div>
                  <div className="info-item">
                    <label><Layout size={16} /> النوع</label>
                    <span>{selectedTicket.type === 'Complaint' ? 'شكوى' : 'اقتراح'}</span>
                  </div>
                  <div className="info-item">
                    <label><Calendar size={16} /> تاريخ الإرسال</label>
                    <span>{new Date(selectedTicket.createdAt).toLocaleString('ar-EG')}</span>
                  </div>
                </div>

                <div className="info-content">
                  <label>العنوان:</label>
                  <p className="modal-ticket-title">{selectedTicket.title}</p>
                  
                  <label>الوصف:</label>
                  <div className="modal-desc-box">
                    {selectedTicket.description}
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdate} className="admin-action-form">
                <div className="form-group">
                  <label>تحديث الحالة:</label>
                  <div className="status-selector">
                    {['Pending', 'In Progress', 'Resolved'].map(s => (
                      <button 
                        key={s}
                        type="button" 
                        className={`status-opt-btn ${s} ${statusUpdate === s ? 'active' : ''}`}
                        onClick={() => setStatusUpdate(s)}
                      >
                        {s === 'Pending' ? 'قيد الانتظار' : s === 'In Progress' ? 'جاري العمل' : 'تم الحل'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>كتابة رد للمستخدم:</label>
                  <textarea 
                    rows={4} 
                    placeholder="اكتب الرد هنا ليظهر للمستخدم في صفحة المتابعة..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  ></textarea>
                </div>

                <button type="submit" className="save-update-btn" disabled={isUpdating}>
                  {isUpdating ? <RefreshCw className="spin" size={20} /> : <><Send size={20} /> حفظ التحديث وإرسال الرد</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <AdminTicketStyles />
    </div>
  );
};

const AdminTicketStyles = () => (
  <style>{`
    .manager-container {
      padding: 0;
    }

    .manager-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 15px;
      color: #2c3e50;
    }

    .header-title h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 800;
    }

    .header-filters {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      padding: 8px 15px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .filter-group select {
      border: none;
      background: transparent;
      font-weight: 600;
      color: #475569;
      outline: none;
    }

    .refresh-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      cursor: pointer;
      color: #64748b;
      transition: all 0.2s;
    }

    .refresh-btn:hover {
      background: #f8fafc;
      color: #3498db;
    }

    .tickets-grid-wrapper {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      overflow-x: auto;
    }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
      text-align: right;
    }

    .admin-table th {
      background: #f8fafc;
      padding: 15px 20px;
      color: #64748b;
      font-weight: 700;
      font-size: 0.9rem;
      border-bottom: 2px solid #edf2f7;
    }

    .admin-table td {
      padding: 15px 20px;
      border-bottom: 1px solid #edf2f7;
      color: #1e293b;
      font-size: 0.95rem;
    }

    .ticket-id-cell {
      font-family: monospace;
      font-weight: 700;
      color: #2563eb;
    }

    .ticket-title-cell {
      max-width: 300px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 600;
    }

    .type-tag {
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
    }

    .type-tag.Complaint { background: #fee2e2; color: #dc2626; }
    .type-tag.Suggestion { background: #e0f2fe; color: #0284c7; }

    .admin-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 700;
    }

    .admin-status-badge.pending { background: #fffbeb; color: #d97706; }
    .admin-status-badge.progress { background: #eff6ff; color: #2563eb; }
    .admin-status-badge.resolved { background: #f0fdf4; color: #16a34a; }

    .view-ticket-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f1f5f9;
      color: #475569;
      border: none;
      padding: 8px 14px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-ticket-btn:hover {
      background: #2563eb;
      color: white;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .ticket-modal {
      background: white;
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }

    .modal-header {
      padding: 20px 30px;
      border-bottom: 2px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1e293b;
    }

    .modal-title h3 {
      font-weight: 800;
      margin: 0;
    }

    .close-modal {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
    }

    .modal-body {
      padding: 30px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .ticket-info-card {
      background: #f8fafc;
      border-radius: 18px;
      padding: 25px;
      border: 1px solid #e2e8f0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 20px;
    }

    .info-item label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: #94a3b8;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .info-item span {
      font-weight: 700;
      color: #334155;
    }

    .email-span {
      color: #2563eb !important;
      text-decoration: underline;
    }

    .modal-ticket-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 15px;
    }

    .modal-desc-box {
      background: white;
      padding: 15px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      line-height: 1.6;
      color: #475569;
    }

    .admin-action-form {
      display: flex;
      flex-direction: column;
      gap: 25px;
    }

    .status-selector {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 10px;
    }

    .status-opt-btn {
      padding: 12px;
      border-radius: 12px;
      border: 2px solid #f1f5f9;
      background: #f8fafc;
      color: #64748b;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .status-opt-btn.Pending.active { border-color: #d97706; background: #fffbeb; color: #d97706; }
    .status-opt-btn.In\ Progress.active { border-color: #2563eb; background: #eff6ff; color: #2563eb; }
    .status-opt-btn.Resolved.active { border-color: #16a34a; background: #f0fdf4; color: #16a34a; }

    .admin-action-form textarea {
      width: 100%;
      padding: 15px;
      border-radius: 14px;
      border: 2px solid #e2e8f0;
      outline: none;
      transition: all 0.3s;
      resize: vertical;
    }

    .admin-action-form textarea:focus {
      border-color: #3498db;
    }

    .save-update-btn {
      background: #2563eb;
      color: white;
      padding: 16px;
      border-radius: 14px;
      border: none;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .save-update-btn:hover {
      background: #1d4ed8;
      box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
    }

    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(-360deg); } }

    .loading-state, .empty-state {
      padding: 50px;
      text-align: center;
      color: #94a3b8;
    }

    .spinner {
      width: 40px; height: 40px;
      border: 4px solid #f1f5f9;
      border-top-color: #3498db;
      border-radius: 50%;
      margin: 0 auto 15px;
      animation: spin 1s linear infinite;
    }
  `}</style>
);

export default TicketManager;
