import React, { useState } from 'react';
import { User, Phone, BookOpen, Fingerprint, Send, ArrowRight, MapPin } from 'lucide-react';

const API_URL = '/api';

const SheikhRegistration = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    qualification: '',
    phone: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/public/register-sheikh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        alert(data.message || 'حدث خطأ أثناء التسجيل');
      }
    } catch (err) {
      alert('تعذر الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="registration-container fade-in">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>تم تقديم طلبك بنجاح!</h2>
          <p>سيتم مراجعة بياناتك من قبل الإدارة وسنتصل بك قريباً.</p>
          <button className="back-to-login" onClick={onBack}>
            <ArrowRight size={20} />
            العودة لتسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-container fade-in" dir="rtl">
      <div className="registration-card sheikh-card">
        <div className="reg-header">
          <img src="/shariaa_logo.png" alt="الجمعية الشرعية" className="reg-logo" />
          <h1>طلب التحاق محفظ</h1>
          <div className="registration-type-badge sheikh-badge">محفظ جديد</div>
          <p>يرجى ملء البيانات التالية للالتحاق بهيئة تدريس المكتب</p>
        </div>

        <form onSubmit={handleSubmit} className="reg-form">
          <div className="input-group">
            <label><User size={18} /> اسم المحفظ بالكامل</label>
            <input 
              required 
              placeholder="أدخل الاسم الرباعي" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div className="input-group">
            <label><Fingerprint size={18} /> الرقم القومي</label>
            <input 
              required 
              maxLength="14" 
              placeholder="14 رقم" 
              value={formData.nationalId} 
              onChange={e => setFormData({...formData, nationalId: e.target.value})} 
            />
          </div>

          <div className="form-row">
            <div className="input-group">
               <label><Phone size={18} /> رقم هاتف التواصل</label>
               <input 
                 required 
                 placeholder="01xxxxxxxxx" 
                 value={formData.phone} 
                 onChange={e => setFormData({...formData, phone: e.target.value})} 
               />
            </div>
            <div className="input-group">
               <label><BookOpen size={18} /> المؤهل / الإجازة</label>
               <input 
                 required 
                 placeholder="مثلاً: ليسانس أصول دين، مجاز" 
                 value={formData.qualification} 
                 onChange={e => setFormData({...formData, qualification: e.target.value})} 
               />
            </div>
          </div>

          <div className="input-group full-width">
            <label><MapPin size={18} /> عنوان السكن</label>
             <input 
               required 
               placeholder="المركز، القرية/المدينة، الشارع" 
               value={formData.address} 
               onChange={e => setFormData({...formData, address: e.target.value})} 
             />
          </div>

          <button type="submit" className="submit-reg-btn sheikh-btn" disabled={loading}>
            {loading ? 'جاري الإرسال...' : (
              <>
                إرسال الطلب
                <Send size={20} />
              </>
            )}
          </button>

          <button type="button" className="cancel-reg-btn" onClick={onBack}>
            إلغاء والعودة
          </button>
        </form>
      </div>

      <style>{`
        .registration-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #fdf2e9; /* distinct background for sheikh */
        }

        .registration-card {
          background: white;
          width: 100%;
          max-width: 600px;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }

        .sheikh-card {
           border-top: 5px solid #d35400;
        }

        .reg-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .reg-logo {
          width: 100px;
          height: 100px;
          object-fit: contain;
          margin-bottom: 15px;
        }

        .reg-header h1 {
          color: #2c3e50;
          font-size: 1.8rem;
          margin-bottom: 5px;
        }

        .registration-type-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 15px;
        }

        .sheikh-badge {
          background: #fef5e7;
          color: #d35400;
          border: 1px solid #d35400;
        }

        .reg-header p {
          color: #666;
          font-size: 0.95rem;
        }

        .reg-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: #34495e;
          font-size: 0.9rem;
        }

        .input-group input {
          padding: 12px;
          border: 2px solid #ecf0f1;
          border-radius: 10px;
          font-family: inherit;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .input-group input:focus {
          border-color: #d35400;
          outline: none;
          box-shadow: 0 0 0 4px rgba(211, 84, 0, 0.1);
        }

        .submit-reg-btn {
          color: white;
          padding: 15px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 10px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
        }

        .sheikh-btn {
          background: #d35400;
        }

        .sheikh-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(211, 84, 0, 0.3);
          filter: brightness(1.1);
        }

        .cancel-reg-btn {
          color: #7f8c8d;
          font-weight: 600;
          font-size: 0.95rem;
          margin-top: 10px;
          background: none;
          border: none;
          cursor: pointer;
        }

        .success-card {
          text-align: center;
        }

        .success-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .success-card h2 {
          color: #d35400;
          margin-bottom: 15px;
        }

        .success-card p {
          color: #666;
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .back-to-login {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 0 auto;
          color: #3498db;
          font-weight: 700;
          background: none;
          border: none;
          cursor: pointer;
        }

        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr; }
          .registration-card { padding: 25px; }
        }
      `}</style>
    </div>
  );
};

export default SheikhRegistration;
