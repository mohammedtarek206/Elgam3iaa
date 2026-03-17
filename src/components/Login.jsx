import React, { useState } from 'react';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل تسجيل الدخول');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container fade-in">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon">
            <img src="/شعار_الجمعية_الشرعية.png" alt="الجمعية الشرعية" className="login-logo-img" />
          </div>
          <h2>تسجيل الدخول</h2>
          <div className="branding-labels">
            <p className="main-brand">الجمعية الشرعية كفر طلا</p>
            <p className="sub-brand">مشروع تحفيظ القران الكريم</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="username">اسم المستخدم</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">كلمة المرور</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'جاري التحميل...' : 'دخول'}
          </button>

          <div className="login-footer">
            <p>طالب جديد؟</p>
            <button type="button" className="register-link-btn" onClick={() => window.dispatchEvent(new CustomEvent('open-registration'))}>
              تقديم طلب التحاق جديد
            </button>
            <div style={{ marginTop: '15px' }}>
              <p>ولي أمر؟</p>
              <button type="button" className="register-link-btn" style={{ color: '#2ecc71' }} onClick={() => window.dispatchEvent(new CustomEvent('open-parent-followup'))}>
                متابعة ولي الأمر
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
          background: linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%);
          position: relative;
          overflow: hidden;
        }

        .login-container::before {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          background: var(--primary-light);
          border-radius: 50%;
          top: -100px;
          right: -100px;
          opacity: 0.1;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 30px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          width: 100%;
          max-width: 450px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          z-index: 1;
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-icon {
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          background: white;
          padding: 10px;
          border-radius: 20px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }

        .login-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .login-header h2 {
          color: var(--primary);
          font-size: 2.2rem;
          margin-bottom: 12px;
          font-weight: 800;
        }

        .branding-labels {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .main-brand {
          color: var(--secondary);
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0;
        }

        .sub-brand {
          color: #27ae60;
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
          border: 1px solid #fecaca;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-weight: 600;
          color: var(--primary);
          font-size: 0.95rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          right: 16px;
          color: #94a3b8;
        }

        .input-wrapper input {
          width: 100%;
          padding: 14px 48px 14px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          font-size: 1rem;
          transition: all 0.2s;
          background: #f8fafc;
        }

        .input-wrapper input:focus {
          border-color: var(--accent);
          background: white;
          box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1);
          outline: none;
        }

        .login-btn {
          background: var(--primary);
          color: white;
          padding: 14px;
          border-radius: 14px;
          font-size: 1.1rem;
          font-weight: 700;
          transition: all 0.3s;
          margin-top: 8px;
          border: none;
          cursor: pointer;
        }

        .login-btn:hover {
          background: var(--secondary);
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.1);
        }

        .login-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          transform: none;
        }

        .login-footer {
          text-align: center;
          margin-top: 10px;
          border-top: 1px solid #eee;
          padding-top: 15px;
        }

        .login-footer p {
          font-size: 0.9rem;
          margin-bottom: 5px;
          color: #7f8c8d;
        }

        .register-link-btn {
          color: var(--accent);
          font-weight: 700;
          font-size: 1rem;
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 30px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
