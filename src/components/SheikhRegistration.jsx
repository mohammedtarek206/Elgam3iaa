import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, BookOpen, Fingerprint, Send, ArrowRight, MapPin, Clock, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';

const API_URL = '/api';

// --- Status Tracker Component ---
const SheikhStatusTracker = ({ nationalId, onBack }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  const checkStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/public/request-status/sheikh/${nationalId}`);
      const data = await res.json();
      if (res.ok) {
        setStatus(data);
        setError('');
        if (data.status === 'approved' || data.status === 'rejected') {
          clearInterval(intervalRef.current);
        }
      } else {
        setError(data.message);
      }
    } catch {
      setError('تعذر الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    intervalRef.current = setInterval(checkStatus, 30000);
    return () => clearInterval(intervalRef.current);
  }, [nationalId]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="status-loading">
          <div className="spinner sheikh-spinner"></div>
          <p>جاري التحقق من حالة طلبك...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="status-error">
          <XCircle size={50} color="#e74c3c" />
          <p>{error}</p>
        </div>
      );
    }

    if (!status) return null;

    if (status.status === 'pending') {
      return (
        <div className="status-pending-card">
          <div className="pulse-icon-sheikh">
            <Clock size={60} color="#d35400" />
          </div>
          <h2 className="sheikh-heading">جاري معالجة طلبك</h2>
          <p className="status-name">مرحباً، <strong>{status.name}</strong></p>
          <div className="status-steps">
            <div className="step done">
              <span className="step-dot">✅</span>
              <span>تم استلام الطلب بتاريخ {status.requestDate}</span>
            </div>
            <div className="step sheikh-active">
              <span className="step-dot">⏳</span>
              <span>قيد المراجعة من قِبَل الإدارة</span>
            </div>
            <div className="step waiting">
              <span className="step-dot">⬜</span>
              <span>نتيجة القبول والتسكين</span>
            </div>
          </div>
          <p className="auto-refresh-note">
            <RefreshCw size={14} /> سيتم تحديث الحالة تلقائياً كل 30 ثانية
          </p>
          <button className="manual-refresh-btn sheikh-refresh" onClick={checkStatus}>
            <RefreshCw size={16} /> تحديث الحالة الآن
          </button>
        </div>
      );
    }

    if (status.status === 'approved') {
      const classes = status.approvedClasses || [];
      return (
        <div className="status-approved-card">
          <div className="approved-icon">
            <CheckCircle size={70} color="#d35400" />
          </div>
          <h2 className="sheikh-h2">🎉 تم قبولك بنجاح!</h2>
          <p className="approved-congrats">
            مبروك يا <strong>{status.name}</strong>، تم قبولك ضمن هيئة المحفظين بمكتب تحفيظ القرآن الكريم
          </p>

          <div className="approved-details sheikh-details">
            <h3>بيانات التسكين الخاصة بك:</h3>
            <div className="detail-row">
              <span className="detail-label">📚 الفصول المكلّف بها:</span>
              <div className="classes-chips">
                {classes.length > 0 ? classes.map((cls, i) => (
                  <span key={i} className="class-chip">{cls}</span>
                )) : <span className="detail-value">سيتم تحديدها قريباً</span>}
              </div>
            </div>
            {status.adminNotes && (
              <div className="detail-row">
                <span className="detail-label">📝 ملاحظات الإدارة:</span>
                <span className="detail-value">{status.adminNotes}</span>
              </div>
            )}
          </div>
          <div className="approved-footer sheikh-footer">
            يرجى التواصل مع إدارة المكتب لاستكمال إجراءات الانضمام، وفقك الله
          </div>
        </div>
      );
    }

    if (status.status === 'rejected') {
      return (
        <div className="status-rejected-card">
          <XCircle size={70} color="#e74c3c" />
          <h2>تم رفض الطلب</h2>
          <p>عزيزنا <strong>{status.name}</strong>، نأسف لإخبارك بأنه تم رفض طلب التحاقك كمحفظ في الوقت الحالي.</p>
          {status.rejectionReason && (
            <div className="rejection-reason">
              <strong>السبب:</strong> {status.rejectionReason}
            </div>
          )}
          <p className="contact-note">للاستفسار، يرجى التواصل مع إدارة المكتب مباشرةً.</p>
        </div>
      );
    }
  };

  return (
    <div className="registration-container fade-in sheikh-bg" dir="rtl">
      <div className="status-card">
        {renderContent()}
        <button className="back-to-login" onClick={onBack}>
          <ArrowRight size={20} />
          العودة للصفحة الرئيسية
        </button>
      </div>
      <SheikhStatusStyles />
    </div>
  );
};

// --- Status Check Form ---
const SheikhStatusCheck = ({ onBack }) => {
  const [nationalId, setNationalId] = useState('');
  const [submittedId, setSubmittedId] = useState('');

  const handleCheck = (e) => {
    e.preventDefault();
    if (nationalId.length !== 14) {
      alert('الرقم القومي يجب أن يكون 14 رقم');
      return;
    }
    setSubmittedId(nationalId);
  };

  if (submittedId) {
    return <SheikhStatusTracker nationalId={submittedId} onBack={() => setSubmittedId('')} />;
  }

  return (
    <div className="registration-container fade-in sheikh-bg" dir="rtl">
      <div className="registration-card sheikh-card">
        <div className="reg-header">
          <img src="/shariaa_logo.png" alt="الجمعية الشرعية" className="reg-logo" />
          <h1>متابعة حالة الطلب</h1>
          <div className="registration-type-badge sheikh-badge">محفظ</div>
          <p>أدخل رقمك القومي لمتابعة حالة طلب الالتحاق</p>
        </div>
        <form onSubmit={handleCheck} className="reg-form">
          <div className="input-group">
            <label><Fingerprint size={18} /> الرقم القومي (14 رقم)</label>
            <input
              required maxLength="14" minLength="14"
              placeholder="أدخل رقمك القومي"
              value={nationalId}
              value={nationalId}
              onChange={e => {
                const val = e.target.value;
                const normalized = val.replace(/[٠-٩]/g, d => d.charCodeAt(0) - 1632)
                                     .replace(/[۰-۹]/g, d => d.charCodeAt(0) - 1776)
                                     .replace(/\D/g, '');
                setNationalId(normalized);
              }}
            />
          </div>
          <button type="submit" className="submit-reg-btn sheikh-btn">
            <Search size={20} /> متابعة حالة الطلب
          </button>
          <button type="button" className="cancel-reg-btn" onClick={onBack}>العودة</button>
        </form>
      </div>
      <SheikhStatusStyles />
    </div>
  );
};

// Main Sheikh Registration Component
const SheikhRegistration = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    qualification: '',
    phone: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [submittedNationalId, setSubmittedNationalId] = useState('');
  const [showStatusCheck, setShowStatusCheck] = useState(false);

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
        setSubmittedNationalId(formData.nationalId);
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

  if (submittedNationalId) {
    return <SheikhStatusTracker nationalId={submittedNationalId} onBack={onBack} />;
  }

  if (showStatusCheck) {
    return <SheikhStatusCheck onBack={() => setShowStatusCheck(false)} />;
  }

  return (
    <div className="registration-container fade-in sheikh-bg" dir="rtl">
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
            <input required placeholder="أدخل الاسم الرباعي"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="input-group">
            <label><Fingerprint size={18} /> الرقم القومي</label>
            <input required maxLength="14" placeholder="14 رقم"
              value={formData.nationalId} onChange={e => {
                const val = e.target.value;
                const normalized = val.replace(/[٠-٩]/g, d => d.charCodeAt(0) - 1632)
                                     .replace(/[۰-۹]/g, d => d.charCodeAt(0) - 1776)
                                     .replace(/\D/g, '');
                setFormData({...formData, nationalId: normalized});
              }} />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label><Phone size={18} /> رقم هاتف التواصل</label>
              <input required placeholder="01xxxxxxxxx"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="input-group">
              <label><BookOpen size={18} /> المؤهل / الإجازة</label>
              <input required placeholder="مثلاً: ليسانس أصول دين، مجاز"
                value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} />
            </div>
          </div>

          <div className="input-group full-width">
            <label><MapPin size={18} /> عنوان السكن</label>
            <input required placeholder="المركز، القرية/المدينة، الشارع"
              value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>

          <button type="submit" className="submit-reg-btn sheikh-btn" disabled={loading}>
            {loading ? 'جاري الإرسال...' : (<><Send size={20} /> إرسال الطلب</>)}
          </button>

          <button type="button" className="check-status-btn sheikh-check-btn" onClick={() => setShowStatusCheck(true)}>
            <Search size={16} /> متابعة حالة طلب سابق
          </button>

          <button type="button" className="cancel-reg-btn" onClick={onBack}>إلغاء والعودة</button>
        </form>
      </div>

      <SheikhStatusStyles />
    </div>
  );
};

const SheikhStatusStyles = () => (
  <style>{`
    .sheikh-bg { background: #fdf2e9; }

    .registration-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .registration-card {
      background: white;
      width: 100%;
      max-width: 600px;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    }

    .sheikh-card { border-top: 5px solid #d35400; }

    .status-card {
      background: white;
      width: 100%;
      max-width: 580px;
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.12);
      text-align: center;
    }

    .reg-header { text-align: center; margin-bottom: 30px; }
    .reg-logo { width: 100px; height: 100px; object-fit: contain; margin-bottom: 15px; }
    .reg-header h1 { color: #2c3e50; font-size: 1.8rem; margin-bottom: 5px; }

    .registration-type-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 0.9rem;
      margin-bottom: 15px;
    }

    .sheikh-badge { background: #fef5e7; color: #d35400; border: 1px solid #d35400; }
    .reg-header p { color: #666; font-size: 0.95rem; }

    .reg-form { display: flex; flex-direction: column; gap: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .input-group { display: flex; flex-direction: column; gap: 8px; }

    .input-group label {
      display: flex; align-items: center; gap: 8px;
      font-weight: 700; color: #34495e; font-size: 0.9rem;
    }

    .input-group input {
      padding: 12px; border: 2px solid #ecf0f1;
      border-radius: 10px; font-family: inherit; font-size: 1rem; transition: all 0.3s;
    }

    .input-group input:focus { border-color: #d35400; outline: none; box-shadow: 0 0 0 4px rgba(211,84,0,0.1); }

    .submit-reg-btn {
      color: white; padding: 15px; border-radius: 12px; font-size: 1.1rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center; gap: 12px;
      margin-top: 10px; transition: all 0.3s; border: none; cursor: pointer;
    }

    .sheikh-btn { background: #d35400; }
    .sheikh-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(211,84,0,0.3); filter: brightness(1.1); }
    .submit-reg-btn:disabled { background: #95a5a6; cursor: not-allowed; }

    .check-status-btn {
      padding: 12px; border-radius: 10px; font-weight: 700; font-size: 0.95rem;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      cursor: pointer; transition: all 0.2s;
    }

    .sheikh-check-btn { background: #fef5e7; color: #d35400; border: 1px solid #d35400; }
    .sheikh-check-btn:hover { background: #d35400; color: white; }

    .cancel-reg-btn {
      color: #7f8c8d; font-weight: 600; font-size: 0.95rem;
      margin-top: 5px; background: none; border: none; cursor: pointer;
    }

    .back-to-login {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      margin: 20px auto 0; color: #3498db; font-weight: 700;
      background: none; border: none; cursor: pointer; font-size: 0.95rem;
    }

    /* Status tracker styles */
    .status-loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px 0; color: #666; }
    .spinner { width: 48px; height: 48px; border: 5px solid #fef5e7; border-radius: 50%; animation: spin 1s linear infinite; }
    .sheikh-spinner { border-top-color: #d35400; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .status-pending-card { display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .pulse-icon-sheikh { animation: pulse 2s ease-in-out infinite; }
    @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    .sheikh-heading { color: #d35400; font-size: 1.6rem; margin: 0; }
    .status-name { color: #555; font-size: 1rem; }

    .status-steps {
      background: #fafafa; border-radius: 16px; padding: 20px 24px; width: 100%;
      display: flex; flex-direction: column; gap: 14px; text-align: right; border: 1px solid #eee;
    }

    .step { display: flex; align-items: center; gap: 12px; font-size: 0.95rem; color: #555; }
    .step.done { color: #27ae60; font-weight: 600; }
    .step.sheikh-active { color: #d35400; font-weight: 700; }
    .step.waiting { color: #bbb; }
    .step-dot { font-size: 1.2rem; }

    .auto-refresh-note { display: flex; align-items: center; gap: 6px; color: #95a5a6; font-size: 0.82rem; }

    .manual-refresh-btn {
      border: 1px solid; padding: 10px 20px; border-radius: 10px; font-weight: 700;
      display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s;
    }

    .sheikh-refresh { background: #fef5e7; color: #d35400; border-color: #d35400; }
    .sheikh-refresh:hover { background: #d35400; color: white; }

    .status-approved-card { display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .approved-icon { animation: bounceIn 0.6s ease; }
    @keyframes bounceIn { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
    .sheikh-h2 { color: #d35400; font-size: 1.8rem; margin: 0; }
    .approved-congrats { color: #555; font-size: 1rem; }

    .approved-details {
      border-radius: 16px; padding: 20px 24px; width: 100%; border: 2px solid;
    }

    .sheikh-details { background: linear-gradient(135deg, #fef5e7, #fdf2e9); border-color: #d35400; }
    .sheikh-details h3 { color: #d35400; font-size: 1rem; margin-bottom: 14px; text-align: right; }

    .detail-row {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 10px 0; border-bottom: 1px solid rgba(211,84,0,0.15); font-size: 0.95rem;
    }

    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #555; font-weight: 600; }
    .detail-value { font-weight: 800; color: #2c3e50; }

    .classes-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
    .class-chip {
      background: #d35400; color: white; padding: 4px 12px;
      border-radius: 20px; font-size: 0.85rem; font-weight: 700;
    }

    .approved-footer { border-radius: 12px; padding: 12px 20px; font-size: 0.9rem; font-weight: 600; width: 100%; }
    .sheikh-footer { background: #fff9e6; border: 1px solid #f1c40f; color: #7d6608; }

    .status-rejected-card { display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .status-rejected-card h2 { color: #e74c3c; }
    .status-rejected-card p { color: #555; }

    .rejection-reason {
      background: #fdedec; border: 1px solid #e74c3c; border-radius: 12px;
      padding: 14px 20px; color: #c0392b; font-size: 0.95rem; width: 100%; text-align: right;
    }

    .contact-note { color: #95a5a6; font-size: 0.88rem; }

    .status-error { display: flex; flex-direction: column; align-items: center; gap: 14px; color: #e74c3c; padding: 20px 0; }

    @media (max-width: 600px) {
      .form-row { grid-template-columns: 1fr; }
      .registration-card { padding: 25px; }
    }
  `}</style>
);

export default SheikhRegistration;
