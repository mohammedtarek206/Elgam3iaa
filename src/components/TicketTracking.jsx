import React, { useState } from 'react';
import { Search, Ticket, ArrowRight, Clock, CheckCircle, AlertCircle, MessageSquare, Info, RefreshCw } from 'lucide-react';

const API_URL = '/api';

const TicketTracking = ({ onBack }) => {
  const [ticketId, setTicketId] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    setLoading(true);
    setError('');
    setTicket(null);
    try {
      const res = await fetch(`${API_URL}/public/tickets/${ticketId.trim().toUpperCase()}`);
      const data = await res.json();
      
      if (res.ok) {
        setTicket(data);
      } else {
        setError(data.message || 'لم يتم العثور على طلب بهذا الرقم');
      }
    } catch (err) {
      setError('تعذر الاتصال بالسيرفر، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': { label: 'قيد الانتظار', class: 'pending' },
      'In Progress': { label: 'جاري العمل', class: 'progress' },
      'Resolved': { label: 'تم الحل', class: 'resolved' }
    };
    const { label, class: className } = statusMap[status] || { label: status, class: '' };
    return <span className={`status-badge ${className}`}>{label}</span>;
  };

  return (
    <div className="ticket-view-container fade-in" dir="rtl">
      {!ticket ? (
        <div className="search-card">
          <div className="header-icon search-icon">
            <Search size={40} />
          </div>
          <h1>متابعة الشكوى والاقتراح</h1>
          <p>أدخل الكود الخاص بك (رقم الطلب) لمتابعة حالة طلبك</p>

          <form onSubmit={handleSearch} className="search-form">
            <div className="input-group">
              <input 
                required
                type="text" 
                placeholder="مثال: T-123456"
                value={ticketId}
                onChange={e => setTicketId(e.target.value)}
              />
            </div>
            
            {error && <div className="search-error"><AlertCircle size={18} /> {error}</div>}

            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? <RefreshCw className="spin" size={20} /> : <><Search size={20} /> بحث عن الطلب</>}
            </button>
            
            <button type="button" className="back-btn-text" onClick={onBack}>
              <ArrowRight size={20} /> العودة للرئيسية
            </button>
          </form>
        </div>
      ) : (
        <div className="ticket-detail-card">
          <div className="detail-header">
            <div className="detail-title-box">
              <Ticket size={24} color="#3498db" />
              <h3>بيانات الطلب #{ticket.ticketId}</h3>
            </div>
            {getStatusBadge(ticket.status)}
          </div>

          <div className="detail-body">
            <div className="detail-section">
              <h4>العنوان</h4>
              <p className="title-text">{ticket.title}</p>
            </div>

            <div className="detail-grid">
              <div className="detail-section">
                <h4>النوع</h4>
                <p className="type-text">{ticket.type === 'Complaint' ? 'شكوى' : 'اقتراح'}</p>
              </div>
              <div className="detail-section">
                <h4>تاريخ الإرسال</h4>
                <p>{new Date(ticket.createdAt).toLocaleDateString('ar-EG')}</p>
              </div>
            </div>

            <div className="detail-section">
              <h4>الوصف</h4>
              <div className="desc-box">
                {ticket.description}
              </div>
            </div>

            <div className="detail-section admin-reply-section">
              <h4>رد الإدارة</h4>
              {ticket.reply ? (
                <div className="reply-box">
                  <MessageSquare size={18} />
                  <p>{ticket.reply}</p>
                </div>
              ) : (
                <div className="no-reply">
                  <Clock size={18} />
                  <span>لم يتم الرد بعد، طلبك قيد المراجعة.</span>
                </div>
              )}
            </div>
          </div>

          <div className="detail-footer">
            <button className="new-search-btn" onClick={() => setTicket(null)}>
              <RefreshCw size={18} /> بحث جديد
            </button>
            <button className="back-home-btn" onClick={onBack}>
              العودة للرئيسية
            </button>
          </div>
        </div>
      )}
      <TrackingStyles />
    </div>
  );
};

const TrackingStyles = () => (
  <style>{`
    .ticket-view-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
    }

    .search-card, .ticket-detail-card {
      background: white;
      width: 100%;
      max-width: 600px;
      padding: 40px;
      border-radius: 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.08);
      text-align: center;
    }

    .header-icon {
      width: 80px;
      height: 80px;
      background: #e3f2fd;
      color: #2196f3;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 24px;
      margin: 0 auto 20px;
    }

    .search-card h1 {
      color: #2c3e50;
      font-size: 1.8rem;
      font-weight: 800;
      margin-bottom: 10px;
    }

    .search-card p {
      color: #7f8c8d;
      font-size: 1rem;
      margin-bottom: 30px;
    }

    .search-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .search-form input {
      width: 100%;
      padding: 16px;
      border: 2px solid #edeff2;
      border-radius: 14px;
      font-size: 1.2rem;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.3s;
      outline: none;
    }

    .search-form input:focus {
      border-color: #3498db;
      box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1);
    }

    .search-btn {
      background: #2196f3;
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
      gap: 10px;
    }

    .search-btn:hover {
      background: #1976d2;
      transform: translateY(-2px);
    }

    .search-error {
      background: #fff5f5;
      color: #e74c3c;
      padding: 12px;
      border-radius: 10px;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .back-btn-text {
      background: none;
      border: none;
      color: #95a5a6;
      font-weight: 600;
      cursor: pointer;
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    /* Detail Card */
    .ticket-detail-card {
      text-align: right;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #f8fafc;
      margin-bottom: 25px;
    }

    .detail-title-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .detail-title-box h3 {
      font-size: 1.3rem;
      color: #2c3e50;
      font-weight: 800;
    }

    .status-badge {
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 700;
    }

    .status-badge.pending { background: #fff8e1; color: #f59e0b; border: 1px solid #fef3c7; }
    .status-badge.progress { background: #e3f2fd; color: #2196f3; border: 1px solid #bbdefb; }
    .status-badge.resolved { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }

    .detail-body {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .detail-section h4 {
      color: #94a3b8;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .title-text {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1e293b;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .desc-box {
      background: #f8fafc;
      padding: 15px;
      border-radius: 12px;
      line-height: 1.6;
      color: #334155;
      font-size: 1rem;
    }

    .admin-reply-section {
      margin-top: 10px;
    }

    .reply-box {
      background: #fff9e6;
      border: 1px solid #fef3c7;
      padding: 15px;
      border-radius: 12px;
      display: flex;
      gap: 12px;
      color: #856404;
    }

    .no-reply {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #94a3b8;
      font-style: italic;
    }

    .detail-footer {
      margin-top: 35px;
      padding-top: 20px;
      border-top: 2px solid #f8fafc;
      display: flex;
      justify-content: space-between;
    }

    .new-search-btn {
      background: #f1f5f9;
      color: #475569;
      border: none;
      padding: 10px 18px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .back-home-btn {
      background: none;
      border: none;
      color: #3498db;
      font-weight: 700;
      cursor: pointer;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin { to { transform: rotate(-360deg); } }

    @media (max-width: 500px) {
      .detail-grid { grid-template-columns: 1fr; }
      .search-card { padding: 30px 20px; }
    }
  `}</style>
);

export default TicketTracking;
