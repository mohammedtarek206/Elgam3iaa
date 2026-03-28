import React, { useState, useEffect } from 'react';
import { Plus, Search, Wallet, TrendingUp, TrendingDown, Clock, Calendar, FileDown, Printer, X, Users, UserCheck, Settings, Receipt, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_URL = '/api';

const FinanceManager = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [transactions, setTransactions] = useState(() => {
    const cached = JSON.parse(localStorage.getItem('cache_transactions'));
    return Array.isArray(cached) ? cached : [];
  });
  const [students, setStudents] = useState(() => {
    const cached = JSON.parse(localStorage.getItem('cache_students'));
    return Array.isArray(cached) ? cached : [];
  });
  const [sheikhs, setSheikhs] = useState(() => {
    const cached = JSON.parse(localStorage.getItem('cache_sheikhs'));
    return Array.isArray(cached) ? cached : [];
  });
  const [classes, setClasses] = useState(() => {
    const cached = JSON.parse(localStorage.getItem('cache_classes'));
    return Array.isArray(cached) ? cached : [];
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [transRes, initRes] = await Promise.all([
        fetch(`${API_URL}/transactions`, { headers }),
        fetch(`${API_URL}/init-data`, { headers })
      ]);
      const [transData, initData] = await Promise.all([
        transRes.json(),
        initRes.json()
      ]);
      if (Array.isArray(transData)) {
        setTransactions(transData);
        localStorage.setItem('cache_transactions', JSON.stringify(transData));
      } else {
        console.error('Invalid transactions data:', transData);
      }
      
      if (initData.students && Array.isArray(initData.students)) {
        setStudents(initData.students);
        localStorage.setItem('cache_students', JSON.stringify(initData.students));
      }
      
      if (initData.sheikhs && Array.isArray(initData.sheikhs)) {
        setSheikhs(initData.sheikhs);
        localStorage.setItem('cache_sheikhs', JSON.stringify(initData.sheikhs));
      }
      
      if (initData.classes && Array.isArray(initData.classes)) {
        setClasses(initData.classes);
        localStorage.setItem('cache_classes', JSON.stringify(initData.classes));
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'دخل',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const stats = {
    totalIncome: transactions.filter(t => t.type === 'دخل').reduce((acc, t) => acc + (t.amount || 0), 0),
    totalExpense: transactions.filter(t => t.type === 'مصروف').reduce((acc, t) => acc + (t.amount || 0), 0),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchData();
        setShowForm(false);
        setFormData({
          type: 'دخل',
          category: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          notes: '',
          refId: '',
          refName: ''
        });
      }
    } catch (err) {
      console.error('Error saving transaction:', err);
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredTransactions.map(t => ({
      'التاريخ': t.date,
      'البيان': t.notes || t.category, // Assuming notes or category can be a 'title'
      'الفئة': t.category,
      'النوع': t.type === 'دخل' ? 'إيراد' : 'مصروف',
      'المبلغ': t.amount
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "المالية.xlsx");
  };

  const filteredTransactions = (transactions || []).filter(t =>
    t && ((t.notes && t.notes.includes(searchTerm)) || (t.category && t.category.includes(searchTerm)))
  );
  
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المعاملة؟')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'فشل الحذف');
      }
    } catch (err) {
      alert('خطأ في الاتصال بالسيرفر');
    }
  };

  const renderPersonList = (list, type) => (
    <div className="person-selection-grid">
      <div className="list-side">
        <div className="filter-controls">
          <div className="search-mini">
            <Search size={16} />
            <select 
              className="class-filter-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">كل الفصول</option>
              {(classes || []).map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="search-mini">
            <Search size={16} />
            <input 
              placeholder="بحث بالاسم..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="scroll-list">
          {(list || []).filter(p => {
            if (!p) return false;
            const matchesClass = !selectedClass || (type === 'student' ? p.className === selectedClass : (p.assignedClasses || []).includes(selectedClass));
            const matchesName = (p.name || '').includes(searchTerm);
            return matchesClass && matchesName;
          }).map(p => (
            <div 
              key={p._id} 
              className={`person-item ${selectedPerson?._id === p._id ? 'active' : ''}`}
              onClick={() => setSelectedPerson(p)}
            >
              <span>{p.name}</span>
              <small>{type === 'student' ? p.className : (p.assignedClasses || []).join(', ')}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="details-side">
        {selectedPerson ? (
          <div className="person-details fade-in">
            <div className="detail-header">
              <h4>{selectedPerson.name}</h4>
              <button className="add-pay-btn" onClick={() => {
                setFormData({
                  ...formData,
                  type: type === 'student' ? 'دخل' : 'مصروف',
                  category: type === 'student' ? 'رسوم طلاب' : 'راتب',
                  refId: selectedPerson._id,
                  refName: selectedPerson.name
                });
                setShowForm(true);
              }}>
                <Plus size={16} />
                {type === 'student' ? 'تسجيل دفعة' : 'صرف مبلغ'}
              </button>
            </div>
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>البيان</th>
                    <th>المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {(transactions || []).filter(t => t && t.refId === selectedPerson._id).map(t => (
                    <tr key={t._id}>
                      <td>{t.date}</td>
                      <td>{t.category}</td>
                      <td>{t.amount} ج.م</td>
                      {JSON.parse(localStorage.getItem('user'))?.role === 'admin' && (
                        <td className="no-print">
                          <button className="delete-btn-mini" onClick={() => handleDeleteTransaction(t._id)}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {(transactions || []).filter(t => t && t.refId === selectedPerson._id).length === 0 && (
                    <tr><td colSpan="3" style={{textAlign:'center'}}>لا توجد سجلات مالية</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="empty-selection">
            <Users size={40} />
            <p>اختر {type === 'student' ? 'طالباً' : 'شيخاً'} لعرض السجل المالي</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="finance-manager">
      <div className="module-header no-print">
        <div className="header-left">
          <h2>إدارة المالية</h2>
          <span className="count-badge">سجل المعاملات</span>
        </div>
        <div className="header-actions">
          <button className="add-btn" onClick={() => setShowForm(true)}>
            <Plus size={20} />
            إضافة معاملة
          </button>
          <button className="export-btn" onClick={exportToExcel} title="تصدير إلى إكسيل">
            <FileDown size={20} />
            تصدير
          </button>
          <button className="print-btn" onClick={() => window.print()} title="طباعة">
            <Printer size={20} />
            طباعة
          </button>
        </div>
      </div>

      <div className="finance-tabs">
        <button className={activeTab === 'summary' ? 'active' : ''} onClick={() => setActiveTab('summary')}>
          <Wallet size={18} /> ملخص مالي
        </button>
        <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
          <Users size={18} /> مدفوعات الطلاب
        </button>
        <button className={activeTab === 'sheikhs' ? 'active' : ''} onClick={() => setActiveTab('sheikhs')}>
          <UserCheck size={18} /> رواتب ومكافآت
        </button>
        <button className={activeTab === 'other' ? 'active' : ''} onClick={() => setActiveTab('other')}>
          <Settings size={18} /> مصروفات أخرى
        </button>
      </div>

      <div className="tab-container">
        {activeTab === 'summary' && (
          <div className="finance-summary no-print">
            <div className="stats-grid">
              <div className="stat-card income">
                <TrendingUp size={32} />
                <div className="stat-info">
                  <span>إجمالي الإيرادات</span>
                  <strong>{stats.totalIncome} ج.م</strong>
                </div>
              </div>
              <div className="stat-card expense">
                <TrendingDown size={32} />
                <div className="stat-info">
                  <span>إجمالي المصروفات</span>
                  <strong>{stats.totalExpense} ج.م</strong>
                </div>
              </div>
              <div className="stat-card balance">
                <Wallet size={32} />
                <div className="stat-info">
                  <span>الرصيد المتبقي</span>
                  <strong>{stats.totalIncome - stats.totalExpense} ج.م</strong>
                </div>
              </div>
            </div>

            <div className="recent-transactions">
              <div className="section-header">
                <h3>آخر العمليات المالية</h3>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>التاريخ</th>
                      <th>البيان</th>
                      <th>القيمة</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredTransactions || []).map((t, index) => (
                      <tr key={t?._id || index}>
                        <td>{index + 1}</td>
                        <td>{t?.date}</td>
                        <td>{t?.notes || t?.category}</td>
                        <td className={t?.type === 'دخل' ? 'text-green' : 'text-red'}>
                          {t?.type === 'دخل' ? '+' : '-'}{t?.amount} ج.م
                        </td>
                        <td>
                          <span className={`status-pill ${t?.type === 'دخل' ? 'income' : 'expense'}`}>
                            {t?.type === 'دخل' ? 'إيراد' : 'مصروف'}
                          </span>
                        </td>
                        {JSON.parse(localStorage.getItem('user'))?.role === 'admin' && (
                          <td className="no-print">
                            <button className="delete-btn-table" onClick={() => handleDeleteTransaction(t?._id)} title="حذف">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'students' && renderPersonList(students, 'student')}
        {activeTab === 'sheikhs' && renderPersonList(sheikhs, 'sheikh')}
        {activeTab === 'other' && (
          <div className="placeholder-section fade-in">
            <Settings size={48} color="#ccc" />
            <p>هنا يتم تسجيل المصاريف الإدارية (مرافق، أدوات مكتبية، صيانة).</p>
            <button className="add-btn" onClick={() => { setFormData({...formData, type: 'مصروف', category: 'مصاريف إدارية', refId: '', refName: ''}); setShowForm(true); }}>تسجيل مصروف إداري</button>
            <div className="history-table" style={{width: '100%', marginTop: '20px'}}>
              <table>
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>البيان</th>
                    <th>المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.filter(t => t.category === 'مصاريف إدارية' || (!t.refId && t.type === 'مصروف')).map(t => (
                    <tr key={t._id}>
                      <td>{t.date}</td>
                      <td>{t.notes || t.category}</td>
                      <td>{t.amount} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay no-print">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>إضافة عملية مالية جديدة</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>نوع العملية</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="دخل">إيراد (+)</option>
                    <option value="مصروف">مصروف (-)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>الفئة</label>
                  <input required placeholder="مثلاً: رسوم طلاب، راتب، صيانة..." value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>المبلغ (ج.م)</label>
                  <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>التاريخ</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div className="form-group full-width" style={{marginTop: '20px'}}>
                <label>ملاحظات</label>
                <textarea rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">حفظ العملية</button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .finance-manager {
          background: var(--white);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow);
        }

        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--gray-light);
        }

        .module-header .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .module-header h2 {
          margin: 0;
          font-size: 1.8rem;
          color: var(--text-color);
        }

        .module-header .count-badge {
          background: var(--primary-light);
          color: var(--primary);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .module-header .header-actions {
          display: flex;
          gap: 10px;
        }

        .module-header .header-actions button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 15px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .module-header .header-actions .export-btn {
          background: #28a745; /* Green for export */
          color: white;
          border: none;
        }

        .module-header .header-actions .export-btn:hover {
          background: #218838;
        }

        .module-header .header-actions .print-btn {
          background: #007bff; /* Blue for print */
          color: white;
          border: none;
        }

        .module-header .header-actions .print-btn:hover {
          background: #0069d9;
        }

        .module-header .header-actions .add-btn {
          background: var(--primary);
          color: white;
          border: none;
        }

        .module-header .header-actions .add-btn:hover {
          background: var(--primary-dark);
        }

        .search-bar {
          display: flex;
          align-items: center;
          background: var(--gray-light);
          border-radius: var(--radius);
          padding: 8px 15px;
          margin-bottom: 24px;
        }

        .search-bar input {
          border: none;
          background: transparent;
          flex-grow: 1;
          padding: 5px 10px;
          font-size: 1rem;
        }

        .search-bar input:focus {
          outline: none;
        }

        .search-bar .search-icon {
          color: var(--text-color-light);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          padding: 24px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 20px;
          color: var(--white);
        }

        .stat-card.income { background: #2ecc71; }
        .stat-card.expense { background: #e74c3c; }
        .stat-card.balance { background: #3498db; }

        .stat-info span { font-size: 0.9rem; opacity: 0.9; }
        .stat-info strong { font-size: 1.6rem; display: block; }

        .finance-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          margin-bottom: 24px;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--gray-light);
        }

        .finance-tabs button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 700;
          color: #666;
          white-space: nowrap;
        }

        .finance-tabs button.active {
          background: var(--primary);
          color: var(--white);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .text-green { color: #2ecc71; font-weight: 700; }
        .text-red { color: #e74c3c; font-weight: 700; }

        .status-pill {
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .status-pill.income { background: #e8f5e9; color: #2e7d32; }
        .status-pill.expense { background: #ffebee; color: #c62828; }

        .placeholder-section {
          padding: 60px;
          text-align: center;
          color: #888;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 10px;
        }

        .add-btn.secondary {
          background: var(--secondary);
        }

        .person-selection-grid {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 20px;
          height: 600px;
        }

        .list-side {
          border-left: 1px solid var(--gray-light);
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .search-mini {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8f9fa;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #eee;
        }

        .filter-controls {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 15px;
        }

        .class-filter-select {
          border: none;
          background: transparent;
          font-family: inherit;
          font-size: 0.9rem;
          color: var(--text-color);
          width: 100%;
          cursor: pointer;
        }

        .search-mini input {
          border: none;
          background: transparent;
          font-family: inherit;
          font-size: 0.9rem;
          color: var(--text-color);
          width: 100%;
        }

        .scroll-list {
          overflow-y: auto;
          flex: 1;
        }

        .person-item {
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
        }

        .person-item:hover { background: var(--gray-light); }
        .person-item.active { background: var(--primary-light); color: var(--primary); }
        .person-item small { opacity: 0.7; font-size: 0.8rem; }

        .details-side {
          display: flex;
          flex-direction: column;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid var(--gray-light);
        }

        .add-pay-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--accent);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .empty-selection {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #ccc;
          gap: 15px;
        }

        .history-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .history-table th { background: #f8f9fa; padding: 12px; text-align: right; font-size: 0.9rem; }
        .history-table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 0.95rem; }

        .delete-btn-table, .delete-btn-mini {
          padding: 6px;
          border-radius: 6px;
          color: #e74c3c;
          background: #fdedec;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-btn-table:hover, .delete-btn-mini:hover {
          background: #e74c3c;
          color: white;
        }

        @media (max-width: 768px) {
          .person-selection-grid {
            grid-template-columns: 1fr;
            height: auto;
          }
          .list-side {
            border-left: none;
            border-bottom: 1px solid var(--gray-light);
            padding-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default FinanceManager;
