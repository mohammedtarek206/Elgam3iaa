import React, { useState } from 'react';
import { User, Phone, BookOpen, Fingerprint, Send, ArrowRight, Heart } from 'lucide-react';

const API_URL = '/api';

const StudentRegistration = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    parentPhone: '',
    level: '',
    socialStatus: '',
    nationalId: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/public/register`, {
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
      <div className="registration-card">
        <div className="reg-header">
          <img src="/shariaa_logo.png" alt="الجمعية الشرعية" className="reg-logo" />
          <h1>طلب التحاق جديد</h1>
          <div className="registration-type-badge">طالب جديد</div>
          <p>يرجى ملء البيانات التالية بدقة للانضمام لمكتب تحفيظ القرآن</p>
        </div>

        <form onSubmit={handleSubmit} className="reg-form">
          <div className="input-group">
            <label><User size={18} /> اسم الطالب بالكامل</label>
            <input 
              required 
              placeholder="أدخل الاسم الرباعي" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label><Phone size={18} /> رقم هاتف الطالب (إن وجد)</label>
              <input 
                placeholder="01xxxxxxxxx" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
            <div className="input-group">
              <label><Phone size={18} /> رقم هاتف ولي الأمر</label>
              <input 
                required 
                placeholder="01xxxxxxxxx" 
                value={formData.parentPhone} 
                onChange={e => setFormData({...formData, parentPhone: e.target.value})} 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label><BookOpen size={18} /> مستوى الحفظ الحالي</label>
              <select 
                required 
                value={formData.level} 
                onChange={e => setFormData({...formData, level: e.target.value})}
              >
                <option value="">اختر المستوى</option>
                <option value="تمهيدي">تمهيدي (نور بيان)</option>
                <option value="جزء عم">جزء عم</option>
                <option value="جزء تبارك">جزء تبارك</option>
                <option value="5 أجزاء">5 أجزاء</option>
                <option value="10 أجزاء">10 أجزاء</option>
                <option value="نصف القرآن">نصف القرآن</option>
                <option value="القرآن كاملاً">القرآن كاملاً</option>
              </select>
            </div>
            <div className="input-group">
              <label><Heart size={18} /> الحالة (الاجتماعية)</label>
              <select 
                required
                value={formData.socialStatus} 
                onChange={e => setFormData({...formData, socialStatus: e.target.value})}
              >
                <option value="">اختر الحالة</option>
                <option value="عادي">عادي</option>
                <option value="يتيم">يتيم</option>
                <option value="غير قادر">غير قادر</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label><Fingerprint size={18} /> الرقم القومي للطالب (14 رقم)</label>
            <input 
              required 
              maxLength="14" 
              minLength="14"
              placeholder="14 رقم من شهادة الميلاد" 
              value={formData.nationalId} 
              onChange={e => setFormData({...formData, nationalId: e.target.value.replace(/\D/g, '')})} 
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label><Phone size={18} /> رقم هاتف الطالب (11 رقم)</label>
              <input 
                required
                maxLength="11"
                minLength="11"
                placeholder="11 رقم" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} 
              />
            </div>
            <div className="input-group">
              <label><Phone size={18} /> رقم هاتف ولي الأمر (11 رقم)</label>
              <input 
                required 
                maxLength="11"
                minLength="11"
                placeholder="11 رقم" 
                value={formData.parentPhone} 
                onChange={e => setFormData({...formData, parentPhone: e.target.value.replace(/\D/g, '')})} 
              />
            </div>
          </div>

          <button type="submit" className="submit-reg-btn" disabled={loading}>
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
          background: #e8f5e9;
        }

        .registration-card, .success-card {
          background: white;
          width: 100%;
          max-width: 600px;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
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
          background: #e8f5e9;
          color: #27ae60;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 15px;
          border: 1px solid #27ae60;
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

        .input-group input, .input-group select {
          padding: 12px;
          border: 2px solid #ecf0f1;
          border-radius: 10px;
          font-family: inherit;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .input-group input:focus, .input-group select:focus {
          border-color: #27ae60;
          outline: none;
          box-shadow: 0 0 0 4px rgba(39, 174, 96, 0.1);
        }

        .submit-reg-btn {
          background: #27ae60;
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
        }

        .submit-reg-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
          filter: brightness(1.1);
        }

        .cancel-reg-btn {
          color: #7f8c8d;
          font-weight: 600;
          font-size: 0.95rem;
          margin-top: 10px;
        }

        .success-card {
          text-align: center;
        }

        .success-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .success-card h2 {
          color: #27ae60;
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
        }

        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          .registration-card {
            padding: 25px;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentRegistration;
