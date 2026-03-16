import React, { useState, useEffect } from 'react';
import { Calendar, Check, X, Clock, Users, UserCheck, FileDown, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_URL = '/api';

const AttendanceManager = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState([]);
  const [sheikhs, setSheikhs] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [studRes, sheikhRes, classRes, attRes] = await Promise.all([
        fetch(`${API_URL}/students`, { headers }),
        fetch(`${API_URL}/sheikhs`, { headers }),
        fetch(`${API_URL}/classes`, { headers }),
        fetch(`${API_URL}/attendance`, { headers })
      ]);
      setStudents(await studRes.json());
      setSheikhs(await sheikhRes.json());
      setClasses(await classRes.json());
      setAttendanceHistory(await attRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleStatusChange = (type, id, status) => {
    setAttendance({
      ...attendance,
      [`${type}_${id}_${selectedDate}`]: status
    });
  };

  const getStatus = (type, id) => attendance[`${type}_${id}_${selectedDate}`] || null;

  const handleSaveAttendance = async () => {
    const list = activeTab === 'students' ? students : sheikhs;
    const records = list.map(p => ({
      personId: p._id,
      name: p.name,
      status: getStatus(activeTab, p._id)
    })).filter(r => r.status);

    if (records.length === 0) {
      alert('الرجاء تسجيل حالة واحدة على الأقل');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          date: selectedDate,
          attendanceType: activeTab === 'students' ? 'student' : 'sheikh',
          records
        })
      });
      if (res.ok) {
        alert('تم حفظ الحضور بنجاح');
        fetchPeople(); // Refresh history
      }
    } catch (err) {
      console.error('Error saving attendance:', err);
    }
  };

  const exportToExcel = () => {
    const list = activeTab === 'students' ? students : sheikhs;
    const dataToExport = list.map(p => ({
      'الاسم': p.name,
      'الفصل': p.className || (p.assignedClasses && p.assignedClasses.join(', ')),
      'الحالة اليوم': getStatus(activeTab, p._id) === 'present' ? 'حاضر' : getStatus(activeTab, p._id) === 'absent' ? 'غائب' : getStatus(activeTab, p._id) === 'late' ? 'متأخر' : 'لم يسجل'
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `حضور_${activeTab === 'students' ? 'الطلاب' : 'الشيوخ'}_${selectedDate}.xlsx`);
  };

  const renderDashboard = () => {
    const todayRecords = attendanceHistory.find(h => h.date === selectedDate && h.attendanceType === 'student')?.records || [];
    const totalPresent = todayRecords.filter(r => r.status === 'present').length;
    const totalLate = todayRecords.filter(r => r.status === 'late').length;
    const rate = todayRecords.length > 0 ? Math.round(((totalPresent + totalLate) / todayRecords.length) * 100) : 0;

    return (
      <div className="attendance-dashboard fade-in">
        <div className="stats-grid">
          <div className="stat-card blue">
            <span>حضور اليوم</span>
            <strong>{totalPresent + totalLate} / {todayRecords.length}</strong>
          </div>
          <div className="stat-card green">
            <span>نسبة الانضباط</span>
            <strong>{rate}%</strong>
          </div>
          <div className="stat-card orange">
            <span>حالات التأخير</span>
            <strong>{totalLate}</strong>
          </div>
        </div>

        <div className="class-stats-section">
          <h3>تحليل الحضور حسب الفصول</h3>
          <div className="class-rates">
            {classes.map(c => {
              const studentsInClass = students.filter(s => s.className === c.name);
              const classRecords = todayRecords.filter(r => studentsInClass.some(s => s._id === r.personId));
              const classRate = classRecords.length > 0 
                ? Math.round((classRecords.filter(r => r.status === 'present' || r.status === 'late').length / classRecords.length) * 100)
                : 0;
              
              return (
                <div key={c._id} className="class-rate-item">
                  <div className="item-info">
                    <span>{c.name}</span>
                    <span>{classRate}%</span>
                  </div>
                  <div className="rate-bar">
                    <div className="fill" style={{ width: `${classRate}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="attendance-manager">
      <div className="module-header no-print">
        <h2>تسجيل الحضور والغياب</h2>
        <div className="header-actions">
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
      <div className="attendance-controls">
        <div className="control-group">
          <label><Calendar size={18} /> التاريخ:</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
          />
        </div>
        
        {activeTab === 'students' && (
          <div className="control-group">
            <label><Users size={18} /> الفصل:</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="">جميع الفصول</option>
              {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="attendance-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''} 
          onClick={() => setActiveTab('dashboard')}
        >
          <Calendar size={18} />
          لوحة الإحصائيات
        </button>
        <button 
          className={activeTab === 'students' ? 'active' : ''} 
          onClick={() => setActiveTab('students')}
        >
          <Users size={18} />
          حضور الطلاب
        </button>
        <button 
          className={activeTab === 'sheikhs' ? 'active' : ''} 
          onClick={() => setActiveTab('sheikhs')}
        >
          <UserCheck size={18} />
          حضور الشيوخ
        </button>
      </div>

      <div className="tab-container">
        {activeTab === 'dashboard' && renderDashboard()}
        
        {(activeTab === 'students' || activeTab === 'sheikhs') && (
          <>
            <div className="attendance-list fade-in">
              <table>
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الفصل</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === 'students' 
                    ? students.filter(s => !selectedClass || s.className === selectedClass) 
                    : sheikhs.filter(s => !selectedClass || (s.assignedClasses && s.assignedClasses.includes(selectedClass)))
                  ).map(person => (
                    <tr key={person._id}>
                      <td className="font-bold">{person.name}</td>
                      <td>{person.className || (person.assignedClasses && person.assignedClasses[0]) || 'غير محدد'}</td>
                      <td className="status-actions">
                        <div className="status-buttons">
                          <button 
                            className={`status-btn present ${getStatus(activeTab, person._id) === 'present' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(activeTab, person._id, 'present')}
                            title="حاضر"
                          >
                            <Check size={18} />
                            <span>حاضر</span>
                          </button>
                          
                          <button 
                            className={`status-btn absent ${getStatus(activeTab, person._id) === 'absent' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(activeTab, person._id, 'absent')}
                            title="غائب"
                          >
                            <X size={18} />
                            <span>غائب</span>
                          </button>
      
                          {activeTab === 'students' && (
                            <button 
                              className={`status-btn late ${getStatus(activeTab, person._id) === 'late' ? 'active' : ''}`}
                              onClick={() => handleStatusChange(activeTab, person._id, 'late')}
                              title="متأخر"
                            >
                              <Clock size={18} />
                              <span>متأخر</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="save-section">
              <button className="save-btn" onClick={handleSaveAttendance}>حفظ الغياب اليومي</button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .attendance-manager {
          background: var(--white);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow);
        }

        .attendance-controls {
          display: flex;
          gap: 20px;
          margin-top: 15px;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 12px;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .control-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          color: var(--secondary);
        }

        .control-group input, .control-group select {
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #ddd;
          font-family: inherit;
          font-weight: 600;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .export-btn { background: #27ae60; color: white; display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 8px; font-weight: 700; }
        .print-btn { background: #7f8c8d; color: white; display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 8px; font-weight: 700; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          padding: 20px;
          border-radius: 12px;
          color: white;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .stat-card.blue { background: #3498db; }
        .stat-card.green { background: #2ecc71; }
        .stat-card.orange { background: #e67e22; }

        .stat-card span { font-size: 0.9rem; opacity: 0.9; }
        .stat-card strong { font-size: 1.5rem; }

        .class-stats-section h3 { margin-bottom: 20px; color: var(--secondary); }
        .class-rates { display: flex; flex-direction: column; gap: 15px; }

        .class-rate-item { display: flex; flex-direction: column; gap: 8px; }
        .item-info { display: flex; justify-content: space-between; font-weight: 600; }
        .rate-bar { height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
        .rate-bar .fill { height: 100%; background: var(--primary); transition: width 0.3s; }

        .attendance-tabs {
          display: flex;
          gap: 12px;
          margin: 24px 0;
          border-bottom: 2px solid var(--gray-light);
          padding-bottom: 12px;
        }

        .attendance-tabs button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          color: #666;
          transition: all 0.2s;
        }

        .attendance-tabs button.active {
          background: var(--primary);
          color: var(--white);
        }

        .status-buttons {
          display: flex;
          gap: 10px;
        }

        .status-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #ddd;
          color: #666;
          font-weight: 600;
          transition: all 0.2s;
          min-width: 90px;
          justify-content: center;
        }

        .status-btn.present:hover, .status-btn.present.active {
          background: #e8f5e9;
          color: #2e7d32;
          border-color: #2e7d32;
        }

        .status-btn.absent:hover, .status-btn.absent.active {
          background: #ffebee;
          color: #c62828;
          border-color: #c62828;
        }

        .status-btn.late:hover, .status-btn.late.active {
          background: #fff3e0;
          color: #ef6c00;
          border-color: #ef6c00;
        }

        .save-section {
          margin-top: 32px;
          display: flex;
          justify-content: flex-end;
        }

        .save-btn {
          background: var(--accent);
          color: var(--white);
          padding: 12px 32px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1.1rem;
        }

        @media (max-width: 600px) {
          .status-btn span { display: none; }
          .status-btn { min-width: 50px; }
        }
      `}</style>
    </div>
  );
};

export default AttendanceManager;
