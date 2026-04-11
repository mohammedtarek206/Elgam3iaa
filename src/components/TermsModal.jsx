import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, FileText, CheckCircle2, ArrowRightCircle, X } from 'lucide-react';

const TermsModal = ({ isOpen, onAccept, onCancel }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // If we are within 20px of the bottom, consider it scrolled
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        setHasScrolledToBottom(true);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Reset state when opening
      setHasScrolledToBottom(false);
      setAgreed(false);
      // Check if content is short enough that it doesn't need scrolling
      setTimeout(() => {
        if (scrollRef.current && scrollRef.current.scrollHeight <= scrollRef.current.clientHeight) {
          setHasScrolledToBottom(true);
        }
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="terms-overlay fade-in">
      <div className="terms-modal-container">
        <div className="terms-header">
          <div className="terms-header-icon">
            <ShieldCheck size={32} />
          </div>
          <h2>اللائحة الداخلية لمشروع تحفيظ القرآن الكريم</h2>
          <p>الجمعية الشرعية بكفر طلا</p>
          <button className="terms-close-btn" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <div 
          className="terms-content" 
          ref={scrollRef} 
          onScroll={handleScroll}
        >
          <div className="terms-article">
            <h3>مادة (1): نطاق اللائحة</h3>
            <p>تسري أحكام هذه اللائحة على جميع الطلاب وأولياء الأمور المشتركين بالمشروع.</p>
          </div>

          <div className="terms-article">
            <h3>مادة (2): الحضور والانضباط</h3>
            <p>يلتزم الطالب بمواعيد الحضور والانصراف المحددة، ويجب إبلاغ الإدارة مسبقًا في حالة الغياب.</p>
          </div>

          <div className="terms-article">
            <h3>مادة (3): السلوك العام</h3>
            <p>يلتزم الطالب بحسن السلوك واحترام إدارة المشروع والمحفظين وزملائه، ويحظر أي تصرف يخل بالنظام العام.</p>
          </div>

          <div className="terms-article">
            <h3>مادة (4): الرسوم المالية</h3>
            <p>يلتزم ولي الأمر بسداد الرسوم في المواعيد المحددة، ولا يحق له المطالبة بردها بعد بدء الاشتراك.</p>
          </div>

          <div className="terms-article">
            <h3>مادة (5): المتابعة التعليمية</h3>
            <p>يتعهد ولي الأمر بمتابعة الطالب منزليًا لضمان مستوى الحفظ والمراجعة.</p>
          </div>

          <div className="terms-article">
            <h3>مادة (6): التقييم وإعادة التوزيع</h3>
            <p>يخضع الطالب لتقييمات دورية، ويحق للإدارة إعادة توزيعه على المجموعات وفق مستواه.</p>
          </div>

          <div className="terms-article">
            <h3>مادة (7): التعليمات المنظمة</h3>
            <p>يلتزم ولي الأمر والطالب بكافة التعليمات والقرارات التي تصدرها إدارة المشروع.</p>
          </div>

          <div className="terms-article">
            <h3>مادة (8): البيانات والمستندات</h3>
            <p>يقر ولي الأمر بصحة البيانات والمستندات المقدمة، ويتحمل المسؤولية الكاملة عن أي بيانات غير صحيحة.</p>
          </div>

          <div className="terms-article">
            <h3>مادة (9): الجزاءات</h3>
            <p>يحق لإدارة المشروع اتخاذ ما تراه مناسبًا من إجراءات في حالة المخالفة، بما في ذلك: (الإنذار – الإيقاف المؤقت – الفصل النهائي).</p>
          </div>

          <div className="terms-article">
            <h3>مادة (10): أحكام عامة</h3>
            <p>يُعد الاشتراك بالمشروع موافقة ضمنية من ولي الأمر على جميع بنود هذه اللائحة.</p>
          </div>
          
          {!hasScrolledToBottom && (
            <div className="scroll-indicator">
              <span>يرجى القراءة حتى النهاية لتفعيل الموافقة...</span>
            </div>
          )}
        </div>

        <div className="terms-footer">
          <label className={`terms-checkbox-label ${!hasScrolledToBottom ? 'disabled' : ''}`}>
            <input 
              type="checkbox" 
              checked={agreed} 
              onChange={(e) => setAgreed(e.target.checked)} 
              disabled={!hasScrolledToBottom}
            />
            <span>أقرّ باطلاعي على اللائحة الداخلية وموافقتي على الالتزام بكافة ما ورد بها.</span>
          </label>

          <button 
            className="terms-accept-btn" 
            disabled={!agreed}
            onClick={onAccept}
          >
            متابعة
            <ArrowRightCircle size={20} />
          </button>
        </div>
      </div>

      <style>{`
        .terms-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
          direction: rtl;
        }

        .terms-modal-container {
          background: white;
          width: 100%;
          max-width: 650px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: slideUp 0.4s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .terms-header {
          padding: 30px;
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          color: white;
          text-align: center;
          position: relative;
        }

        .terms-header-icon {
          background: rgba(255, 255, 255, 0.2);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
        }

        .terms-header h2 {
          font-size: 1.4rem;
          margin: 0;
          font-weight: 800;
        }

        .terms-header p {
          margin: 5px 0 0;
          opacity: 0.9;
          font-size: 0.95rem;
        }

        .terms-close-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .terms-close-btn:hover { opacity: 1; }

        .terms-content {
          padding: 30px;
          overflow-y: auto;
          flex: 1;
          background: #f8fafc;
        }

        .terms-article {
          background: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .terms-article h3 {
          color: #2c3e50;
          font-size: 1.1rem;
          margin: 0 0 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-right: 4px solid #27ae60;
          padding-right: 12px;
        }

        .terms-article p {
          color: #64748b;
          line-height: 1.7;
          margin: 0;
          font-size: 0.95rem;
        }

        .scroll-indicator {
          text-align: center;
          padding: 15px;
          background: #fff9db;
          border: 1px dashed #fab005;
          border-radius: 10px;
          color: #f08c00;
          font-weight: 700;
          font-size: 0.9rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .terms-footer {
          padding: 25px 30px;
          background: white;
          border-top: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .terms-checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
          padding: 12px;
          border-radius: 10px;
        }

        .terms-checkbox-label:hover:not(.disabled) {
          background: #f1f8f5;
        }

        .terms-checkbox-label.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .terms-checkbox-label input {
          width: 20px;
          height: 20px;
          accent-color: #27ae60;
          margin-top: 3px;
        }

        .terms-checkbox-label span {
          color: #334155;
          font-size: 0.95rem;
          font-weight: 600;
          line-height: 1.5;
        }

        .terms-accept-btn {
          background: #27ae60;
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .terms-accept-btn:hover:not(:disabled) {
          background: #219150;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(39, 174, 96, 0.4);
        }

        .terms-accept-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 600px) {
          .terms-modal-container { max-height: 95vh; border-radius: 0; }
          .terms-header { padding: 20px; }
          .terms-content { padding: 20px; }
          .terms-footer { padding: 20px; }
        }
      `}</style>
    </div>
  );
};

export default TermsModal;
