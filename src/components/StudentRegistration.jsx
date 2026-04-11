import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, BookOpen, Fingerprint, Send, ArrowRight, Heart, Clock, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';
import TermsModal from './TermsModal';

const API_URL = '/api';

// --- Status Tracker Component ---
const StudentStatusTracker = ({ nationalId, onBack }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  const checkStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/public/request-status/student/${nationalId}`);
      const data = await res.json();
      if (res.ok) {
        setStatus(data);
        setError('');
        // Stop polling once approved or rejected
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
    // Poll every 30 seconds while pending
    intervalRef.current = setInterval(checkStatus, 30000);
    return () => clearInterval(intervalRef.current);
  }, [nationalId]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="status-loading">
          <div className="spinner"></div>
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
          <div className="pulse-icon">
            <Clock size={60} color="#f39c12" />
          </div>
          <h2>جاري معالجة طلبك</h2>
          <p className="status-name">مرحباً، <strong>{status.name}</strong></p>
          <div className="status-steps">
            <div className="step done">
              <span className="step-dot">✅</span>
              <span>تم استلام الطلب بتاريخ {status.requestDate}</span>
            </div>
            <div className="step active">
              <span className="step-dot spinning">⏳</span>
              <span>قيد المراجعة من قِبَل الإدارة</span>
            </div>
            <div className="step waiting">
              <span className="step-dot">⬜</span>
              <span>نتيجة القبول</span>
            </div>
          </div>
          <p className="auto-refresh-note">
            <RefreshCw size={14} /> سيتم تحديث الحالة تلقائياً كل 30 ثانية
          </p>
          <button className="manual-refresh-btn" onClick={checkStatus}>
            <RefreshCw size={16} /> تحديث الحالة الآن
          </button>
        </div>
      );
    }

    if (status.status === 'approved') {
      return (
        <div className="status-approved-card">
          <div className="approved-icon">
            <CheckCircle size={70} color="#27ae60" />
          </div>
          <h2>🎉 تم قبولك بنجاح!</h2>
          <p className="approved-congrats">مبروك يا <strong>{status.name}</strong>، تم قبول طلب التحاقك بمكتب تحفيظ القرآن الكريم</p>

          <div className="approved-details">
            <h3>بيانات الالتحاق الخاصة بك:</h3>
            <div className="detail-row">
              <span className="detail-label">📚 الفصل المخصص:</span>
              <span className="detail-value highlight-green">{status.approvedClassName || '---'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">🧑‍🏫 المحفظ المسؤول:</span>
              <span className="detail-value highlight-green">{status.approvedSheikh || '---'}</span>
            </div>
            {status.adminNotes && (
              <div className="detail-row">
                <span className="detail-label">📝 ملاحظات الإدارة:</span>
                <span className="detail-value">{status.adminNotes}</span>
              </div>
            )}
          </div>
          <div className="approved-footer">
            يرجى الحضور في الموعد المحدد، وفقك الله وسدد خطاك
          </div>
        </div>
      );
    }

    if (status.status === 'rejected') {
      return (
        <div className="status-rejected-card">
          <XCircle size={70} color="#e74c3c" />
          <h2>تم رفض الطلب</h2>
          <p>عزيزنا <strong>{status.name}</strong>، نأسف لإخبارك بأنه تم رفض طلب التحاقك في الوقت الحالي.</p>
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
    <div className="registration-container fade-in" dir="rtl">
      <div className="status-card">
        {renderContent()}
        <button className="back-to-login" onClick={onBack}>
          <ArrowRight size={20} />
          العودة للصفحة الرئيسية
        </button>
      </div>
      <StatusStyles />
    </div>
  );
};

// --- Status Check Form (by nationalId) ---
const StudentStatusCheck = ({ onBack }) => {
  const [nationalId, setNationalId] = useState('');
  const [submittedId, setSubmittedId] = useState('');
  const [checking, setChecking] = useState(false);

  const handleCheck = (e) => {
    e.preventDefault();
    if (nationalId.length !== 14) {
      alert('الرقم القومي يجب أن يكون 14 رقم');
      return;
    }
    setSubmittedId(nationalId);
  };

  if (submittedId) {
    return <StudentStatusTracker nationalId={submittedId} onBack={() => setSubmittedId('')} />;
  }

  return (
    <div className="registration-container fade-in" dir="rtl">
      <div className="status-check-card">
        <div className="reg-header">
          <img src="/shariaa_logo.png" alt="الجمعية الشرعية" className="reg-logo" />
          <h1>متابعة حالة الطلب</h1>
          <div className="registration-type-badge">طالب</div>
          <p>أدخل رقمك القومي لمتابعة حالة طلب الالتحاق</p>
        </div>
        <form onSubmit={handleCheck} className="reg-form">
          <div className="input-group">
            <label><Fingerprint size={18} /> الرقم القومي (14 رقم)</label>
            <input
              required
              maxLength="14"
              minLength="14"
              placeholder="أدخل رقمك القومي"
              value={nationalId}
              onChange={e => {
                const val = e.target.value;
                // Convert Arabic/Hindi digits
                const normalized = val.replace(/[٠-٩]/g, d => d.charCodeAt(0) - 1632)
                                     .replace(/[۰-۹]/g, d => d.charCodeAt(0) - 1776)
                                     .replace(/\D/g, '');
                setNationalId(normalized);
              }}
            />
          </div>
          <button type="submit" className="submit-reg-btn" disabled={checking}>
            <Search size={20} />
            متابعة حالة الطلب
          </button>
          <button type="button" className="cancel-reg-btn" onClick={onBack}>
            العودة للصفحة الرئيسية
          </button>
        </form>
      </div>
      <StatusStyles />
    </div>
  );
};

// Main Registration Component
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
  const [submittedNationalId, setSubmittedNationalId] = useState('');
  const [showStatusCheck, setShowStatusCheck] = useState(false);
  const [showTerms, setShowTerms] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/public/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, agreedToTerms })
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

  // After submission - show status tracker
  if (submittedNationalId) {
    return <StudentStatusTracker nationalId={submittedNationalId} onBack={onBack} />;
  }

  // Status check mode
  if (showStatusCheck) {
    return <StudentStatusCheck onBack={() => setShowStatusCheck(false)} />;
  }

  return (
    <div className="registration-container fade-in" dir="rtl">
      <TermsModal 
        isOpen={showTerms} 
        onAccept={() => {
          setShowTerms(false);
          setAgreedToTerms(true);
        }}
        onCancel={onBack}
      />
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
              onChange={e => {
                const val = e.target.value;
                const normalized = val.replace(/[٠-٩]/g, d => d.charCodeAt(0) - 1632)
                                     .replace(/[۰-۹]/g, d => d.charCodeAt(0) - 1776)
                                     .replace(/\D/g, '');
                setFormData({...formData, nationalId: normalized});
              }}
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label><Phone size={18} /> رقم هاتف الطالب (11 رقم)</label>
              <input
                required
                maxLength="11"
                minLength="11"
                placeholder="01xxxxxxxxx"
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
                placeholder="01xxxxxxxxx"
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

          <button type="button" className="check-status-btn" onClick={() => setShowStatusCheck(true)}>
            <Search size={16} /> متابعة حالة طلب سابق
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

        .registration-card, .status-card, .status-check-card {
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

        .reg-header p { color: #666; font-size: 0.95rem; }

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
          border: none;
          cursor: pointer;
        }

        .submit-reg-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
          filter: brightness(1.1);
        }

        .submit-reg-btn:disabled { background: #95a5a6; cursor: not-allowed; }

        .check-status-btn {
          background: #eaf2f8;
          color: #2980b9;
          padding: 12px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #2980b9;
          cursor: pointer;
          transition: all 0.2s;
        }

        .check-status-btn:hover { background: #2980b9; color: white; }

        .cancel-reg-btn {
          color: #7f8c8d;
          font-weight: 600;
          font-size: 0.95rem;
          margin-top: 5px;
          background: none;
          border: none;
          cursor: pointer;
        }

        .back-to-login {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 20px auto 0;
          color: #3498db;
          font-weight: 700;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
        }

        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr; }
          .registration-card { padding: 25px; }
        }
      `}</style>
    </div>
  );
};

