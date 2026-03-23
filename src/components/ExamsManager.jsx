import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Calendar, Star, Users, CheckCircle, X, FileDown, Printer, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_URL = '/api';

const ExamsManager = () => {
  const [exams, setExams] = useState([]);
  const [sheikhs, setSheikhs] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingResults, setViewingResults] = useState(null);

  useEffect(() => {
    fetchExams();
    fetchInitData();
  }, []);

  const fetchInitData = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/init-data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSheikhs(data.sheikhs || []);
      setClasses(data.classes || []);
      setStudents(data.students || []);
    } catch (err) {
      console.error('Error fetching init data:', err);
    }
  };

  const fetchExams = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/exams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setExams(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setLoading(false);
    }
  };

  const [currentView, setCurrentView] = useState('list'); // 'list', 'form', 'results'
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    className: '',
    examiner: '',
    notes: '',
    examModel: 'أ',
    results: []
  });

  const handleClassChange = (className) => {
    const classStudents = students.filter(s => s.className === className);
    const initialResults = classStudents.map(s => ({
      studentName: s.name,
      studentId: s._id,
      score: '',
      grade: '',
      reward: '',
      examModel: formData.examModel,
      examiner: formData.examiner,
      notes: ''
    }));
    setFormData({ ...formData, className, results: initialResults });
  };

  const [editingId, setEditingId] = useState(null);

  const openEditForm = (exam) => {
    setFormData({
      name: exam.name,
      date: exam.date,
      className: exam.className,
      examiner: exam.examiner || '',
      notes: exam.notes || '',
      examModel: exam.examModel || 'أ',
      results: exam.results || []
    });
    setEditingId(exam._id);
    setCurrentView('form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/exams/${editingId}` : `${API_URL}/exams`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchExams();
        setCurrentView('list');
        setEditingId(null);
        setFormData({
          name: '',
          date: new Date().toISOString().split('T')[0],
          className: '',
          examiner: '',
          notes: '',
          examModel: 'أ',
          results: []
        });
      }
    } catch (err) {
      console.error('Error saving exam:', err);
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الاختبار نهائياً؟')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/exams/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchExams();
      }
    } catch (err) {
      console.error('Error deleting exam:', err);
    }
  };

  const exportToExcel = () => {
    const dataToExport = exams.map(e => ({
      'اسم الاختبار': e.name,
      'التاريخ': e.date,
      'الفصل': e.className
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exams");
    XLSX.writeFile(wb, "الاختبارات.xlsx");
  };

  if (currentView === 'form') {
    return (
      <div className="exam-form-page">
        <div className="form-page-header">
           <div className="header-title-complex">
              <Trophy size={40} color="#f59e0b" />
              <div>
                <h2>{editingId ? 'رصد وتعديل درجات الاختبار' : 'إضافة اختبار جديد'}</h2>
                <p>قم بملء البيانات الأساسية ثم رصد درجات الطلاب</p>
              </div>
           </div>
           <button className="back-btn-minimal" onClick={() => { setCurrentView('list'); setEditingId(null); }}>
             <ArrowRight size={20} />
             <span>رجوع</span>
           </button>
        </div>

        <form onSubmit={handleSubmit} className="premium-exam-form">
          <div className="form-sections-grid">
             {/* General Info Card */}
             <div className="form-card-section">
                <h3 className="section-title"><Calendar size={24} /> المعلومات العامة</h3>
                <div className="form-row-grid">
                  <div className="form-group-modern">
                    <label>اسم الاختبار/المسابقة</label>
                    <input required placeholder="مثلاً: اختبار شهر رمضان" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="form-group-modern">
                    <label>تاريخ الاختبار</label>
                    <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                  </div>
                </div>
                <div className="form-row-grid" style={{ marginTop: '25px' }}>
                   <div className="form-group-modern">
                    <label>الفصل المستهدف</label>
                    {!editingId ? (
                      <select required value={formData.className} onChange={e => handleClassChange(e.target.value)}>
                        <option value="">اختر الفصل...</option>
                        {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                      </select>
                    ) : (
                      <input readOnly value={formData.className} className="readonly-input" />
                    )}
                  </div>
                  <div className="form-group-modern">
                    <label>الشيخ المختبر</label>
                    <select required value={formData.examiner} onChange={e => setFormData({ ...formData, examiner: e.target.value })}>
                      <option value="">اختر الشيخ...</option>
                      {sheikhs.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
             </div>

             {/* Results Section */}
             <div className="form-card-section">
                <h3 className="section-title"><Users size={24} /> رصد الدرجات</h3>
                
                <div className="results-header-actions">
                   <select
                     className="premium-search-select"
                     onChange={(e) => {
                       const studentId = e.target.value;
                       if (!studentId) return;
                       const student = students.find(s => s._id === studentId);
                       if (student && !formData.results.find(r => r.studentId === studentId)) {
                         setFormData({
                           ...formData,
                           results: [
                             ...formData.results,
                             {
                               studentName: student.name,
                               studentId: student._id,
                               score: '',
                               grade: '',
                               reward: '',
                               examModel: formData.examModel,
                               examiner: formData.examiner,
                               notes: ''
                             }
                           ]
                         });
                       }
                       e.target.value = "";
                     }}
                   >
                     <option value="">بحث وإضافة طالب يدوي...</option>
                     {students.filter(s => !formData.results.find(r => r.studentId === s._id)).map(s => (
                       <option key={s._id} value={s._id}>{s.name} ({s.className})</option>
                     ))}
                   </select>

                   {editingId && (
                      <button type="button" className="add-class-students-btn" onClick={() => {
                        const classStudents = students.filter(s => s.className === formData.className);
                        const existingIds = (formData.results || []).map(r => r.studentId);
                        const newOnes = classStudents.filter(s => !existingIds.includes(s._id)).map(s => ({
                          studentName: s.name,
                          studentId: s._id,
                          score: '',
                          grade: '',
                          reward: '',
                          examModel: formData.examModel,
                          examiner: formData.examiner,
                          notes: ''
                        }));
                        if (newOnes.length > 0) {
                          setFormData({ ...formData, results: [...formData.results, ...newOnes] });
                        }
                      }}>إدراج باقي طلاب الفصل</button>
                   )}
                </div>

                <div className="modern-table-container">
                  <table className="results-modern-table">
                    <thead>
                      <tr>
                        <th>الاسم</th>
                        <th style={{ width: '120px' }}>الدرجة</th>
                        <th style={{ width: '150px' }}>التقدير</th>
                        <th>ملاحظات</th>
                        <th style={{ width: '60px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.results.map((res, idx) => (
                        <tr key={idx} className="result-row-card">
                          <td className="student-name-highlight">{res.studentName}</td>
                          <td>
                            <input
                              type="number"
                              className="grade-input-mini"
                              placeholder="0"
                              value={res.score}
                              onChange={e => {
                                const newRes = [...formData.results];
                                newRes[idx].score = e.target.value;
                                setFormData({ ...formData, results: newRes });
                              }}
                            />
                          </td>
                          <td>
                            <select
                               className="grade-input-mini"
                               value={res.grade}
                               onChange={e => {
                                 const newRes = [...formData.results];
                                 newRes[idx].grade = e.target.value;
                                 setFormData({ ...formData, results: newRes });
                               }}
                            >
                               <option value="">اختر...</option>
                               <option value="ممتاز">ممتاز</option>
                               <option value="جيد جدا">جيد جدا</option>
                               <option value="جيد">جيد</option>
                               <option value="مقبول">مقبول</option>
                            </select>
                          </td>
                          <td>
                            <input
                              className="grade-input-mini"
                              placeholder="اختياري..."
                              value={res.notes}
                              onChange={e => {
                                const newRes = [...formData.results];
                                newRes[idx].notes = e.target.value;
                                setFormData({ ...formData, results: newRes });
                              }}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="delete-btn-rounded"
                              onClick={() => {
                                const newRes = formData.results.filter((_, i) => i !== idx);
                                setFormData({ ...formData, results: newRes });
                              }}
                            >
                              <X size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {formData.results.length === 0 && (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>لا يوجد طلاب مضافين لهذا الاختبار حالياً</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>

          <div className="form-page-footer">
             <button type="button" className="secondary-btn-modern" onClick={() => { setCurrentView('list'); setEditingId(null); }}>إلغاء وتجاهل</button>
             <button type="submit" className="btn-primary-premium">
                <CheckCircle size={22} />
                {editingId ? 'حفظ التعديلات' : 'نشر نتائج الاختبار'}
             </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="exams-manager fade-in">
      <div className="module-header no-print">
        <h2>الاختبارات والمسابقات</h2>
        <div className="header-actions">
          <button className="export-btn" onClick={exportToExcel} title="تصدير إلى إكسيل">
            <FileDown size={20} />
            تصدير
          </button>
          <button className="print-btn" onClick={() => window.print()} title="طباعة">
            <Printer size={20} />
            طباعة
          </button>
          <button className="add-btn" onClick={() => setCurrentView('form')}>
            <Plus size={20} />
            إضافة اختبار جديد
          </button>
        </div>
      </div>

      <div className="exams-grid">
        {exams.map(exam => (
          <div key={exam._id} className="exam-card">
            <div className="exam-delete-btn" onClick={() => handleDeleteExam(exam._id)} title="حذف الاختبار">
              <X size={18} />
            </div>
            <div className="exam-icon">
              <Trophy size={32} color="#f1c40f" />
            </div>
            <div className="exam-info">
              <h3>{exam.name}</h3>
              <div className="exam-meta">
                <div className="meta-item"><Calendar size={16} /> {exam.date}</div>
                <div className="meta-item"><Users size={16} /> {exam.className}</div>
              </div>
              <div className="exam-meta">
                <div className="meta-item"><CheckCircle size={16} /> ممتحن: {exam.examiner}</div>
              </div>
            </div>
            <div className="exam-actions-btns">
              <button className="view-results-btn" onClick={() => setViewingResults(exam)}>عرض الدرجات</button>
              <button className="edit-results-btn" onClick={() => openEditForm(exam)}>رصد الاختبار</button>
            </div>
          </div>
        ))}
      </div>

      {/* Old showForm block removed */}

      {viewingResults && (
        <div className="modal-overlay">
          <div className="modal-content fade-in results-modal">
            <div className="modal-header">
              <h3>نتائج: {viewingResults.name}</h3>
              <button className="close-btn" onClick={() => setViewingResults(null)}><X size={24} /></button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>الطالب</th>
                    <th>الدرجة</th>
                    <th>التقدير</th>
                    <th>النموذج</th>
                    <th>الملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingResults.results?.map((r, i) => (
                    <tr key={i}>
                      <td className="font-bold">{r.studentName}</td>
                      <td>{r.score}/100</td>
                      <td><span className={`grade-pill ${r.grade === 'ممتاز' ? 'excelent' : ''}`}>{r.grade}</span></td>
                      <td>نموذج {r.examModel}</td>
                      <td>{r.notes}</td>
                    </tr>
                  ))}
                  {(!viewingResults.results || viewingResults.results.length === 0) && (
                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>لا توجد نتائج مسجلة</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="modal-footer" style={{ marginTop: '20px', textAlign: 'left' }}>
              <p><strong>ملاحظات عامة:</strong> {viewingResults.notes || 'لا توجد'}</p>
              <p><strong>الممتحن الرئيسي:</strong> {viewingResults.examiner}</p>
            </div>
          </div>
        </div>
      )}

      <div className="recent-results">
        <h3>آخر نتائج الطلاب</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>اسم الطالب</th>
                <th>الاختبار</th>
                <th>الدرجة</th>
                <th>النموذج</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {exams.slice(0, 10).flatMap(exam =>
                (exam.results || []).map((res, i) => (
                  <tr key={`${exam._id}-${i}`}>
                    <td className="font-bold">{res.studentName}</td>
                    <td>{exam.name}</td>
                    <td>{res.score}</td>
                    <td>{res.examModel}</td>
                    <td>{exam.date}</td>
                  </tr>
                ))
              ).slice(0, 10)}
              {exams.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>لا توجد نتائج متاحة</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        /* --- General Layout --- */
        .exams-manager {
          padding: 20px 0;
        }

        /* --- Full Screen Sub-Page --- */
        .exam-form-page {
          background: #f8fafc;
          border-radius: 24px;
          min-height: 80vh;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08); /* Premium shadow */
          display: flex;
          flex-direction: column;
          direction: rtl;
          overflow: hidden;
          animation: slideUp 0.5s ease-out;
          border: 1px solid #e2e8f0;
          margin-bottom: 40px;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Modern Sub-Header */
        .form-page-header {
          background: white;
          padding: 30px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #f1f5f9;
        }

        .header-title-complex {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-title-complex h2 {
          margin: 0;
          font-size: 1.8rem;
          color: #1e293b;
          font-weight: 900;
        }

        .header-title-complex p {
          margin: 0;
          color: #64748b;
          font-size: 0.95rem;
          margin-top: 5px;
        }

        .back-btn-minimal {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          background: #f1f5f9;
          color: #475569;
          font-weight: 800;
          border-radius: 14px;
          transition: all 0.2s ease;
        }

        .back-btn-minimal:hover {
          background: #e2e8f0;
          color: #1e293b;
          transform: translateX(5px);
        }

        /* The Form Content */
        .premium-exam-form {
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        /* Sections */
        .form-card-section {
           background: white;
           border-radius: 20px;
           padding: 35px;
           border: 1px solid #f1f5f9;
           box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.3rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f8fafc;
        }

        .form-row-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
        }

        .form-group-modern {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .form-group-modern label {
          font-weight: 700;
          color: #334155;
          font-size: 0.9rem;
        }

        .form-group-modern input, 
        .form-group-modern select {
          padding: 14px 18px;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #fff;
        }

        .form-group-modern input:focus,
        .form-group-modern select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(39, 174, 96, 0.1);
          outline: none;
        }

        /* Results Area */
        .results-header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          gap: 20px;
        }

        .premium-search-select {
          flex: 1;
          max-width: 400px;
          padding: 12px 20px;
          border: 2px solid var(--accent);
          border-radius: 12px;
          font-weight: 700;
          color: var(--primary);
        }

        .add-class-students-btn {
          padding: 12px 24px;
          background: #f0fdf4;
          color: #166534;
          font-weight: 800;
          border-radius: 12px;
          border: 1px solid #dcfce7;
          transition: all 0.2s;
        }

        .add-class-students-btn:hover {
          background: #dcfce7;
          transform: translateY(-2px);
        }

        /* The Grid/Table for results */
        .results-modern-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 12px;
        }

        .results-modern-table th {
          padding: 0 20px 10px 20px;
          text-align: right;
          color: #64748b;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .result-row-card td {
          background: white;
          padding: 20px;
          border-bottom: 1px solid #f1f5f9;
          border-top: 1px solid #f1f5f9;
        }

        .result-row-card td:first-child {
          border-right: 1px solid #f1f5f9;
          border-radius: 0 16px 16px 0;
        }

        .result-row-card td:last-child {
          border-left: 1px solid #f1f5f9;
          border-radius: 16px 0 0 16px;
        }

        .student-name-highlight {
          font-weight: 900;
          color: #1e293b;
          font-size: 1.05rem;
        }

        .grade-input-mini {
          padding: 10px 15px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          width: 100%;
          font-weight: 600;
        }

        .delete-btn-rounded {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #fff1f2;
          color: #e11d48;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .delete-btn-rounded:hover {
          background: #fb7185;
          color: white;
        }

        /* Footer Sticky */
        .form-page-footer {
          background: white;
          padding: 30px 40px;
          display: flex;
          justify-content: flex-end;
          gap: 20px;
          border-top: 2px solid #f1f5f9;
        }

        .btn-primary-premium {
          padding: 16px 45px;
          background: var(--primary);
          color: white;
          border-radius: 16px;
          font-weight: 800;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 15px -3px rgba(39, 174, 96, 0.3);
        }

        .btn-primary-premium:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(39, 174, 96, 0.4);
        }

        /* List View Cards */
        .exams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
          gap: 25px;
          margin-top: 30px;
        }

        .exam-card {
          background: white;
          border-radius: 24px;
          padding: 25px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .exam-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
          border-color: var(--accent);
        }

        .grade-pill {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.85rem;
          background: #f1f5f9;
        }

        .grade-pill.excelent { background: #dcfce7; color: #166534; }

        @media (max-width: 768px) {
           .form-page-header { padding: 20px; flex-direction: column; align-items: flex-start; gap: 20px; }
           .premium-exam-form { padding: 20px; }
           .form-page-footer { padding: 20px; flex-direction: column-reverse; }
           .form-page-footer button { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ExamsManager;
