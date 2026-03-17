import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Calendar, Star, Users, CheckCircle, X, FileDown, Printer } from 'lucide-react';
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

  const [showForm, setShowForm] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/exams`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchExams();
        setShowForm(false);
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
          <button className="add-btn" onClick={() => setShowForm(true)}>
            <Plus size={20} />
            إضافة اختبار جديد
          </button>
        </div>
      </div>

      <div className="exams-grid">
        {exams.map(exam => (
          <div key={exam._id} className="exam-card">
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
            <button className="view-results-btn" onClick={() => setViewingResults(exam)}>عرض النتائج ({exam.results?.length || 0})</button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>إضافة اختبار/مسابقة جديدة</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>اسم الاختبار/المسابقة</label>
                  <input required placeholder="مثلاً: اختبار شهر مارس" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>التاريخ</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>الفصل المختار</label>
                  <select required value={formData.className} onChange={e => handleClassChange(e.target.value)}>
                    <option value="">اختر الفصل...</option>
                    {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>المحفظ المختبر (الشيخ)</label>
                  <select required value={formData.examiner} onChange={e => setFormData({...formData, examiner: e.target.value})}>
                    <option value="">اختر الشيخ...</option>
                    {sheikhs.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>نموذج الاختبار الافتراضي</label>
                  <select value={formData.examModel} onChange={e => setFormData({...formData, examModel: e.target.value})}>
                    <option value="أ">نموذج أ</option>
                    <option value="ب">نموذج ب</option>
                    <option value="ج">نموذج ج</option>
                    <option value="د">نموذج د</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>ملاحظات عامة</label>
                  <textarea rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
                </div>
              </div>

              {formData.className && (
                <div className="results-entry-section">
                  <h4>رصد درجات الطلاب - {formData.className}</h4>
                  <div className="table-container mini">
                    <table>
                      <thead>
                        <tr>
                          <th>الطالب</th>
                          <th>الدرجة</th>
                          <th>التقدير</th>
                          <th>النموذج</th>
                          <th>ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.results.map((res, idx) => (
                          <tr key={idx}>
                            <td>{res.studentName}</td>
                            <td>
                              <input 
                                type="number" 
                                className="inline-input" 
                                style={{width: '60px'}}
                                value={res.score} 
                                onChange={e => {
                                  const newRes = [...formData.results];
                                  newRes[idx].score = e.target.value;
                                  setFormData({...formData, results: newRes});
                                }} 
                              />
                            </td>
                            <td>
                              <input 
                                className="inline-input" 
                                value={res.grade} 
                                placeholder="ممتاز..."
                                onChange={e => {
                                  const newRes = [...formData.results];
                                  newRes[idx].grade = e.target.value;
                                  setFormData({...formData, results: newRes});
                                }} 
                              />
                            </td>
                            <td>
                              <select 
                                className="inline-input"
                                value={res.examModel} 
                                onChange={e => {
                                  const newRes = [...formData.results];
                                  newRes[idx].examModel = e.target.value;
                                  setFormData({...formData, results: newRes});
                                }}
                              >
                                <option value="أ">أ</option>
                                <option value="ب">ب</option>
                                <option value="ج">ج</option>
                                <option value="د">د</option>
                              </select>
                            </td>
                            <td>
                              <input 
                                className="inline-input" 
                                value={res.notes} 
                                onChange={e => {
                                  const newRes = [...formData.results];
                                  newRes[idx].notes = e.target.value;
                                  setFormData({...formData, results: newRes});
                                }} 
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className="form-actions">
                <button type="submit" className="submit-btn">حفظ الاختبار</button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    <tr><td colSpan="5" style={{textAlign: 'center'}}>لا توجد نتائج مسجلة</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="modal-footer" style={{marginTop: '20px', textAlign: 'left'}}>
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
                <tr><td colSpan="5" style={{textAlign: 'center'}}>لا توجد نتائج متاحة</td></tr>
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
          border: 2px solid var(--gray-light);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: border-color 0.2s;
        }

        .exam-card:hover { border-color: var(--accent); }

        .exam-info h3 { color: var(--primary); margin-bottom: 8px; }

        .exam-meta {
          display: flex;
          gap: 16px;
          color: #666;
          font-size: 0.9rem;
        }

        .meta-item { display: flex; align-items: center; gap: 6px; }

        .view-results-btn {
          width: 100%;
          padding: 10px;
          background: var(--gray-light);
          border-radius: 8px;
          font-weight: 700;
          color: var(--primary);
        }

        .grade-pill {
          padding: 4px 10px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.8rem;
        }

        .grade-pill.excelent { background: #e8f5e9; color: #2e7d32; }

        .results-entry-section {
          margin-top: 24px;
          border-top: 2px dashed #eee;
          padding-top: 20px;
        }

        .results-entry-section h4 {
          margin-bottom: 12px;
          color: var(--secondary);
        }

        .inline-input {
          padding: 6px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          width: 100%;
        }

        .table-container.mini {
          max-height: 300px;
          overflow-y: auto;
        }

        .modal-content {
          max-width: 800px;
        }
      `}</style>
    </div>
  );
};

export default ExamsManager;