// Shared status styles component
const StatusStyles = () => (
  <style>{`
    .registration-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: #e8f5e9;
    }

    .status-card, .status-check-card {
      background: white;
      width: 100%;
      max-width: 580px;
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.12);
      text-align: center;
    }

    .status-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 40px 0;
      color: #666;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 5px solid #e8f5e9;
      border-top-color: #27ae60;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Pending */
    .status-pending-card { display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .pulse-icon { animation: pulse 2s ease-in-out infinite; }
    @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    .status-pending-card h2 { color: #f39c12; font-size: 1.6rem; margin: 0; }
    .status-name { color: #555; font-size: 1rem; }

    .status-steps {
      background: #fafafa;
      border-radius: 16px;
      padding: 20px 24px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 14px;
      text-align: right;
      border: 1px solid #eee;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.95rem;
      color: #555;
    }

    .step.done { color: #27ae60; font-weight: 600; }
    .step.active { color: #f39c12; font-weight: 700; }
    .step.waiting { color: #bbb; }
    .step-dot { font-size: 1.2rem; }
    .spinning { display: inline-block; animation: spin 2s linear infinite; }

    .auto-refresh-note {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #95a5a6;
      font-size: 0.82rem;
      margin-top: 8px;
    }

    .manual-refresh-btn {
      background: #eaf5ea;
      color: #27ae60;
      border: 1px solid #27ae60;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .manual-refresh-btn:hover { background: #27ae60; color: white; }

    /* Approved */
    .status-approved-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .approved-icon { animation: bounceIn 0.6s ease; }
    @keyframes bounceIn {
      0% { transform: scale(0); }
      60% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    .status-approved-card h2 { color: #27ae60; font-size: 1.8rem; margin: 0; }
    .approved-congrats { color: #555; font-size: 1rem; }

    .approved-details {
      background: linear-gradient(135deg, #f0fdf4, #e8f5e9);
      border-radius: 16px;
      padding: 20px 24px;
      width: 100%;
      border: 2px solid #27ae60;
    }

    .approved-details h3 {
      color: #27ae60;
      font-size: 1rem;
      margin-bottom: 14px;
      text-align: right;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #d5f5e3;
      font-size: 0.95rem;
    }

    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #555; font-weight: 600; }
    .detail-value { font-weight: 800; color: #2c3e50; }
    .highlight-green { color: #27ae60; font-size: 1.05rem; }

    .approved-footer {
      background: #fff9e6;
      border: 1px solid #f1c40f;
      border-radius: 12px;
      padding: 12px 20px;
      color: #7d6608;
      font-size: 0.9rem;
      font-weight: 600;
      width: 100%;
    }

    /* Rejected */
    .status-rejected-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .status-rejected-card h2 { color: #e74c3c; }
    .status-rejected-card p { color: #555; }

    .rejection-reason {
      background: #fdedec;
      border: 1px solid #e74c3c;
      border-radius: 12px;
      padding: 14px 20px;
      color: #c0392b;
      font-size: 0.95rem;
      width: 100%;
      text-align: right;
    }

    .contact-note { color: #95a5a6; font-size: 0.88rem; }

    .back-to-login {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin: 20px auto 0;
      color: #3498db;
      font-weight: 700;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.95rem;
    }

    .status-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      color: #e74c3c;
      padding: 20px 0;
    }

    /* status check card form styles */
    .status-check-card .reg-header { text-align: center; margin-bottom: 30px; }
    .status-check-card .reg-logo { width: 90px; height: 90px; object-fit: contain; margin-bottom: 12px; }
    .status-check-card h1 { color: #2c3e50; font-size: 1.6rem; }
    .status-check-card .registration-type-badge {
      display: inline-block;
      background: #e8f5e9;
      color: #27ae60;
      padding: 4px 14px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 0.85rem;
      margin-bottom: 10px;
      border: 1px solid #27ae60;
    }
    .status-check-card p { color: #666; }
    .status-check-card .reg-form { display: flex; flex-direction: column; gap: 16px; }
    .status-check-card .input-group { display: flex; flex-direction: column; gap: 8px; }
    .status-check-card .input-group label {
      display: flex; align-items: center; gap: 8px;
      font-weight: 700; color: #34495e; font-size: 0.9rem;
    }
    .status-check-card .input-group input {
      padding: 12px; border: 2px solid #ecf0f1; border-radius: 10px;
      font-family: inherit; font-size: 1rem; transition: all 0.3s;
    }
    .status-check-card .input-group input:focus {
      border-color: #27ae60; outline: none;
      box-shadow: 0 0 0 4px rgba(39, 174, 96, 0.1);
    }
    .status-check-card .submit-reg-btn {
      background: #27ae60; color: white; padding: 14px;
      border-radius: 12px; font-size: 1rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      border: none; cursor: pointer; transition: all 0.3s;
    }
    .status-check-card .submit-reg-btn:hover { filter: brightness(1.1); }
    .status-check-card .cancel-reg-btn {
      color: #7f8c8d; font-weight: 600; background: none; border: none; cursor: pointer;
    }
  `}</style>
);

export default StudentRegistration;
