import React, { useState } from 'react';
import { Ticket, Send, ArrowRight, CheckCircle, Mail, MessageSquare, AlertCircle, User, FileText, Layout, Phone } from 'lucide-react';

const API_URL = '/api';

const TicketSubmission = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: '',
    title: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone) {
      setError('الرجاء إدخال رقم الهاتف');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/public/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.message || 'حدث خطأ أثناء إرسال طلبك');
      }
    } catch (err) {
      setError('تعذر الاتصال بالسيرفر، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="ticket-view-container fade-in" dir="rtl">
        <div className="success-content-card">
          <div className="success-icon-wrapper">
            <CheckCircle size={80} color="#27ae60" />
          </div>
          <h2 className="success-title">تم استلام طلبك بنجاح!</h2>
          <p className="success-msg">{result.message}</p>
          
          <div className="ticket-result-details">
            <div className="result-row">
              <span className="res-label">رقم الطلب:</span>
              <span className="res-value ticket-id-highlight">{result.ticketId}</span>
            </div>
            <div className="result-row">
              <span className="res-label">حالة الطلب:</span>
              <span className="res-value status-badge pending">قيد الانتظار</span>
            </div>
          </div>

          <div className="instruction-box">
            <AlertCircle size={20} />
            <p>يرجى نسخ وحفظ رقم الطلب للمتابعة به لاحقاً (هام جداً).</p>
          </div>

          <button className="back-home-btn" onClick={onBack}>
            <ArrowRight size={20} /> العودة للرئيسية
          </button>
        </div>
        <TicketStyles />
      </div>
    );
  }

  return (
    <div className="ticket-view-container fade-in" dir="rtl">
      <div className="ticket-form-card">
        <div className="form-header">
          <div className="header-icon">
            <Ticket size={40} />
          </div>
          <h1>الشكاوي والمقترحات</h1>
          <p>يسعدنا تواصلكم.. سواء كان لديك اقتراح لتحسين خدماتنا أو شكوى ترغب في حلها.</p>
        </div>

        <form onSubmit={handleSubmit} className="ticket-form">
          {error && (
            <div className="form-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label><User size={18} /> الاسم (اختياري)</label>
              <input 
                type="text" 
                placeholder="أدخل اسمك"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label><Phone size={18} /> رقم الهاتف (إجباري)</label>
              <input 
                required 
                type="tel" 
                placeholder="01xxxxxxxxx"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label><Layout size={18} /> نوع الطلب</label>
            <div className="type-selector">
              <button 
                type="button" 
                className={`type-btn ${formData.type === 'Complaint' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, type: 'Complaint'})}
              >
                شكوى
              </button>
              <button 
                type="button" 
                className={`type-btn ${formData.type === 'Suggestion' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, type: 'Suggestion'})}
              >
                اقتراح
              </button>
            </div>
          </div>

          <div className="form-group">
            <label><FileText size={18} /> عنوان الطلب</label>
            <input 
              required 
              type="text" 
              placeholder="مثال: تأخير في استلام النتائج"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label><MessageSquare size={18} /> وصف الطلب بالتفصيل</label>
            <textarea 
              required 
              placeholder="اكتب تفاصيل طلبك هنا..."
              rows={5}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-ticket-btn" disabled={loading}>
              {loading ? (
                <div className="spinner-small"></div>
              ) : (
                <><Send size={20} /> إرسال الطلب</>
              )}
            </button>
            <button type="button" className="cancel-btn" onClick={onBack}>إلغاء والعودة</button>
          </div>
        </form>
      </div>
      <TicketStyles />
    </div>
  );
};

const TicketStyles = () => (
  <style>{`
    .ticket-view-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
    }

    .ticket-form-card, .success-content-card {
      background: white;
      width: 100%;
      max-width: 700px;
      padding: 40px;
      border-radius: 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.08);
      border: 1px solid rgba(255,255,255,0.4);
    }

    .form-header {
      text-align: center;
      margin-bottom: 35px;
    }

    .header-icon {
      width: 80px;
      height: 80px;
      background: #e3f2fd;
      color: #2196f3;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 20px;
      margin: 0 auto 20px;
    }

    .form-header h1 {
      color: #2c3e50;
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 10px;
    }

    .form-header p {
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .ticket-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
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

    .form-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      color: #34495e;
      font-size: 0.95rem;
    }

    .form-group input, .form-group textarea {
      padding: 14px;
      border: 2px solid #edeff2;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s;
      outline: none;
      background: #fcfcfc;
    }

    .form-group input:focus, .form-group textarea:focus {
      border-color: #3498db;
      background: white;
      box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1);
    }

    .type-selector {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .type-btn {
      padding: 12px;
      border-radius: 12px;
      border: 2px solid #edeff2;
      background: white;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .type-btn.active {
      background: #3498db;
      color: white;
      border-color: #3498db;
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
    }

    .form-error {
      background: #fff5f5;
      color: #e74c3c;
      padding: 15px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid #fed7d7;
    }

    .form-actions {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-top: 20px;
    }

    .submit-ticket-btn {
      background: #2c3e50;
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
      transition: all 0.3s;
    }

    .submit-ticket-btn:hover:not(:disabled) {
      background: #1a252f;
      transform: translateY(-2px);
      box-shadow: 0 8px 15px rgba(0,0,0,0.1);
    }

    .submit-ticket-btn:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }

    .cancel-btn {
      background: transparent;
      border: none;
      color: #95a5a6;
      font-weight: 600;
      cursor: pointer;
    }

    /* Success View */
    .success-content-card {
      text-align: center;
    }

    .success-icon-wrapper {
      margin-bottom: 25px;
      animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    @keyframes bounceIn {
      0% { transform: scale(0); }
      70% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    .success-title {
      font-size: 2.2rem;
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .success-msg {
      color: #7f8c8d;
      font-size: 1.2rem;
      margin-bottom: 30px;
    }

    .ticket-result-details {
      background: #f8fafc;
      padding: 25px;
      border-radius: 18px;
      border: 1px dashed #cbd5e0;
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-bottom: 30px;
    }

    .result-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .res-label {
      color: #64748b;
      font-weight: 600;
    }

    .res-value {
      font-weight: 800;
      font-size: 1.1rem;
    }

    .ticket-id-highlight {
      color: #2196f3;
      font-family: monospace;
      font-size: 1.4rem;
      letter-spacing: 1px;
    }

    .status-badge {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.9rem;
    }

    .status-badge.pending {
      background: #fff8e1;
      color: #f59e0b;
      border: 1px solid #fef3c7;
    }

    .instruction-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #f0f7ff;
      color: #2b6cb0;
      padding: 15px;
      border-radius: 12px;
      text-align: right;
      margin-bottom: 35px;
      font-size: 0.95rem;
    }

    .back-home-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 auto;
      background: none;
      border: none;
      color: #3498db;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
    }

    .spinner-small {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
      .ticket-form-card { padding: 25px; }
      .success-title { font-size: 1.8rem; }
    }
  `}</style>
);

export default TicketSubmission;
