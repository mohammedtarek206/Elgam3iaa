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
           <button className="back-btn-minimal" onClick={() => { setCurrentView('list'); setEditingId(null); }}>
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
        /* --- General Layout --- */
        .exams-manager {
          padding: 30px;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* --- Full Screen Form View --- */
        .exam-form-page {
          background: #fdfdfd;
          min-height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          direction: rtl;
        }

        /* Clean Header */
        .form-page-header {
          background: white;
          padding: 15px 50px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #edf2f7;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .header-left-side {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .header-title-complex h2 {
          margin: 0;
          font-size: 1.6rem;
          color: #1a202c;
          font-weight: 800;
        }

        .header-title-complex p {
          margin: 0;
          color: #718096;
          font-size: 0.85rem;
        }

        .back-btn-minimal {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          color: #4a5568;
          font-weight: 700;
          border-radius: 10px;
          background: #f7fafc;
          transition: all 0.2s;
        }

        .back-btn-minimal:hover {
          background: #edf2f7;
          color: #2d3748;
          transform: translateX(3px);
        }

        /* The Form Container */
        .premium-exam-form {
          flex: 1;
          width: 100%;
          max-width: 1100px;
          margin: 40px auto;
          padding: 0 20px 120px 20px;
        }

        .form-sections-grid {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        /* Premium Minimalist Cards */
        .form-glass-card {
           background: white;
           border-radius: 24px;
           padding: 40px;
           border: 1px solid #f1f5f9;
           box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
           position: relative;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 1.4rem;
          font-weight: 800;
          color: #1a365d;
          margin-bottom: 35px;
          position: relative;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          right: 0;
          width: 60px;
          height: 4px;
          background: var(--accent);
          border-radius: 2px;
        }

        /* Form Rows */
        .form-row-complex {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 25px;
        }

        .form-group-modern {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .form-group-modern label {
          font-weight: 700;
          color: #4a5568;
          font-size: 0.95rem;
          margin-right: 5px;
        }

        .form-group-modern input, 
        .form-group-modern select {
          padding: 14px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          font-size: 1rem;
          background: #f8fafc;
          transition: all 0.2s;
          width: 100%;
        }

        .form-group-modern input:focus,
        .form-group-modern select:focus {
          border-color: var(--primary);
          background: white;
          outline: none;
          box-shadow: 0 0 0 4px rgba(39, 174, 96, 0.08);
        }

        .readonly-input {
          background: #edf2f7;
          color: #718096;
          cursor: not-allowed;
        }

        /* Results Table Enhancement */
        .results-actions-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          gap: 20px;
        }

        .student-adder { flex: 1; }

        .premium-select {
          width: 100%;
          max-width: 400px;
          padding: 12px 20px;
          border: 2px solid var(--accent);
          border-radius: 14px;
          font-weight: 700;
          color: var(--primary);
          appearance: none;
          background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat left 15px center;
        }

        .refresh-btn-glass {
          background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
          color: #0369a1;
          padding: 12px 24px;
          border-radius: 14px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          white-space: nowrap;
        }

        .refresh-btn-glass:hover {
          filter: brightness(1.05);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(3, 105, 161, 0.15);
        }

        /* Modern Table */
        .modern-table-container {
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          background: white;
        }

        .premium-table {
          width: 100%;
          border-collapse: collapse;
        }

        .premium-table th {
          background: #f8fafc;
          padding: 20px;
          text-align: right;
          color: #4a5568;
          font-weight: 800;
          border-bottom: 2px solid #edf2f7;
        }

        .premium-table td {
          padding: 15px 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .st-name-cell {
          font-weight: 800;
          color: #2d3748;
        }

        .table-input {
          padding: 10px 15px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          width: 100%;
          transition: border-color 0.2s;
        }

        .table-input:focus {
          border-color: var(--primary);
          outline: none;
          background: #fff;
        }

        .delete-row-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #fff5f5;
          color: #fc8181;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .delete-row-btn:hover {
          background: #feb2b2;
          color: white;
        }

        /* Sticky Footer */
        .form-footer-sticky {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          padding: 25px 50px;
          display: flex;
          justify-content: flex-end;
          gap: 20px;
          border-top: 1px solid #edf2f7;
          box-shadow: 0 -10px 30px rgba(0,0,0,0.05);
          z-index: 1000;
        }

        .primary-btn-modern {
          padding: 15px 45px;
          background: var(--primary);
          color: white;
          border-radius: 16px;
          font-weight: 800;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(25, 135, 84, 0.2);
        }

        .primary-btn-modern:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(25, 135, 84, 0.3);
          filter: brightness(1.1);
        }

        .secondary-btn-modern {
          padding: 15px 35px;
          background: #f7fafc;
          color: #4a5568;
          border-radius: 16px;
          font-weight: 700;
        }

        /* --- List View Styling --- */
        .exams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 30px;
          margin-top: 40px;
        }

        .exam-card {
           background: white;
           border-radius: 20px;
           padding: 24px;
           border: 1px solid #edf2f7;
           box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
           transition: all 0.3s;
           position: relative;
           display: flex;
           flex-direction: column;
           gap: 20px;
        }

        .exam-card:hover { 
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
          border-color: var(--accent);
        }

        /* Clean badges & indicators */
        .grade-pill {
           padding: 6px 14px;
           border-radius: 10px;
           background: #f1f5f9;
           color: #475569;
           font-size: 0.85rem;
           font-weight: 800;
        }

        .grade-pill.excelent {
           background: #dcfce7;
           color: #166534;
        }

        /* --- Responsive Fixes --- */
        @media (max-width: 900px) {
          .form-row-complex { grid-template-columns: 1fr; }
          .premium-exam-form { margin: 20px auto; padding: 0 15px 120px 15px; }
          .form-page-header { padding: 15px 20px; }
          .form-footer-sticky { padding: 20px; flex-direction: column-reverse; }
          .form-footer-sticky button { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ExamsManager;

    </div>
  );
};

export default ExamsManager;
