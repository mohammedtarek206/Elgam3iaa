import React, { useState, useEffect } from 'react';
import { Gift, Heart, ShieldCheck, Plus, Search, User, X, FileDown, Printer, Star, Trash2, Users, Wallet, HandCoins, Building2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_URL = '/api';

const GrantsManager = () => {
  const [grants, setGrants] = useState([]);
  const [students, setStudents] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [showDonorForm, setShowDonorForm] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [activeTab, setActiveTab] = useState('distributions');
  const [editingDonor, setEditingDonor] = useState(null);
  const [fundStats, setFundStats] = useState({
    grantFundBalance: 0,
    inKindCount: 0,
    recentInKind: []
  });
  
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch(e) { return null; }
  });

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [grantFormData, setGrantFormData] = useState({
    studentIds: [],
    studentNames: '',
    type: 'السداد لغير القادرين',
    amount: '',
    unit: '',
    donorId: '',
    donorName: '',
    date: new Date().toISOString().split('T')[0],
    reason: ''
  });

  const [donorFormData, setDonorFormData] = useState({
    name: '',
    type: 'فرد',
    phone: '',
    notes: '',
    initialAmount: '',
    initialUnit: ''
  });

  const [donationFormData, setDonationFormData] = useState({
    donorId: '',
    type: 'نقدي',
    amount: '',
    itemName: '',
    quantity: '',
    unit: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [grantsRes, donorsRes, initRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/grants`, { headers }),
        fetch(`${API_URL}/donors`, { headers }),
        fetch(`${API_URL}/init-data`, { headers }),
        fetch(`${API_URL}/stats`, { headers })
      ]);
      const grantsData = await grantsRes.json();
      const donorsData = await donorsRes.json();
      const initData = await initRes.json();
      const statsData = await statsRes.json();

      if (Array.isArray(grantsData)) setGrants(grantsData);
      if (Array.isArray(donorsData)) setDonors(donorsData);
      if (initData && initData.students) setStudents(initData.students);
      if (statsData) {
        setFundStats({
          grantFundBalance: statsData.grantFundBalance || 0,
          inKindCount: statsData.inKindCount || 0,
          recentInKind: statsData.recentInKind || []
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const handleGrantSubmit = async (e) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      alert('يرجى اختيار طالب واحد على الأقل');
      return;
    }

    const token = localStorage.getItem('token');
    const studentNames = selectedStudents.map(s => s.name).join('، ');
    const studentIds = selectedStudents.map(s => s._id);

    const payload = {
      ...grantFormData,
      studentIds,
      studentNames,
      donorName: donors.find(d => d._id === grantFormData.donorId)?.name || ''
    };

    try {
      const res = await fetch(`${API_URL}/grants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchData();
        setShowGrantForm(false);
        setSelectedStudents([]);
        setGrantFormData({
          studentIds: [],
          studentNames: '',
          type: 'السداد لغير القادرين',
          amount: '',
          quantityPerStudent: '',
          itemName: '',
          unit: '',
          donorId: '',
          donorName: '',
          date: new Date().toISOString().split('T')[0],
          reason: ''
        });
      }
    } catch (err) {
      console.error('Error saving grant:', err);
    }
  };

  const handleDonorSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingDonor ? `${API_URL}/donors/${editingDonor._id}` : `${API_URL}/donors`;
    const method = editingDonor ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(donorFormData)
      });
      if (res.ok) {
        fetchData();
        setShowDonorForm(false);
        setEditingDonor(null);
        setDonorFormData({ name: '', type: 'فرد', phone: '', notes: '', initialAmount: '', initialUnit: '' });
      }
    } catch (err) {
      console.error('Error saving donor:', err);
    }
  };

  const handleDeleteDonor = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المتبرع؟ سيتم منع الحذف إذا كان هناك رصيد متبقي.')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/donors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        fetchData();
      } else {
        alert(data.message || 'خطأ في الحذف');
      }
    } catch (err) {
      console.error('Error deleting donor:', err);
    }
  };

  const handleEditDonor = (donor) => {
    setEditingDonor(donor);
    setDonorFormData({
      name: donor.name,
      type: donor.type,
      phone: donor.phone || '',
      notes: donor.notes || '',
      initialAmount: '',
      initialUnit: ''
    });
    setShowDonorForm(true);
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(donationFormData)
      });
      if (res.ok) {
        fetchData();
        setShowDonationForm(false);
        setDonationFormData({ donorId: '', type: 'نقدي', amount: '', itemName: '', quantity: '', unit: '', date: new Date().toISOString().split('T')[0], notes: '' });
      }
    } catch (err) {
      console.error('Error recording donation:', err);
    }
  };

  const handleDeleteGrant = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/grants/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Error deleting grant:', err);
    }
  };

  const toggleStudentSelection = (student) => {
    if (selectedStudents.some(s => s._id === student._id)) {
      setSelectedStudents(selectedStudents.filter(s => s._id !== student._id));
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const exportToExcel = () => {
    const dataToExport = grants.map(g => ({
      'الطلاب المستفيدين': g.studentNames,
      'نوع المنحة': g.type,
      'القيمة الإجمالية': g.amount || g.unit,
      'المتبرع': g.donorName || (g.donorId?.name),
      'التاريخ': g.date,
      'السبب': g.reason
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Grants");
    XLSX.writeFile(wb, "سجل_المنح_المطور.xlsx");
  };

  const filteredStudents = (students || []).filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.className && s.className.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  return (
    <div className="grants-manager fade-in">
      <div className="module-header no-print">
        <div className="header-title-tabs">
          <h2>المنح والتدفقات الخيرية</h2>
          <div className="tab-pill-container">
            <button className={`tab-pill ${activeTab === 'distributions' ? 'active' : ''}`} onClick={() => setActiveTab('distributions')}>
              <HandCoins size={18} /> توزيع المنح
            </button>
            <button className={`tab-pill ${activeTab === 'donors' ? 'active' : ''}`} onClick={() => setActiveTab('donors')}>
              <Users size={18} /> المتبرعين والجهات
            </button>
          </div>
        </div>
        <div className="header-actions">
          <button className="import-btn" onClick={() => setShowDonationForm(true)} title="تسجيل تبرع جديد">
            <Wallet size={20} />
            تسجيل تبرع
          </button>
          <button className="add-btn" onClick={() => setShowGrantForm(true)}>
            <Plus size={20} />
            إضافة منحة جديدة
          </button>
        </div>
      </div>

      <div className="grants-summary-cards" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', margin: '20px 0'}}>
        <div className="summary-card balance" style={{background: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)', color: 'white', padding: '24px', borderRadius: '15px', boxShadow: '0 8px 16px rgba(241, 196, 15, 0.2)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <span style={{fontSize: '0.9rem', opacity: '0.9'}}>رصيد صندوق المنح</span>
              <h2 style={{fontSize: '2rem', margin: '10px 0'}}>{fundStats.grantFundBalance.toLocaleString()} <small style={{fontSize: '0.8rem'}}>ج.م</small></h2>
            </div>
            <HandCoins size={48} opacity={0.5} />
          </div>
          <p style={{fontSize: '0.8rem', margin: '0', opacity: '0.8'}}>المتاح حالياً للتوزيع النقدي</p>
        </div>

        <div className="summary-card in-kind" style={{background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)', color: 'white', padding: '24px', borderRadius: '15px', boxShadow: '0 8px 16px rgba(231, 76, 60, 0.2)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <span style={{fontSize: '0.9rem', opacity: '0.9'}}>إجمالي التبرعات العينية</span>
              <h2 style={{fontSize: '2rem', margin: '10px 0'}}>{fundStats.inKindCount} <small style={{fontSize: '0.8rem'}}>وحدة/عملية</small></h2>
            </div>
            <Gift size={48} opacity={0.5} />
          </div>
          <p style={{fontSize: '0.8rem', margin: '0', opacity: '0.8'}}>شنط رمضان ودعم سلعي</p>
        </div>
      </div>

      {activeTab === 'distributions' ? (
        <>
          <div className="grants-grid">
            <div className="grant-type-card">
              <div className="icon-wrapper">
                <ShieldCheck size={36} color="#2ecc71" />
              </div>
              <h3>السداد لغير القادرين</h3>
              <p>سداد الرسوم عن الطلاب المتعثرين مادياً.</p>
            </div>
            <div className="grant-type-card">
              <div className="icon-wrapper">
                <Heart size={36} color="#e74c3c" />
              </div>
              <h3>دعم مادي</h3>
              <p>مساعدات مالية مباشرة للحالات الإنسانية.</p>
            </div>
            <div className="grant-type-card">
              <div className="icon-wrapper">
                <Gift size={36} color="#f1c40f" />
              </div>
              <h3>دعم عيني</h3>
              <p>توزيع أدوات، ملابس، أو مواد تموينية.</p>
            </div>
            <div className="grant-type-card">
              <div className="icon-wrapper">
                <Star size={36} color="#3498db" />
              </div>
              <h3>منحة حفظ</h3>
              <p>مكافآت التميز في حفظ القرآن الكريم.</p>
            </div>
          </div>

          <div className="recent-grants">
            <div className="section-header-flex">
              <h3>سجل توزيع المنح</h3>
              <div className="header-tools">
                <button className="export-btn-mini" onClick={exportToExcel}><FileDown size={18} /> تصدير</button>
                <div className="search-mini">
                  <Search size={18} />
                  <input placeholder="بحث في السجل..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>الطلاب المستفيدين</th>
                    <th>نوع المنحة</th>
                    <th>القيمة/الوحدة</th>
                    <th>المتبرع</th>
                    <th>التاريخ</th>
                    <th className="no-print">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {(grants || []).filter(g => (g.studentNames || '').includes(searchTerm)).map(g => (
                    <tr key={g._id}>
                      <td>
                        <div className="multi-student-cell">
                          <span className="count-tag">{g.studentIds?.length || 1} طلاب</span>
                          <span className="names-list">{g.studentNames}</span>
                        </div>
                      </td>
                      <td><span className={`type-tag ${g.type === 'دعم عيني' ? 'kind' : 'money'}`}>{g.type}</span></td>
                      <td><strong className="amount-text">{g.type === 'دعم عيني' ? (g.unit || '---') : `${g.amount || 0} ج.م`}</strong></td>
                      <td>{g.donorName || g.donorId?.name || '---'}</td>
                      <td>{g.date}</td>
                      <td className="no-print">
                        <button className="delete-btn-table" onClick={() => handleDeleteGrant(g._id)}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {grants.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>لا يوجد سجل منح حتى الآن</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="donors-section fade-in">
          <div className="donors-header">
            <h3>قائمة المتبرعين والجهات المانحة</h3>
            <button className="add-donor-btn" onClick={() => setShowDonorForm(true)}><Building2 size={18} /> إضافة متبرع/جهة</button>
          </div>
          <div className="donors-grid">
            {donors.map(donor => (
              <div key={donor._id} className="donor-card">
                <div className="donor-card-main">
                  <div className="donor-avatar"><User size={24} /></div>
                  <div className="donor-meta">
                    <h4>{donor.name}</h4>
                    <span>{donor.type} | {donor.phone || 'بدون هاتف'}</span>
                  </div>
                  {user?.role === 'admin' && (
                    <div className="donor-actions no-print">
                      <button className="edit-btn-mini" onClick={() => handleEditDonor(donor)} title="تعديل"><Search size={16} /></button>
                      <button className="delete-btn-mini" onClick={() => handleDeleteDonor(donor._id)} title="حذف"><Trash2 size={16} /></button>
                    </div>
                  )}
                </div>
                <div className="donor-stats">
                  <div className="stat-item">
                    <small>إجمالي التبرعات</small>
                    <strong>{donor.totalDonated?.toLocaleString() || 0} ج.م</strong>
                  </div>
                  <div className="stat-item">
                    <small>الرصيد المادي المتبقي</small>
                    <strong className={(donor.balance || 0) > 0 ? 'pos' : ''}>{donor.balance?.toLocaleString() || 0} ج.م</strong>
                  </div>
                </div>

                {donor.inKindTotals && Object.keys(donor.inKindTotals).length > 0 && (
                  <div className="donor-stock-detailed-view" style={{marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '10px'}}>
                    <small style={{display: 'block', color: '#666', marginBottom: '8px', fontWeight: 'bold'}}>المخزون العيني المتوفر:</small>
                    <div className="stock-table" style={{fontSize: '0.8rem', width: '100%'}}>
                      <div className="stock-header" style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr', gap: '5px', paddingBottom: '5px', borderBottom: '1px dashed #ddd', fontWeight: 'bold', color: '#888'}}>
                        <span>الصنف</span>
                        <span>الوارد</span>
                        <span>المنصرف</span>
                        <span>المتبقي</span>
                      </div>
                      {Object.entries(donor.inKindTotals).map(([item, stats], idx) => (
                        <div key={idx} className="stock-row" style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr', gap: '5px', padding: '6px 0', borderBottom: '1px solid #f9f9f9', alignItems: 'center'}}>
                          <span style={{fontWeight: 'bold', color: '#444'}}>{item}</span>
                          <span style={{color: '#27ae60'}}>{stats.received || 0}</span>
                          <span style={{color: '#e67e22'}}>{stats.distributed || 0}</span>
                          <span style={{
                            background: (donor.inKindStock?.[item] || 0) > 0 ? '#e8f5e9' : '#ffebee', 
                            color: (donor.inKindStock?.[item] || 0) > 0 ? '#2e7d32' : '#c62828',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            textAlign: 'center',
                            fontWeight: 'bold'
                          }}>
                            {donor.inKindStock?.[item] || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {donor.fullHistory && donor.fullHistory.length > 0 && (
                  <div className="donor-full-history" style={{marginTop: '15px', background: '#fcfcfc', padding: '10px', borderRadius: '8px', border: '1px solid #eee'}}>
                    <small style={{display: 'block', color: '#666', marginBottom: '8px', fontWeight: 'bold'}}>سجل الحركة الكامل (مالي وعيني):</small>
                    <div className="history-scroll-list" style={{maxHeight: '120px', overflowY: 'auto', fontSize: '0.75rem'}}>
                      {donor.fullHistory.map((h, i) => (
                        <div key={i} className="history-row" style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 80px',
                          padding: '4px 0', 
                          borderBottom: '1px solid #f0f0f0',
                          color: h.type === 'دخل' ? '#27ae60' : '#e67300'
                        }}>
                          <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={h.notes}>
                            {h.type === 'دخل' ? '📥' : '📤'} {h.itemName || h.category || 'عام'}
                          </span>
                          <span style={{fontWeight: 'bold', textAlign: 'left'}}>
                            {h.amount > 0 ? `${h.amount} ج.م` : `${h.quantity} ق`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {donors.length === 0 && <div className="empty-state-full">لا يوجد متبرعين مسجلين حالياً</div>}
          </div>
        </div>
      )}

      {activeTab === 'donors' && user?.role === 'admin' && fundStats.recentInKind.length > 0 && (
        <div className="recent-in-kind-history main-card fade-in" style={{marginTop: '30px', padding: '20px'}}>
          <div className="card-header" style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}>
            <Gift size={24} color="#e74c3c" />
            <h3 style={{fontSize: '1.2rem', margin: 0}}>سجل التبرعات العينية الأخيرة (للأدمن)</h3>
          </div>
          <div className="in-kind-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px'}}>
            {fundStats.recentInKind.map((item, idx) => (
              <div key={idx} className="in-kind-item" style={{background: '#fcfcfc', border: '1px solid #eee', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{flex: 1}}>
                  <strong style={{display: 'block', color: '#333'}}>{item.refName || 'متبرع'}</strong>
                  <span style={{fontSize: '0.85rem', color: '#e74c3c', fontWeight: 'bold'}}>{item.unit || item.itemName}</span>
                  <small style={{display: 'block', color: '#888', marginTop: '4px'}}>{item.date}</small>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <button 
                    onClick={async () => {
                      if(!window.confirm('هل تريد حذف هذا التبرع وتعديل رصيد المتبرع؟')) return;
                      const res = await fetch(`${API_URL}/transactions/${item._id}`, { 
                        method: 'DELETE', 
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
                      });
                      if(res.ok) fetchData();
                    }}
                    className="delete-btn-mini"
                    style={{color: '#e74c3c', padding: 5, borderRadius: 5, cursor: 'pointer', background: 'none', border: 'none'}}
                    title="حذف واسترداد الرصيد"
                  >
                    <Trash2 size={16} />
                  </button>
                  <Building2 size={20} color="#999" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showGrantForm && (
        <div className="modal-overlay">
          <div className="modal-content fade-in grants-modal">
            <div className="modal-header">
              <h3>إضافة توزيع منحة جديد</h3>
              <button className="close-btn" onClick={() => setShowGrantForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleGrantSubmit}>
              <div className="grant-stepper">
                <div className="step-section">
                  <label className="step-label">1. اختيار الطلاب ({selectedStudents.length} طلاب مختارين)</label>
                  <div className="student-selector-box">
                    <div className="selector-search">
                      <Search size={16} />
                      <input placeholder="ابحث عن الطلاب بالاسم أو الفصل..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
                    </div>
                    <div className="student-scroll-list">
                      {filteredStudents.map(s => (
                        <div key={s._id} className={`student-check-item ${selectedStudents.some(x => x._id === s._id) ? 'selected' : ''}`} onClick={() => toggleStudentSelection(s)}>
                          <div className="check-badge"><Plus size={14} /></div>
                          <div className="stud-avatar-mini">{s.name.charAt(0)}</div>
                          <div className="stud-info">
                            <strong>{s.name}</strong>
                            <small>{s.className}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>نوع المنحة</label>
                    <select value={grantFormData.type} onChange={e => setGrantFormData({ ...grantFormData, type: e.target.value })}>
                      <option value="السداد لغير القادرين">السداد لغير القادرين</option>
                      <option value="دعم مادي">دعم مادي</option>
                      <option value="دعم عيني">دعم عيني</option>
                      <option value="منحة حفظ">منحة حفظ</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>المتبرع المسؤول</label>
                    <select required value={grantFormData.donorId} onChange={e => setGrantFormData({ ...grantFormData, donorId: e.target.value })}>
                      <option value="">-- اختر المتبرع --</option>
                      {donors.map(d => <option key={d._id} value={d._id}>{d.name} (الرصيد: {d.balance} ج.م)</option>)}
                    </select>
                  </div>

                  {grantFormData.type === 'دعم عيني' ? (
                    <>
                      <div className="form-group">
                        <label>الصنف المطلوب توزيعه</label>
                        <input required placeholder="مثلاً: شنط رمضان" value={grantFormData.itemName} onChange={e => setGrantFormData({ ...grantFormData, itemName: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>الكمية لكل طالب</label>
                        <input type="number" required placeholder="مثلاً: 2" value={grantFormData.quantityPerStudent} onChange={e => setGrantFormData({ ...grantFormData, quantityPerStudent: e.target.value })} />
                      </div>
                      {grantFormData.donorId && Object.keys(donors.find(d => d._id === grantFormData.donorId)?.inKindStock || {}).length > 0 && (
                        <div className="form-group full-width">
                          <small style={{display: 'block', marginBottom: '8px', color: '#666'}}>الأصناف المتوفرة عند هذا المتبرع (اضغط للاختيار):</small>
                          <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                            {Object.entries(donors.find(d => d._id === grantFormData.donorId).inKindStock).map(([item, qty], i) => (
                              <button key={i} type="button" className="suggestion-pill" style={{opacity: qty <= 0 ? 0.5 : 1}} onClick={() => setGrantFormData({...grantFormData, itemName: item})}>
                                {item} ({qty})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedStudents.length > 0 && grantFormData.quantityPerStudent > 0 && (
                        <div className="form-group full-width" style={{background: '#f8f9fa', padding: '10px', borderRadius: '8px'}}>
                          <p style={{margin: 0, color: '#2c3e50', fontSize: '0.9rem'}}>إجمالي الكمية التي سيتم خصمها: <strong>{grantFormData.quantityPerStudent * selectedStudents.length} وحدات</strong> ({selectedStudents.length} طلاب × {grantFormData.quantityPerStudent})</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="form-group">
                      <label>إجمالي المبلغ (يخصم من الداش بورد)</label>
                      <div className="input-with-calc">
                        <input type="number" required value={grantFormData.amount} onChange={e => setGrantFormData({ ...grantFormData, amount: e.target.value })} />
                        {selectedStudents.length > 0 && grantFormData.amount && (
                          <small className="calc-hint">نصيب كل طالب: {(grantFormData.amount / selectedStudents.length).toFixed(1)} ج.م</small>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>التاريخ</label>
                    <input type="date" required value={grantFormData.date} onChange={e => setGrantFormData({ ...grantFormData, date: e.target.value })} />
                  </div>
                </div>

                <div className="form-group full-width" style={{ marginTop: '15px' }}>
                  <label>ملاحظات التوزيع</label>
                  <textarea rows="2" value={grantFormData.reason} onChange={e => setGrantFormData({ ...grantFormData, reason: e.target.value })}></textarea>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn primary">تنفيذ التوزيع والخصم</button>
                <button type="button" className="cancel-btn" onClick={() => setShowGrantForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDonorForm && (
        <div className="modal-overlay">
          <div className="modal-content fade-in donor-modal">
            <div className="modal-header">
              <h3>{editingDonor ? 'تعديل بيانات المتبرع' : 'إضافة متبرع أو جهة مانحة'}</h3>
              <button className="close-btn" onClick={() => { setShowDonorForm(false); setEditingDonor(null); }}><X size={24} /></button>
            </div>
            <form onSubmit={handleDonorSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>اسم المتبرع/الجهة</label>
                  <input required value={donorFormData.name} onChange={e => setDonorFormData({ ...donorFormData, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>النوع</label>
                  <select value={donorFormData.type} onChange={e => setDonorFormData({ ...donorFormData, type: e.target.value })}>
                    <option value="فرد">فرد</option>
                    <option value="جهة">جهة / منظمة</option>
                    <option value="فاعل خير">فاعل خير (غير مسمى)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>رقم الهاتف</label>
                  <input placeholder="01xxxxxxxxx" value={donorFormData.phone} onChange={e => setDonorFormData({...donorFormData, phone: e.target.value})} />
                </div>
              </div>
              <div className="form-group full-width" style={{ marginTop: '15px' }}>
                <label>ملاحظات</label>
                <textarea rows="2" value={donorFormData.notes} onChange={e => setDonorFormData({ ...donorFormData, notes: e.target.value })}></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn primary">حفظ المتبرع</button>
                <button type="button" className="cancel-btn" onClick={() => { setShowDonorForm(false); setEditingDonor(null); }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDonationForm && (
        <div className="modal-overlay">
          <div className="modal-content fade-in donation-modal">
            <div className="modal-header">
              <h3>تسجيل تبرع جديد (إيراد)</h3>
              <button className="close-btn" onClick={() => setShowDonationForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleDonationSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>المتبرع</label>
                  <select required value={donationFormData.donorId} onChange={e => setDonationFormData({ ...donationFormData, donorId: e.target.value })}>
                    <option value="">-- اختر المتبرع --</option>
                    {donors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>نوع التبرع</label>
                  <select value={donationFormData.type} onChange={e => setDonationFormData({...donationFormData, type: e.target.value})}>
                    <option value="نقدي">نقدي (مبلغ مالي)</option>
                    <option value="عيني">عيني (سلع/شنط رمضان/ألخ)</option>
                  </select>
                </div>
                {donationFormData.type === 'نقدي' ? (
                  <div className="form-group">
                    <label>المبلغ المتبرع به (ج.م)</label>
                    <input type="number" required value={donationFormData.amount} onChange={e => setDonationFormData({ ...donationFormData, amount: e.target.value })} />
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label>اسم الصنف</label>
                      <input required placeholder="مثلاً: شنط رمضان" value={donationFormData.itemName} onChange={e => setDonationFormData({ ...donationFormData, itemName: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>الكمية الواردة</label>
                      <input type="number" required placeholder="مثلاً: 500" value={donationFormData.quantity} onChange={e => setDonationFormData({ ...donationFormData, quantity: e.target.value })} />
                    </div>
                  </>
                )}
                <div className="form-group">
                  <label>التاريخ</label>
                  <input type="date" required value={donationFormData.date} onChange={e => setDonationFormData({ ...donationFormData, date: e.target.value })} />
                </div>
              </div>
              <div className="form-group full-width" style={{ marginTop: '15px' }}>
                <label>ملاحظات إضافية</label>
                <textarea rows="2" value={donationFormData.notes} onChange={e => setDonationFormData({ ...donationFormData, notes: e.target.value })}></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn primary">تأكيد التبرع والإضافة للخزنة</button>
                <button type="button" className="cancel-btn" onClick={() => setShowDonationForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .header-title-tabs { display: flex; flex-direction: column; gap: 15px; }
        .tab-pill-container { 
          display: flex; gap: 8px; background: rgba(255,255,255,0.6); 
          padding: 6px; border-radius: 14px; backdrop-filter: blur(10px); 
          border: 1px solid rgba(255,255,255,0.3); width: fit-content;
        }
        .tab-pill { 
          padding: 10px 20px; border-radius: 10px; border: none; background: none; 
          color: #64748b; font-weight: 700; display: flex; align-items: center; gap: 10px; 
          cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 0.95rem;
        }
        .tab-pill:hover { color: var(--primary); background: rgba(255,255,255,0.4); }
        .tab-pill.active { background: #fff; color: var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); }

        .grants-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 40px; }
        .grant-type-card { 
          background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); 
          border-radius: 24px; padding: 32px; text-align: center; border: 1px solid rgba(255,255,255,0.5); 
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          display: flex; flex-direction: column; align-items: center; gap: 18px; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
        }
        .grant-type-card:hover { transform: translateY(-12px); box-shadow: 0 15px 45px rgba(0,0,0,0.08); border-color: var(--accent); }
        
        .grant-type-card .icon-wrapper {
          width: 70px; height: 70px; display: flex; align-items: center; justify-content: center;
          border-radius: 20px; background: #fff; box-shadow: 0 10px 20px rgba(0,0,0,0.03);
          transition: 0.3s;
        }
        .grant-type-card:hover .icon-wrapper { transform: rotate(-5deg) scale(1.1); }
        .grant-type-card h3 { margin: 0; color: var(--secondary); font-size: 1.2rem; font-weight: 800; }
        .grant-type-card p { font-size: 0.9rem; color: #64748b; line-height: 1.6; margin: 0; }

        .recent-grants h3 { margin-bottom: 25px; color: var(--secondary); font-weight: 800; font-size: 1.3rem; }

        .multi-student-cell { display: flex; flex-direction: column; gap: 6px; }
        .count-tag { background: #dcfce7; color: #15803d; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; align-self: flex-start; text-transform: uppercase; letter-spacing: 0.5px; }
        .names-list { font-size: 0.95rem; color: var(--secondary); font-weight: 700; line-height: 1.4; }
        .amount-text { color: #16a34a; font-size: 1.2rem; font-weight: 800; }

        .donors-section { margin-top: 20px; }
        .donors-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .donors-header h3 { font-size: 1.5rem; font-weight: 800; color: var(--primary); }
        .add-donor-btn { background: var(--primary); color: #fff; padding: 12px 24px; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-weight: 700; transition: 0.3s; }
        .add-donor-btn:hover { transform: scale(1.02); filter: brightness(1.1); }

        .donors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        .donor-card { 
          background: #fff; border-radius: 24px; padding: 25px; border: 1px solid rgba(0,0,0,0.05); 
          box-shadow: 0 10px 25px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 20px;
          transition: 0.3s;
        }
        .donor-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.05); }
        .donor-card-main { display: flex; align-items: center; gap: 18px; }
        .donor-avatar { 
          width: 50px; height: 50px; background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); 
          color: #0369a1; border-radius: 15px; display: flex; align-items: center; justify-content: center; 
          font-weight: 800; font-size: 1.3rem;
        }
        .donor-meta h4 { font-size: 1.1rem; margin-bottom: 2px; color: var(--primary); }
        .donor-meta span { font-size: 0.85rem; color: #64748b; font-weight: 600; }
        .donor-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; padding: 15px; border-radius: 16px; }
        .stat-item { display: flex; flex-direction: column; gap: 3px; }
        .stat-item small { font-size: 0.7rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
        .stat-item strong { font-size: 1rem; color: var(--secondary); font-weight: 800; }
        .stat-item strong.pos { color: #16a34a; }

        .donor-actions { display: flex; gap: 8px; margin-right: auto; }
        .edit-btn-mini { color: #3498db; padding: 4px; border-radius: 6px; transition: 0.2s; }
        .edit-btn-mini:hover { background: #ebf5fb; }
        .delete-btn-mini { color: #e74c3c; padding: 4px; border-radius: 6px; transition: 0.2s; }
        .delete-btn-mini:hover { background: #fdedec; }

        .student-selector-box { 
          border: 2px solid #f1f5f9; border-radius: 20px; overflow: hidden; margin-bottom: 25px; 
          background: #fff; height: 350px; display: flex; flex-direction: column;
        }
        .selector-search { display: flex; align-items: center; gap: 12px; padding: 14px 20px; background: #f8fafc; border-bottom: 1.5px solid #f1f5f9; }
        .selector-search input { border: none; background: none; flex: 1; outline: none; font-size: 1rem; font-family: inherit; }
        .student-scroll-list { 
          overflow-y: auto; 
          flex: 1; 
          padding: 16px; 
          display: flex;
          flex-direction: column;
          gap: 12px; 
        }
        
        .student-check-item { 
          display: flex; 
          flex-direction: row-reverse; 
          align-items: center; 
          gap: 16px; 
          padding: 16px 20px; 
          border-radius: 20px; 
          border: 1.5px solid #f1f5f9; 
          cursor: pointer; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
          position: relative;
          background: #fff;
        }
        .student-check-item:hover { 
          background: #f8fafc; 
          border-color: #cbd5e1; 
          transform: translateX(-4px);
        }
        .student-check-item.selected { 
          background: #f0fdf4; 
          border-color: #22c55e; 
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.12); 
        }
        
        .stud-avatar-mini {
          width: 48px; 
          height: 48px; 
          border-radius: 14px; 
          background: #f1f5f9;
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 1.2rem; 
          font-weight: 800; 
          color: #64748b;
          flex-shrink: 0; 
          transition: 0.3s;
        }
        .student-check-item.selected .stud-avatar-mini { background: #22c55e; color: #fff; transform: scale(1.05); }
        
        .stud-info { 
          display: flex; 
          flex-direction: column; 
          gap: 4px; 
          flex: 1;
          text-align: right;
        }
        .stud-info strong { 
          font-size: 1.1rem; 
          color: #1e293b; 
          line-height: 1.2;
          display: block;
          font-weight: 800;
        }
        .stud-info small { 
          font-size: 0.85rem; 
          color: #64748b; 
          font-weight: 600; 
          opacity: 0.8;
        }
        
        .check-badge { 
          position: absolute; 
          top: 50%; 
          left: 20px; 
          transform: translateY(-50%) scale(0);
          width: 24px; 
          height: 24px; 
          background: #22c55e; 
          color: #fff; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 2;
        }
        .student-check-item.selected .check-badge { transform: translateY(-50%) scale(1); }

        .type-tag { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
        .type-tag.money { background: #ecfdf5; color: #059669; }
        .type-tag.kind { background: #fefce8; color: #b45309; }

        .grant-stepper { display: flex; flex-direction: column; gap: 25px; }
        .step-label { font-size: 1.1rem; font-weight: 800; color: var(--primary); margin-bottom: 12px; display: block; }
        
        .calc-hint { font-size: 0.85rem; font-weight: 700; color: #16a34a; background: #f0fdf4; padding: 8px 12px; border-radius: 10px; display: inline-flex; align-items: center; gap: 8px; margin-top: 10px; width: fit-content; }
        
        /* Modal specific adjustments */
        .grants-modal { max-width: 900px; padding: 40px; border-radius: 32px; border: none; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        
        @media (max-width: 768px) {
          .student-scroll-list { grid-template-columns: 1fr; }
          .grants-modal { padding: 20px; border-radius: 20px; }
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default GrantsManager;
