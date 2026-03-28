import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Calendar, Star, Users, CheckCircle, X, FileDown, Printer, ArrowRight, Settings, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_URL = '/api';

const ExamsManager = () => {
  const [exams, setExams] = useState([]);
  const [sheikhs, setSheikhs] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingResults, setViewingResults] = useState(null);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'form'
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    classNames: [],
    examiner: '',
    notes: '',
    examModel: 'أ',
    results: []
  });

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
      console.error('Error fetching data:', err);
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

  const handleToggleClass = (className) => {
    const newClassNames = formData.classNames.includes(className)
      ? formData.classNames.filter(c => c !== className)
      : [...formData.classNames, className];
    
    // Auto-populate students from classes
    let newResults = [...formData.results];
    
    // If adding a class, add its students
    if (!formData.classNames.includes(className)) {
      const classStudents = students.filter(s => s.className === className);
      classStudents.forEach(s => {
        if (!newResults.find(r => r.studentId === s._id)) {
          newResults.push({
            studentName: s.name,
            studentId: s._id,
            className: s.className,
            score: '',
            grade: '',
            reward: '',
            examModel: formData.examModel,
            examiner: formData.examiner,
            notes: ''
          });
        }
      });
    } else {
      // If removing a class, remove its students
      newResults = newResults.filter(r => r.className !== className);
    }

    setFormData({ ...formData, classNames: newClassNames, results: newResults });
  };

  const openEditForm = (exam) => {
    setFormData({
      name: exam.name,
      date: exam.date,
      classNames: exam.classNames || [exam.className].filter(Boolean),
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
        resetForm();
      }
    } catch (err) {
      console.error('Error saving exam:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      classNames: [],
      examiner: '',
      notes: '',
      examModel: 'أ',
      results: []
    });
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('بعد الحذف لا يمكنك استرجاع البيانات. هل أنت متأكد؟')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/exams/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchExams();
    } catch (err) {
      console.error('Error deleting exam:', err);
    }
  };

  const exportResults = (exam, specificClass = null) => {
    let data = exam.results || [];
    if (specificClass) {
      data = data.filter(r => r.className === specificClass);
    }

    const exportData = data.map(r => ({
      'اسم الطالب': r.studentName,
      'الفصل': r.className || exam.className,
      'الدرجة': r.score,
      'التقدير': r.grade,
      'النموذج': r.examModel || exam.examModel,
      'ملاحظات': r.notes
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "نتائج_الاختبار");
    const filename = specificClass 
      ? `نتائج_${exam.name}_فصل_${specificClass}.xlsx`
      : `نتائج_${exam.name}_كل_الفصول.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  if (currentView === 'form') {
    return (
      <div className="exam-form-page fade-in">
        <div className="form-page-header no-print">
           <div className="header-title-complex">
              <Trophy size={40} color="#f59e0b" />
              <div>
                <h2>{editingId ? 'تعديل الاختبار والنتائج' : 'إنشاء اختبار/مسابقة جديدة'}</h2>
                <p>اختر الفصول المستهدفة ثم ابدأ برصد الدرجات والتقديرات</p>
              </div>
           </div>
           <button className="back-btn-minimal" onClick={() => { setCurrentView('list'); setEditingId(null); resetForm(); }}>
             <ArrowRight size={20} />
             <span>رجوع للقائمة</span>
           </button>
        </div>

        <form onSubmit={handleSubmit} className="premium-exam-form">
          <div className="form-sections-grid">
             <div className="form-card-section">
                <h3 className="section-title"><Calendar size={24} /> الإعدادات العامة</h3>
                <div className="form-row-grid">
                  <div className="form-group-modern">
                    <label>اسم الاختبار / المسابقة</label>
                    <div className="input-with-icon">
                      <Trophy size={18} className="field-icon" />
                      <input required placeholder="مثلاً: مسابقة شهر رمضان" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group-modern">
                    <label>تاريخ الانعقاد</label>
                    <div className="input-with-icon">
                      <Calendar size={18} className="field-icon" />
                      <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group-modern">
                    <label>النموذج الافتراضي</label>
                    <div className="input-with-icon">
                      <Settings size={18} className="field-icon" />
                      <select value={formData.examModel} onChange={e => setFormData({ ...formData, examModel: e.target.value })}>
                        <option value="أ">نموذج أ</option>
                        <option value="ب">نموذج ب</option>
                        <option value="ج">نموذج ج</option>
                        <option value="د">نموذج د</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group-modern" style={{ marginTop: '25px' }}>
                  <label>الفصول المشاركة (يمكنك اختيار أكثر من فصل)</label>
                  <div className="classes-checkbox-grid">
                    {(classes || []).map(c => (
                      <label key={c._id} className={`class-chip ${formData.classNames.includes(c.name) ? 'active' : ''}`}>
                        <input 
                          type="checkbox" 
                          checked={formData.classNames.includes(c.name)}
                          onChange={() => handleToggleClass(c.name)}
                        />
                        <span>{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group-modern" style={{ marginTop: '25px' }}>
                    <label>الممتحن (رئيس اللجنة)</label>
                    <div className="input-with-icon">
                      <Users size={18} className="field-icon" />
                      <select required value={formData.examiner} onChange={e => setFormData({ ...formData, examiner: e.target.value })}>
                        <option value="">اختر الشيخ...</option>
                        {(sheikhs || []).map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
             </div>

             <div className="form-card-section">
                <h3 className="section-title"><Users size={24} /> رصد الدرجات لطلاب الفصول المختارة</h3>
                <div className="modern-table-container">
                  <table className="results-modern-table">
                    <thead>
                      <tr>
                        <th>اسم الطالب</th>
                        <th>الفصل</th>
                        <th style={{ width: '100px' }}>الدرجة</th>
                        <th style={{ width: '130px' }}>التقدير</th>
                        <th style={{ width: '110px' }}>النموذج</th>
                        <th>ملاحظات</th>
                        <th style={{ width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.results.map((res, idx) => (
                        <tr key={idx} className="result-row-card">
                          <td className="student-name-highlight">{res.studentName}</td>
                          <td><span className="class-badge-mini">{res.className}</span></td>
                          <td>
                            <input
                              type="number"
                              className="grade-input-mini"
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
                               <option value="">--</option>
                               <option value="ممتاز">ممتاز</option>
                               <option value="جيد جدا">جيد جدا</option>
                               <option value="جيد">جيد</option>
                               <option value="مقبول">مقبول</option>
                               <option value="ضعيف">ضعيف</option>
                            </select>
                          </td>
                          <td>
                            <select
                              className="grade-input-mini"
                              value={res.examModel || formData.examModel}
                              onChange={e => {
                                const newRes = [...formData.results];
                                newRes[idx].examModel = e.target.value;
                                setFormData({ ...formData, results: newRes });
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
                              className="grade-input-mini"
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
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {formData.results.length === 0 && (
                        <tr><td colSpan="7" style={{textAlign:'center', padding:'40px', color:'#888'}}>يرجى اختيار الفصول لتحميل قائمة الطلاب</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>

          <div className="form-page-footer no-print">
             <button type="button" className="secondary-btn-modern" onClick={() => { setCurrentView('list'); setEditingId(null); resetForm(); }}>إلغاء وتجاهل</button>
             <button type="submit" className="btn-primary-premium">
                <CheckCircle size={22} /> {editingId ? 'حفظ التعديلات' : 'نشر النتائج الآن'}
             </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="exams-manager fade-in">
      <div className="module-header no-print">
        <div className="header-left">
          <h2>الاختبارات والمسابقات</h2>
          <span className="count-badge">السجلات: {(exams || []).length}</span>
        </div>
        <div className="header-actions">
          <button className="add-btn" onClick={() => setCurrentView('form')}>
            <Plus size={20} /> إضافة اختبار جديد
          </button>
        </div>
      </div>

      <div className="exams-grid">
        {(exams || []).map(exam => (
          <div key={exam._id} className="exam-card">
            <div className="exam-card-actions no-print">
               <button onClick={(e) => { e.stopPropagation(); openEditForm(exam); }} title="تعديل"><Settings size={18} /></button>
               <button onClick={(e) => { e.stopPropagation(); handleDeleteExam(exam._id); }} className="danger" title="حذف"><Trash2 size={18} /></button>
            </div>
            
            <div className="exam-icon-large">
              <Trophy size={40} color="#f1c40f" />
            </div>
            
            <div className="exam-main-info">
              <h3>{exam.name}</h3>
              <div className="meta-info">
                <span><Calendar size={14} /> {exam.date}</span>
                <span><Users size={14} /> {exam.classNames?.length || 1} فصول</span>
              </div>
            </div>

            <div className="exam-export-section">
               <p>تحميل النتائج (Excel):</p>
               <div className="export-buttons-mini">
                  <button onClick={() => exportResults(exam)} className="all">كل الفصول</button>
                  {(exam.classNames || []).map(c => (
                    <button key={c} onClick={() => exportResults(exam, c)}>{c}</button>
                  ))}
               </div>
            </div>

            <button className="view-results-btn-primary" onClick={() => setViewingResults(exam)}>
              <Star size={18} /> عرض كشف الدرجات
            </button>
          </div>
        ))}
        {(exams || []).length === 0 && (
          <div className="empty-state-exams full-width">
            <Trophy size={60} color="#ddd" />
            <p>لا توجد اختبارات مسجلة حالياً. ابدأ بإضافة أول اختبار.</p>
          </div>
        )}
      </div>

      {viewingResults && (
        <div className="modal-overlay">
          <div className="modal-content fade-in results-modal-large">
            <div className="modal-header">
              <h3>نتائج: {viewingResults.name}</h3>
              <button className="close-btn" onClick={() => setViewingResults(null)}><X size={24} /></button>
            </div>
            <div className="results-summary-info">
               <div className="sum-item"><span>التاريخ:</span> <strong>{viewingResults.date}</strong></div>
               <div className="sum-item"><span>الممتحن:</span> <strong>{viewingResults.examiner}</strong></div>
               <div className="sum-item"><span>الفصول:</span> <strong>{viewingResults.classNames?.join('، ') || viewingResults.className}</strong></div>
            </div>
            <div className="table-container">
              <table className="view-table-minimal">
                <thead>
                  <tr>
                    <th>اسم الطالب</th>
                    <th>الفصل</th>
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
                      <td>{r.className}</td>
                      <td className="score-cell">{r.score}/100</td>
                      <td><span className={`grade-label ${r.grade}`}>{r.grade}</span></td>
                      <td>{r.examModel || viewingResults.examModel}</td>
                      <td>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer no-print">
               <button className="print-btn-secondary" onClick={() => window.print()}>
                  <Printer size={18} /> طباعة الكشف
               </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .exams-manager { padding: 10px; }
        
        /* Form Styling */
        .exam-form-page { background: #fff; border-radius: 24px; box-shadow: 0 15px 45px rgba(0,0,0,0.06); margin-bottom: 40px; animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid #f1f3f5; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        
        .form-page-header { padding: 35px; border-bottom: 1px solid #f1f3f5; display: flex; justify-content: space-between; align-items: center; background: #fafbfc; border-radius: 24px 24px 0 0; }
        .header-title-complex h2 { margin: 0; color: #1a1a1a; font-size: 1.6rem; font-weight: 800; }
        .header-title-complex p { margin: 8px 0 0; color: #7f8c8d; font-size: 0.95rem; }
        
        .premium-exam-form { padding: 35px; }
        .form-card-section { margin-bottom: 35px; background: #fff; border: 1px solid #f1f3f5; padding: 30px; border-radius: 22px; box-shadow: 0 4px 12px rgba(0,0,0,0.01); }
        .section-title { font-size: 1.25rem; color: var(--secondary); margin-bottom: 30px; border-bottom: 2px solid #f8f9fa; padding-bottom: 15px; display: flex; align-items: center; gap: 14px; font-weight: 800; }
        
        .form-group-modern label { font-size: 0.9rem; font-weight: 700; color: #555; }
        
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-with-icon .field-icon {
          position: absolute;
          right: 12px;
          color: #adb5bd;
          pointer-events: none;
        }
        .input-with-icon input, .input-with-icon select {
          width: 100%;
          padding: 12px 40px 12px 15px;
          border: 1px solid #dee2e6;
          border-radius: 12px;
          font-size: 1rem;
          outline: none;
          transition: 0.2s;
          background: #fafbfc;
        }
        .input-with-icon input:focus, .input-with-icon select:focus {
          border-color: var(--primary);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.08);
        }
        .input-with-icon .field-icon {
          transition: 0.2s;
        }
        .input-with-icon:focus-within .field-icon {
          color: var(--primary);
        }

        /* Fixed Classes Grid */
        .classes-checkbox-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); 
          gap: 12px; 
          margin-top: 10px; 
        }
        .class-chip { 
          padding: 12px 15px; 
          border-radius: 14px; 
          background: #f8f9fa; 
          cursor: pointer; 
          border: 2px solid transparent; 
          transition: 0.3s; 
          font-weight: 700; 
          font-size: 0.9rem; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          text-align: center;
          color: #555;
        }
        .class-chip:hover { background: #f1f3f5; transform: scale(1.02); }
        .class-chip.active { background: #f0fdf4; border-color: #2ecc71; color: #27ae60; box-shadow: 0 4px 10px rgba(46, 204, 113, 0.1); }
        .class-chip input { display: none; }

        /* Results Table */
        .results-modern-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
        .result-row-card { background: #fff; transition: 0.2s; }
        .result-row-card td { padding: 15px; background: #fbfcfd; }
        .result-row-card td:first-child { border-radius: 15px 0 0 15px; }
        .result-row-card td:last-child { border-radius: 0 15px 15px 0; }
        .result-row-card:hover td { background: #f1f8ff; }
        
        .student-name-highlight { font-weight: 800; color: #2c3e50; }
        .grade-input-mini { width: 100%; border: 1px solid #e0e6ed; border-radius: 10px; padding: 10px; outline: none; transition: 0.2s; font-weight: 600; }
        .grade-input-mini:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1); }

        /* Exam Cards Grid */
        .exams-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; margin-top: 35px; }
        .exam-card { 
          position: relative; 
          background: #fff; 
          border-radius: 26px; 
          padding: 28px; 
          border: 1px solid #f1f3f5; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
          display: flex; 
          flex-direction: column; 
          gap: 22px; 
          box-shadow: 0 5px 20px rgba(0,0,0,0.02);
        }
        .exam-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.06); border-color: var(--primary); }
        
        .exam-icon-large { 
          width: 70px; height: 70px; background: #fffcf0; border-radius: 20px; display: flex; align-items: center; justify-content: center; 
          color: #f1c40f; box-shadow: inset 0 0 0 1px rgba(241, 196, 15, 0.05);
        }
        .exam-main-info h3 { margin: 0; font-size: 1.4rem; color: #2c3e50; font-weight: 800; }
        
        .meta-info { display: flex; gap: 18px; margin-top: 10px; color: #7f8c8d; font-size: 0.9rem; font-weight: 600; }
        .meta-info span { display: flex; align-items: center; gap: 7px; background: #f8f9fa; padding: 4px 12px; border-radius: 10px; }

        .exam-export-section { background: #f8fbfc; padding: 18px; border-radius: 18px; border: 1px solid #eff3f6; }
        .exam-export-section p { margin: 0 0 12px; font-size: 0.85rem; font-weight: 800; color: #5d6d7e; }
        .export-buttons-mini { display: flex; flex-wrap: wrap; gap: 8px; }
        .export-buttons-mini button { border: 1px solid #dee2e6; background: #fff; padding: 6px 14px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .export-buttons-mini button:hover { background: #f8f9fa; border-color: #ccd1d9; color: var(--primary); }
        .export-buttons-mini button.all { background: #eef2ff; border-color: #d1d9ff; color: #4338ca; }

        .view-results-btn-primary { width: 100%; border: none; background: #2c3e50; color: white; padding: 16px; border-radius: 18px; font-weight: 800; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 12px rgba(44, 62, 80, 0.15); }
        .view-results-btn-primary:hover { background: #1a252f; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(44, 62, 80, 0.25); }
        .results-modal-large { max-width: 900px; width: 95%; max-height: 90vh; display: flex; flex-direction: column; }
        .results-summary-info { display: flex; gap: 30px; padding: 18px; background: #f8f9fa; border-radius: 15px; margin-bottom: 20px; font-size: 0.95rem; }
        .sum-item span { color: #888; margin-left: 6px; }
        
        .view-table-minimal { width: 100%; border-collapse: collapse; }
        .view-table-minimal th { text-align: right; padding: 12px; background: #f1f3f5; color: #495057; font-size: 0.85rem; }
        .view-table-minimal td { padding: 12px; border-bottom: 1px solid #eee; font-size: 0.95rem; }
        .score-cell { font-weight: 800; color: var(--primary); }
        .grade-label { padding: 3px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 800; background: #f1f3f5; color: #666; }
        .grade-label.ممتاز { background: #ebfbee; color: #2b8a3e; }
        .grade-label.جيد_جدأ { background: #f3f0ff; color: #5f3dc4; }
        .grade-label.جيد { background: #fff9db; color: #f08c00; }
        .grade-label.ضعيف { background: #fff5f5; color: #c92a2a; }

        .modal-footer { padding-top: 20px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; }
        .print-btn-secondary { display: flex; align-items: center; gap: 8px; background: #f8f9fa; color: #333; border: 1px solid #ddd; padding: 8px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }

        .empty-state-exams { text-align: center; padding: 60px; color: #aaa; grid-column: 1 / -1; }
        
        @media print {
          .no-print { display: none !important; }
          .modal-overlay { background: none; position: static; }
          .modal-content { box-shadow: none; border: none; width: 100%; max-width: none; }
          .results-summary-info { border: 1px solid #eee; }
        }
      `}</style>
    </div>
  );
};

export default ExamsManager;
