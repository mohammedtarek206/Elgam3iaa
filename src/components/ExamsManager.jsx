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
    setShowForm(true);
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
        setShowForm(false);
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

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>{editingId ? 'رصد درجات طلاب وقائمة الاختبار' : 'إضافة اختبار/مسابقة جديدة'}</h3>
              <button className="close-btn" onClick={() => { setShowForm(false); setEditingId(null); }}><X size={24} /></button>
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
                {!editingId ? (
                  <div className="form-group">
                    <label>الفصل المختار</label>
                    <select required value={formData.className} onChange={e => handleClassChange(e.target.value)}>
                      <option value="">اختر الفصل...</option>
                      {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>الفصل (غير قابل للتعديل)</label>
                    <input readOnly value={formData.className} style={{background: '#f9f9f9', cursor: 'not-allowed'}} />
                  </div>
                )}
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

              <div className="results-entry-section">
                <div className="section-title-flex">
                  <h4>رصد درجات الطلاب</h4>
                  <div className="flex-actions" style={{display: 'flex', gap: '10px'}}>
                    <div className="student-search-add">
                      <select 
                        className="inline-input" 
                        style={{width: '200px'}}
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
                        <option value="">إضافة طالب يدوياً...</option>
                        {students.filter(s => !formData.results.find(r => r.studentId === s._id)).map(s => (
                          <option key={s._id} value={s._id}>{s.name} ({s.className})</option>
                        ))}
                      </select>
                    </div>
                    {editingId && (
                      <button type="button" className="refresh-students-btn" onClick={() => {
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
                        if(newOnes.length > 0) {
                          setFormData({...formData, results: [...formData.results, ...newOnes]});
                        }
                      }}>إضافة باقي الفصل</button>
                    )}
                  </div>
                </div>
                <div className="table-container mini">
                  <table>
                    <thead>
                      <tr>
                        <th>الطالب</th>
                        <th>الدرجة</th>
                        <th>التقدير</th>
                        <th>النموذج</th>
                        <th>ملاحظات</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.results.map((res, idx) => (
                        <tr key={idx}>
                          <td className="font-bold">{res.studentName}</td>
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
                          <td>
                            <button 
                              type="button" 
                              className="remove-res-btn" 
                              onClick={() => {
                                const newRes = formData.results.filter((_, i) => i !== idx);
                                setFormData({...formData, results: newRes});
                              }}
                              title="حذف من الاختبار"
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
              
              <div className="form-actions">
                <button type="submit" className="submit-btn">{editingId ? 'تحديث النتائج' : 'حفظ الاختبار'}</button>
                <button type="button" className="cancel-btn" onClick={() => { setShowForm(false); setEditingId(null); }}>إلغاء</button>
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

        .refresh-students-btn {
          background: var(--accent);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .table-container.mini {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #eee;
          border-radius: 8px;
        }

        .modal-content {
          max-width: 800px;
        }

        .exam-card {
          position: relative;
        }

        .exam-delete-btn {
          position: absolute;
          top: 10px;
          left: 10px;
          color: #e74c3c;
          cursor: pointer;
          opacity: 0.3;
          transition: opacity 0.2s;
          padding: 5px;
        }

        .exam-card:hover .exam-delete-btn {
          opacity: 1;
        }

        .remove-res-btn {
          color: #e74c3c;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .student-search-add select {
          border-color: var(--accent);
          color: var(--primary);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default ExamsManager;
