import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, Briefcase, Fingerprint, Send, ArrowRight, FileText, Clock, CheckCircle, XCircle, Search, RefreshCw, DollarSign, Calendar } from 'lucide-react';

const API_URL = '/api';

// --- Status Tracker ---
const JobStatusTracker = ({ nationalId, onBack }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  const checkStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/public/request-status/job/${nationalId}`);
      const data = await res.json();
      if (res.ok) {
        setStatus(data);
        setError('');
        if (data.status === 'accepted' || data.status === 'rejected') {
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
          <div className="spinner job-spinner"></div>
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
          <div className="pulse-icon-job">
            <Clock size={60} color="#2980b9" />
          </div>
          <h2 className="job-heading">جاري معالجة طلبك</h2>
          <p className="status-name">مرحباً، <strong>{status.name}</strong></p>
          <div className="status-steps">
            <div className="step done">
              <span className="step-dot">✅</span>
              <span>تم استلام طلب وظيفة <strong>({status.jobType})</strong></span>
            </div>
            <div className="step job-active">
              <span className="step-dot">⏳</span>
              <span>قيد المراجعة من قِبَل الإدارة</span>
            </div>
            <div className="step waiting">
              <span className="step-dot">⬜</span>
              <span>نتيجة قبول الوظيفة</span>
            </div>
          </div>
          <p className="auto-refresh-note">
            <RefreshCw size={14} /> سيتم تحديث الحالة تلقائياً كل 30 ثانية
          </p>
          <button className="manual-refresh-btn job-refresh" onClick={checkStatus}>
            <RefreshCw size={16} /> تحديث الحالة الآن
          </button>
        </div>
      );
    }

    if (status.status === 'accepted') {
      return (
        <div className="status-approved-card">
          <div className="approved-icon">
            <CheckCircle size={70} color="#2980b9" />
          </div>
          <h2 className="job-h2">🎉 تم قبول طلبك بنجاح!</h2>
          <p className="approved-congrats">
            مبروك يا <strong>{status.name}</strong>، تم قبولك للعمل في منصب <strong>{status.jobType}</strong>
          </p>

          <div className="approved-details job-details">
            <h3>تفاصيل التعيين:</h3>
            <div className="detail-row">
              <span className="detail-label"><Briefcase size={16} /> الوظيفة:</span>
              <span className="detail-value highlight-blue">{status.jobType}</span>
            </div>
            {status.salary > 0 && (
              <div className="detail-row">
                <span className="detail-label"><DollarSign size={16} /> الراتب الشهري:</span>
                <span className="detail-value highlight-blue">{status.salary} جنيه</span>
              </div>
            )}
            {status.joinDate && (
              <div className="detail-row">
                <span className="detail-label"><Calendar size={16} /> تاريخ الالتحاق:</span>
                <span className="detail-value">{status.joinDate}</span>
              </div>
            )}
            {status.adminNotes && (
              <div className="detail-row">
                <span className="detail-label">📝 ملاحظات الإدارة:</span>
                <span className="detail-value">{status.adminNotes}</span>
              </div>
            )}
          </div>
          <div className="approved-footer job-footer">
            يرجى التواصل مع إدارة المكتب لاستكمال إجراءات التعيين الرسمية
          </div>
        </div>
      );
    }

    if (status.status === 'rejected') {
      return (
        <div className="status-rejected-card">
          <XCircle size={70} color="#e74c3c" />
          <h2>تم رفض الطلب</h2>
          <p>عزيزنا <strong>{status.name}</strong>، نأسف لإخبارك بأنه تم رفض طلب التوظيف في الوقت الحالي.</p>
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
    <div className="registration-container fade-in job-bg" dir="rtl">
      <div className="status-card">
        {renderContent()}
        <button className="back-to-login" onClick={onBack}>
          <ArrowRight size={20} />
          العودة للصفحة الرئيسية
        </button>
      </div>
      <JobStatusStyles />
    </div>
  );
};

// --- Status Check Form ---
const JobStatusCheck = ({ onBack }) => {
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
    return <JobStatusTracker nationalId={submittedId} onBack={() => setSubmittedId('')} />;
  }

  return (
    <div className="registration-container fade-in job-bg" dir="rtl">
      <div className="registration-card job-card">
        <div className="reg-header">
          <img src="/shariaa_logo.png" alt="الجمعية الشرعية" className="reg-logo" />
          <h1>متابعة طلب الوظيفة</h1>
          <div className="registration-type-badge job-badge">متابعة</div>
          <p>أدخل رقمك القومي لمتابعة حالة طلب التوظيف</p>
        </div>
        <form onSubmit={handleCheck} className="reg-form">
          <div className="input-group">
            <label><Fingerprint size={18} /> الرقم القومي (14 رقم)</label>
            <input required maxLength="14" minLength="14"
              placeholder="أدخل رقمك القومي"
              value={nationalId}
              onChange={e => {
                const val = e.target.value;
                const normalized = val.replace(/[٠-٩]/g, d => d.charCodeAt(0) - 1632)
                                     .replace(/[۰-۹]/g, d => d.charCodeAt(0) - 1776)
                                     .replace(/\D/g, '');
                setNationalId(normalized);
              }} />
          </div>
          <button type="submit" className="submit-reg-btn job-btn">
            <Search size={20} /> متابعة الطلب
          </button>
          <button type="button" className="cancel-reg-btn" onClick={onBack}>العودة</button>
        </form>
      </div>
      <JobStatusStyles />
    </div>
  );
};

// Main Job Application Form
const JobApplicationForm = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    phone: '',
    jobType: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [submittedNationalId, setSubmittedNationalId] = useState('');
  const [showStatusCheck, setShowStatusCheck] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.jobType) {
      alert("الرجاء اختيار نوع الوظيفة");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/public/job-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmittedNationalId(formData.nationalId);
      } else {
        const data = await res.json();
        alert(data.message || 'حدث خطأ أثناء التقديم');
      }
    } catch (err) {
      alert('تعذر الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  if (submittedNationalId) {
    return <JobStatusTracker nationalId={submittedNationalId} onBack={onBack} />;
  }

  if (showStatusCheck) {
    return <JobStatusCheck onBack={() => setShowStatusCheck(false)} />;
  }

  return (
    <div className="registration-container fade-in job-bg" dir="rtl">
      <div className="registration-card job-card">
        <div className="reg-header">
          <img src="/shariaa_logo.png" alt="الجمعية الشرعية" className="reg-logo" />
          <h1>طلب التحاق بوظيفة</h1>
          <div className="registration-type-badge job-badge">فرصة عمل</div>
          <p>يرجى ملء البيانات التالية للتقديم على إحدى الوظائف المتاحة</p>
        </div>

        <form onSubmit={handleSubmit} className="reg-form">
          <div className="input-group">
            <label><User size={18} /> اسم المتقدم بالكامل</label>
            <input required placeholder="أدخل الاسم الرباعي"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label><Fingerprint size={18} /> الرقم القومي</label>
              <input required maxLength="14" placeholder="14 رقم"
                value={formData.nationalId} onChange={e => setFormData({...formData, nationalId: e.target.value})} />
            </div>
            <div className="input-group">
              <label><Phone size={18} /> رقم هاتف التواصل</label>
              <input required placeholder="01xxxxxxxxx"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div className="input-group">
            <label><Briefcase size={18} /> الوظيفة المتقدم لها</label>
            <select required value={formData.jobType}
              onChange={e => setFormData({...formData, jobType: e.target.value})} className="job-select">
              <option value="" disabled>اختر الوظيفة...</option>
              <option value="عامل نظافة">عامل نظافة</option>
              <option value="مشرف حلقات">مشرف حلقات</option>
              <option value="إداري">إداري</option>
            </select>
          </div>

          <div className="input-group full-width">
            <label><FileText size={18} /> المؤهل / ملاحظات إضافية</label>
            <input placeholder="اختياري: يمكنك كتابة مؤهلك الدراسي أو مهاراتك هنا"
              value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>

          <button type="submit" className="submit-reg-btn job-btn" disabled={loading}>
            {loading ? 'جاري الإرسال...' : (<><Send size={20} /> إرسال الطلب</>)}
          </button>

          <button type="button" className="check-status-btn job-check-btn" onClick={() => setShowStatusCheck(true)}>
            <Search size={16} /> متابعة حالة طلب سابق
          </button>

          <button type="button" className="cancel-reg-btn" onClick={onBack}>إلغاء والعودة</button>
        </form>
      </div>

      <JobStatusStyles />
    </div>
  );
};

const JobStatusStyles = () => (
  <style>{`
    .job-bg { background: #f0f4f8; }

    .registration-container {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center; padding: 20px;
    }

    .registration-card {
      background: white; width: 100%; max-width: 600px;
      border-radius: 20px; padding: 40px; box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    }

    .job-card { border-top: 5px solid #2980b9; }

    .status-card {
      background: white; width: 100%; max-width: 580px;
      border-radius: 24px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.12); text-align: center;
    }

    .reg-header { text-align: center; margin-bottom: 30px; }
    .reg-logo { width: 100px; height: 100px; object-fit: contain; margin-bottom: 15px; }
    .reg-header h1 { color: #2c3e50; font-size: 1.8rem; margin-bottom: 5px; }

    .registration-type-badge {
      display: inline-block; padding: 5px 15px; border-radius: 20px;
      font-weight: 700; font-size: 0.9rem; margin-bottom: 15px;
    }

    .job-badge { background: #eaf2f8; color: #2980b9; border: 1px solid #2980b9; }
    .reg-header p { color: #666; font-size: 0.95rem; }

    .reg-form { display: flex; flex-direction: column; gap: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .input-group { display: flex; flex-direction: column; gap: 8px; }

    .input-group label {
      display: flex; align-items: center; gap: 8px;
      font-weight: 700; color: #34495e; font-size: 0.9rem;
    }

    .input-group input, .job-select {
      padding: 12px; border: 2px solid #ecf0f1; border-radius: 10px;
      font-family: inherit; font-size: 1rem; transition: all 0.3s; background-color: white;
    }

    .input-group input:focus, .job-select:focus {
      border-color: #2980b9; outline: none; box-shadow: 0 0 0 4px rgba(41,128,185,0.1);
    }

    .submit-reg-btn {
      color: white; padding: 15px; border-radius: 12px; font-size: 1.1rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center; gap: 12px;
      margin-top: 10px; transition: all 0.3s; border: none; cursor: pointer;
    }

    .job-btn { background: #2980b9; }
    .job-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(41,128,185,0.3); filter: brightness(1.1); }
    .submit-reg-btn:disabled { background: #95a5a6; cursor: not-allowed; }

    .check-status-btn {
      padding: 12px; border-radius: 10px; font-weight: 700; font-size: 0.95rem;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      cursor: pointer; transition: all 0.2s;
    }

    .job-check-btn { background: #eaf2f8; color: #2980b9; border: 1px solid #2980b9; }
    .job-check-btn:hover { background: #2980b9; color: white; }

    .cancel-reg-btn {
      color: #7f8c8d; font-weight: 600; font-size: 0.95rem;
      margin-top: 5px; background: none; border: none; cursor: pointer;
    }

    .back-to-login {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      margin: 20px auto 0; color: #3498db; font-weight: 700;
      background: none; border: none; cursor: pointer; font-size: 0.95rem;
    }

    /* Tracker styles */
    .status-loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px 0; color: #666; }
    .spinner { width: 48px; height: 48px; border: 5px solid #eaf2f8; border-radius: 50%; animation: spin 1s linear infinite; }
    .job-spinner { border-top-color: #2980b9; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .status-pending-card { display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .pulse-icon-job { animation: pulse 2s ease-in-out infinite; }
    @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    .job-heading { color: #2980b9; font-size: 1.6rem; margin: 0; }
    .status-name { color: #555; font-size: 1rem; }

    .status-steps {
      background: #fafafa; border-radius: 16px; padding: 20px 24px; width: 100%;
      display: flex; flex-direction: column; gap: 14px; text-align: right; border: 1px solid #eee;
    }

    .step { display: flex; align-items: center; gap: 12px; font-size: 0.95rem; color: #555; }
    .step.done { color: #27ae60; font-weight: 600; }
    .step.job-active { color: #2980b9; font-weight: 700; }
    .step.waiting { color: #bbb; }
    .step-dot { font-size: 1.2rem; }

    .auto-refresh-note { display: flex; align-items: center; gap: 6px; color: #95a5a6; font-size: 0.82rem; }

    .manual-refresh-btn {
      border: 1px solid; padding: 10px 20px; border-radius: 10px; font-weight: 700;
      display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s;
    }

    .job-refresh { background: #eaf2f8; color: #2980b9; border-color: #2980b9; }
    .job-refresh:hover { background: #2980b9; color: white; }

    .status-approved-card { display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .approved-icon { animation: bounceIn 0.6s ease; }
    @keyframes bounceIn { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
    .job-h2 { color: #2980b9; font-size: 1.8rem; margin: 0; }
    .approved-congrats { color: #555; font-size: 1rem; }

    .approved-details { border-radius: 16px; padding: 20px 24px; width: 100%; border: 2px solid; }
    .job-details { background: linear-gradient(135deg, #eaf2f8, #d6eaf8); border-color: #2980b9; }
    .job-details h3 { color: #2980b9; font-size: 1rem; margin-bottom: 14px; text-align: right; }

    .detail-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 0; border-bottom: 1px solid rgba(41,128,185,0.15); font-size: 0.95rem;
    }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #555; font-weight: 600; display: flex; align-items: center; gap: 6px; }
    .detail-value { font-weight: 800; color: #2c3e50; }
    .highlight-blue { color: #2980b9; font-size: 1.05rem; }

    .approved-footer { border-radius: 12px; padding: 12px 20px; font-size: 0.9rem; font-weight: 600; width: 100%; }
    .job-footer { background: #fff9e6; border: 1px solid #f1c40f; color: #7d6608; }

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

export default JobApplicationForm;
