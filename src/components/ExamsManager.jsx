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
      <div className="exam-form-page fade-in">
        <div className="form-page-header">
           <button className="back-btn-modern" onClick={() => { setCurrentView('list'); setEditingId(null); }}>
             <ArrowRight size={24} />
             <span>العودة للقائمة</span>
           </button>
           <div className="header-title-complex">
              <Trophy size={32} className="header-icon-anim" />
              <div>
                <h2>{editingId ? 'رصد درجات الاختبار' : 'إضافة اختبار جديد'}</h2>
                <p>بيانات الاختبار ورصد درجات الطلاب بشكل منظم</p>
              </div>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="premium-exam-form">
          <div className="form-sections-grid">
             {/* General Info Card */}
             <div className="form-glass-card">
                <div className="card-indicator"></div>
                <h3 className="section-title"><Star size={20} /> البيانات الأساسية</h3>
                <div className="form-row-complex">
                  <div className="form-group-modern">
                    <label>اسم الاختبار/المسابقة</label>
                    <input required placeholder="مثلاً: اختبار شهر مارس" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="form-group-modern">
                    <label>التاريخ</label>
                    <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                  </div>
                </div>
                <div className="form-row-complex">
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
                    <label>المحفظ المختبر (الشيخ)</label>
                    <select required value={formData.examiner} onChange={e => setFormData({ ...formData, examiner: e.target.value })}>
                      <option value="">اختر الشيخ...</option>
                      {sheikhs.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
             </div>

             {/* Results Section */}
             <div className="form-glass-card results-section-modern">
                <h3 className="section-title"><Users size={20} /> رصد الدرجات والنتائج</h3>
                <div className="results-actions-top">
                   <div className="student-adder">
                      <select
                        className="premium-select"
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
                        <option value="">إضافة طالب يدوياً من خارج الفصل...</option>
                        {students.filter(s => !formData.results.find(r => r.studentId === s._id)).map(s => (
                          <option key={s._id} value={s._id}>{s.name} ({s.className})</option>
                        ))}
                      </select>
                   </div>
                   {editingId && (
                      <button type="button" className="refresh-btn-glass" onClick={() => {
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
                      }}>إضافة باقي طلاب الفصل</button>
                   )}
                </div>

                <div className="modern-table-container">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>اسم الطالب</th>
                        <th>الدرجة (100)</th>
                        <th>التقدير</th>
                        <th>ملاحظات الطالب</th>
                        <th style={{ width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.results.map((res, idx) => (
                        <tr key={idx} className="table-row-anim">
                          <td className="st-name-cell">{res.studentName}</td>
                          <td>
                            <input
                              type="number"
                              className="table-input"
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
                               className="table-input"
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
                              className="table-input"
                              placeholder="مثلاً: ممتاز في التجويد"
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
                              className="delete-row-btn"
                              onClick={() => {
                                const newRes = formData.results.filter((_, i) => i !== idx);
                                setFormData({ ...formData, results: newRes });
                              }}
                            >
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>

          <div className="form-footer-sticky">
             <button type="button" className="secondary-btn-modern" onClick={() => { setCurrentView('list'); setEditingId(null); }}>إلغاء</button>
             <button type="submit" className="primary-btn-modern">
                <CheckCircle size={20} />
                {editingId ? 'تحديث بيانات الاختبار' : 'حفظ ونشر الاختبار'}
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
        .exams-manager {
          background: var(--white);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow);
        }

        /* Modern Exam Form Page */
        .exam-form-page {
          background: #f8fafc;
          min-height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 3000;
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow-y: auto;
        }

        .form-page-header {
          background: white;
          padding: 20px 40px;
          display: flex;
          align-items: center;
          gap: 30px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .back-btn-modern {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          background: #f1f5f9;
          border-radius: 12px;
          color: #475569;
          font-weight: 700;
          transition: all 0.2s;
        }

        .back-btn-modern:hover {
          background: #e2e8f0;
          color: var(--primary);
          transform: translateX(5px);
        }

        .header-title-complex {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-title-complex h2 {
          margin: 0;
          font-size: 1.8rem;
          color: var(--primary);
        }

        .header-title-complex p {
          margin: 0;
          color: #64748b;
          font-size: 0.95rem;
        }

        .header-icon-anim {
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .premium-exam-form {
          max-width: 1200px;
          width: 100%;
          margin: 40px auto;
          padding: 0 20px 100px 20px;
        }

        .form-sections-grid {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .form-glass-card {
           background: white;
           border-radius: 20px;
           padding: 30px;
           box-shadow: 0 10px 25px rgba(0,0,0,0.03);
           border: 1px solid #edf2f7;
           position: relative;
           overflow: hidden;
        }

        .card-indicator {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 6px;
          background: linear-gradient(to left, var(--accent), var(--primary));
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.3rem;
          color: var(--primary);
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px dashed #e2e8f0;
        }

        .form-row-complex {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-bottom: 20px;
        }

        .form-group-modern {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group-modern label {
          font-weight: 700;
          color: #475569;
          font-size: 0.9rem;
        }

        .form-group-modern input, 
        .form-group-modern select {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .form-group-modern input:focus,
        .form-group-modern select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(39, 174, 96, 0.1);
          outline: none;
        }

        .readonly-input {
          background: #f8fafc;
          cursor: not-allowed;
          color: #94a3b8;
        }

        /* Results Table Modern */
        .results-actions-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .premium-select {
          padding: 10px 20px;
          border: 2px solid var(--accent);
          border-radius: 12px;
          font-weight: 700;
          color: var(--primary);
          background: white;
          cursor: pointer;
        }

        .refresh-btn-glass {
          background: #e0f2fe;
          color: #0369a1;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }

        .refresh-btn-glass:hover {
          background: #bae6fd;
          transform: translateY(-2px);
        }

        .modern-table-container {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          background: #fff;
        }

        .premium-table {
          width: 100%;
          border-collapse: collapse;
        }

        .premium-table th {
          background: #f8fafc;
          padding: 18px 20px;
          text-align: right;
          font-weight: 800;
          color: var(--primary);
          font-size: 0.95rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .premium-table td {
          padding: 15px 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .st-name-cell {
          font-weight: 800;
          color: var(--primary);
          font-size: 1.05rem;
        }

        .table-input {
          width: 100%;
          padding: 8px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .table-input:focus {
          border-color: var(--primary);
          outline: none;
        }

        .delete-row-btn {
          color: #ef4444;
          background: #fef2f2;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .delete-row-btn:hover {
          background: #ef4444;
          color: white;
          transform: scale(1.1);
        }

        .table-row-anim {
          animation: slideInRow 0.3s ease-out forwards;
        }

        @keyframes slideInRow {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .form-footer-sticky {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background: white;
          padding: 20px 40px;
          display: flex;
          justify-content: flex-end;
          gap: 20px;
          box-shadow: 0 -10px 25px rgba(0,0,0,0.05);
          z-index: 100;
        }

        .primary-btn-modern {
          padding: 14px 40px;
          background: var(--primary);
          color: white;
          border-radius: 12px;
          font-weight: 800;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .primary-btn-modern:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(39, 174, 96, 0.2);
          filter: brightness(1.1);
        }

        .secondary-btn-modern {
          padding: 14px 30px;
          background: #f1f5f9;
          color: #475569;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .export-btn { background: #27ae60; color: white; display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 8px; font-weight: 700; }
        .print-btn { background: #7f8c8d; color: white; display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 8px; font-weight: 700; }

        .exams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin: 32px 0;
        }

        .exam-card {
           position: relative;
           background: white;
           border: 1px solid #edf2f7;
           box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
           transition: transform 0.2s, box-shadow 0.2s;
           border-radius: 12px;
           padding: 20px;
           display: flex;
           flex-direction: column;
           gap: 16px;
        }

        .exam-card:hover { 
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          border-color: var(--primary);
        }

        .exam-info h3 { color: var(--primary); margin-bottom: 8px; }

        .exam-meta {
          display: flex;
          gap: 16px;
          color: #666;
          font-size: 0.9rem;
        }

        .meta-item { display: flex; align-items: center; gap: 6px; }

        .exam-actions-btns {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }

        .edit-results-btn {
          flex: 1;
          padding: 10px;
          background: var(--primary);
          color: white;
          border-radius: 8px;
          font-weight: 700;
          transition: all 0.2s;
        }

        .edit-results-btn:hover {
          background: var(--secondary);
          transform: translateY(-2px);
        }

        .view-results-btn {
          flex: 1;
          padding: 10px;
          background: #ecf0f1;
          border-radius: 8px;
          font-weight: 700;
          color: var(--primary);
        }

        .section-title-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.85);
          z-index: 2000;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .modal-content {
          background: white;
          width: 100%;
          max-width: 800px;
          border-radius: 20px;
          padding: 30px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .grade-pill {
           padding: 4px 12px;
           border-radius: 20px;
           background: #f1f5f9;
           color: #475569;
           font-size: 0.85rem;
           font-weight: 700;
        }

        .grade-pill.excelent {
           background: #dcfce7;
           color: #15803d;
        }

        @media (max-width: 768px) {
          .form-row-complex { grid-template-columns: 1fr; }
          .form-page-header { padding: 15px 20px; flex-direction: column; align-items: flex-start; gap: 15px; }
          .form-footer-sticky { padding: 15px 20px; }
        }
      `}</style>
    </div>
  );
};

export default ExamsManager;
