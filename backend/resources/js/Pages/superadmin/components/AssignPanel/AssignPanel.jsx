import React, { useEffect, useMemo, useState } from 'react';
import { COLLEGE_DEPARTMENTS, COLLEGE_NAMES } from '../../data/collegeDepartments';
import { resolveDepartmentId } from '../../utils/resolveDepartmentId';
import { superAdminAPI } from '../../../../services/http';
import './AssignPanel.css';

const workloadTone = (n) => {
  if (n >= 15) return 'danger';
  if (n >= 8) return 'warn';
  return 'ok';
};

const safe = (v, fallback = '—') => (v === null || v === undefined || v === '' ? fallback : v);

const AssignPanel = ({ allDepartments = [], onSuccess, onError, onActivity }) => {
  const [loading, setLoading] = useState(false);

  const [selectedCollegeName, setSelectedCollegeName] = useState('');
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('');

  const [showAssigned, setShowAssigned] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [dir, setDir] = useState('asc');

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [examiners, setExaminers] = useState([]);
  const [advisors, setAdvisors] = useState([]);

  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [selectedExaminerId, setSelectedExaminerId] = useState('');
  const [selectedAdvisorId, setSelectedAdvisorId] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);

  const departmentOptions = useMemo(
    () => (selectedCollegeName ? COLLEGE_DEPARTMENTS[selectedCollegeName] || [] : []),
    [selectedCollegeName]
  );

  const { id: departmentId, department: matchedDepartment, ambiguous } = useMemo(
    () => resolveDepartmentId(allDepartments, selectedDepartmentName),
    [allDepartments, selectedDepartmentName]
  );

  const selectedCount = selectedStudentIds.size;

  const selectedDepartment = matchedDepartment;

  const canAssignExaminer = selectedCount > 0 && !!selectedExaminerId && !!departmentId;
  const canAssignAdvisor = selectedCount > 0 && !!selectedAdvisorId && !!departmentId;
  const canAssignBoth = selectedCount > 0 && !!selectedAdvisorId && !!selectedExaminerId && !!departmentId;

  const loadStudents = async (page = 1) => {
    const res = await superAdminAPI.getUnassignedStudents({
      department_id: departmentId,
      include_assigned: showAssigned ? true : false,
      q: search || undefined,
      sort,
      dir,
      page,
    });
    const payload = res.data;
    setStudents(payload?.data || []);
    setPagination({
      total: payload?.total,
      current_page: payload?.current_page,
      last_page: payload?.last_page,
    });
  };

  const loadStaff = async () => {
    const [exRes, advRes] = await Promise.all([
      superAdminAPI.getAvailableExaminers(departmentId),
      superAdminAPI.getAvailableAdvisors(departmentId),
    ]);
    setExaminers(exRes.data || []);
    setAdvisors(advRes.data || []);
  };

  const handleCollegeChange = (name) => {
    setSelectedCollegeName(name);
    setSelectedDepartmentName('');
    setSelectedStudentIds(new Set());
    setSelectedExaminerId('');
    setSelectedAdvisorId('');
  };

  useEffect(() => {
    if (!departmentId) {
      setStudents([]);
      setPagination(null);
      setExaminers([]);
      setAdvisors([]);
      setSelectedStudentIds(new Set());
      setSelectedAdvisorId('');
      setSelectedExaminerId('');
      return;
    }
    (async () => {
      setLoading(true);
      try {
        await Promise.all([loadStudents(1), loadStaff()]);
      } catch (e) {
        onError?.(e.response?.data?.message || 'Failed to load assignment data.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId]);

  const toggleStudent = (id) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    const visibleIds = students.map((s) => s.id);
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      const allSelected = visibleIds.every((id) => next.has(id));
      if (allSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const refresh = async () => {
    if (!departmentId) return;
    setLoading(true);
    try {
      await Promise.all([loadStudents(pagination?.current_page || 1), loadStaff()]);
      onSuccess?.('Assignment data refreshed.');
    } catch (e) {
      onError?.(e.response?.data?.message || 'Failed to refresh.');
    } finally {
      setLoading(false);
    }
  };

  const submitAssignment = async () => {
    const student_ids = Array.from(selectedStudentIds.values());
    const payload = {
      department_id: Number(departmentId),
      student_ids,
      examiner_id: selectedExaminerId ? Number(selectedExaminerId) : undefined,
      advisor_id: selectedAdvisorId ? Number(selectedAdvisorId) : undefined,
    };

    setLoading(true);
    try {
      let res;
      if (canAssignBoth) res = await superAdminAPI.assignBoth(payload);
      else if (canAssignExaminer) res = await superAdminAPI.assignExaminer(payload);
      else if (canAssignAdvisor) res = await superAdminAPI.assignAdvisor(payload);
      else throw new Error('Select students and choose staff.');

      onSuccess?.(res.data?.message || 'Assigned successfully.');
      onActivity?.('✅', `Assigned staff to ${student_ids.length} student(s) in ${selectedDepartment?.name || 'department'}`);

      setConfirmOpen(false);
      setSelectedStudentIds(new Set());
      await Promise.all([loadStudents(1), loadStaff()]);
    } catch (e) {
      onError?.(e.response?.data?.message || e.message || 'Failed to assign.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAlreadyAssigned = useMemo(() => {
    if (!showAssigned) return [];
    return students.filter((s) => s.advisor_id && s.examiner_id);
  }, [students, showAssigned]);

  const deptResolutionIssue = selectedDepartmentName && !departmentId;

  return (
    <div className="sa-assign">
      <div className="sa-assign-header">
        <div>
          <h3>🧩 Assign Examiners & Advisors</h3>
          <p>Select a college, then a department, then assign staff to students in bulk.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={refresh} disabled={loading || !departmentId}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="sa-assign-filters">
        <div className="form-grid">
          <div className="form-group">
            <label>College</label>
            <select
              value={selectedCollegeName}
              onChange={(e) => handleCollegeChange(e.target.value)}
              disabled={loading}
            >
              <option value="">Select college</option>
              {COLLEGE_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Department</label>
            <select
              value={selectedDepartmentName}
              onChange={(e) => setSelectedDepartmentName(e.target.value)}
              disabled={loading || !selectedCollegeName}
            >
              <option value="">{!selectedCollegeName ? 'Select college first' : 'Select department'}</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Search students</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, student ID, email..."
              disabled={!departmentId}
            />
          </div>

          <div className="form-group">
            <label>Sort</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select value={sort} onChange={(e) => setSort(e.target.value)} disabled={!departmentId}>
                <option value="name">Name</option>
                <option value="id">Student ID</option>
                <option value="status">Status</option>
              </select>
              <select value={dir} onChange={(e) => setDir(e.target.value)} disabled={!departmentId}>
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
              <button type="button" className="btn-secondary" disabled={!departmentId} onClick={() => loadStudents(1)}>
                Apply
              </button>
            </div>
          </div>
        </div>

        {deptResolutionIssue && (
          <div className="sa-assign-warning">
            No department record matches <strong>{selectedDepartmentName}</strong> in the database. Add or rename the
            department under Admin so assignments and APIs can use a valid <code>department_id</code>.
          </div>
        )}
        {ambiguous && departmentId && (
          <div className="sa-assign-hint">Multiple departments matched this label; using the first match: {matchedDepartment?.name}.</div>
        )}

        <div className="sa-assign-summary" role="status">
          <div className="sa-summary-chip">
            <span className="sa-summary-label">Students (list)</span>
            <strong>{departmentId ? safe(pagination?.total, students.length) : '—'}</strong>
          </div>
          <div className="sa-summary-chip">
            <span className="sa-summary-label">Available examiners</span>
            <strong>{departmentId ? examiners.length : '—'}</strong>
          </div>
          <div className="sa-summary-chip">
            <span className="sa-summary-label">Available advisors</span>
            <strong>{departmentId ? advisors.length : '—'}</strong>
          </div>
          <div className="sa-summary-chip">
            <span className="sa-summary-label">Selected</span>
            <strong>{selectedCount}</strong>
          </div>
        </div>

        <div className="sa-toggle-row">
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={showAssigned}
              onChange={(e) => setShowAssigned(e.target.checked)}
              disabled={!departmentId}
            />
            Show already-assigned students (toggle)
          </label>
        </div>
      </div>

      {!departmentId ? (
        <div className="sa-empty-panel">
          <h3>Select a department to begin</h3>
          <p>Pick a college and department to load students and available staff.</p>
        </div>
      ) : (
        <div className="sa-assign-grid">
          <div className="sa-assign-panel">
            <div className="sa-panel-title">
              <h4>🎓 Students</h4>
              <div className="sa-small-meta">Showing: {safe(pagination?.total, students.length)} student(s)</div>
            </div>

            {students.length === 0 ? (
              <div className="sa-empty-panel">
                <h3>No students found</h3>
                <p>Try adjusting the filters, or select another department.</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            onChange={toggleAllVisible}
                            checked={students.length > 0 && students.every((s) => selectedStudentIds.has(s.id))}
                          />
                        </th>
                        <th>Student ID</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Program/Year</th>
                        <th>Examiner</th>
                        <th>Advisor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => {
                        const fullName = `${safe(s.first_name, '')} ${safe(s.last_name, '')}`.trim() || safe(s.full_name);
                        const year = s.profile_data?.year ? `Year ${s.profile_data.year}` : '—';
                        const examinerOk = !!s.examiner_id;
                        const advisorOk = !!s.advisor_id;
                        return (
                          <tr key={s.id} className="user-row">
                            <td>
                              <input type="checkbox" checked={selectedStudentIds.has(s.id)} onChange={() => toggleStudent(s.id)} />
                            </td>
                            <td>{safe(s.student_id)}</td>
                            <td>{fullName}</td>
                            <td>{safe(s.email)}</td>
                            <td>{year}</td>
                            <td>{examinerOk ? '✅ Assigned' : '⏳ Unassigned'}</td>
                            <td>{advisorOk ? '✅ Assigned' : '⏳ Unassigned'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {showAssigned && filteredAlreadyAssigned.length > 0 && (
                  <details style={{ marginTop: '0.75rem' }}>
                    <summary style={{ cursor: 'pointer', color: '#334155', fontWeight: 700 }}>
                      Already Assigned Students ({filteredAlreadyAssigned.length})
                    </summary>
                    <div style={{ marginTop: '0.5rem', color: '#64748b' }}>
                      These students already have both examiner and advisor assigned.
                    </div>
                  </details>
                )}
              </>
            )}
          </div>

          <div className="sa-assign-panel">
            <div className="sa-panel-title">
              <h4>👨‍🏫 Available Examiners & Advisors</h4>
              <div className="sa-small-meta">Workload shown per staff member.</div>
            </div>

            <div className="sa-staff-block">
              <h5>Available Examiners</h5>
              {examiners.length === 0 ? (
                <div className="sa-empty-mini">No examiners available for this department.</div>
              ) : (
                <div className="sa-staff-list">
                  {examiners.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      className={`sa-staff-card ${String(selectedExaminerId) === String(e.id) ? 'active' : ''}`}
                      onClick={() => setSelectedExaminerId(String(e.id))}
                    >
                      <div>
                        <b>{`${e.first_name} ${e.last_name}`}</b>
                        <div className="sa-small-meta">{safe(e.email)}</div>
                      </div>
                      <span className={`sa-workload ${workloadTone(e.workload)}`}>{safe(e.workload, 0)} students</span>
                    </button>
                  ))}
                </div>
              )}
              <button type="button" className="btn-primary" disabled={!canAssignExaminer || loading} onClick={() => setConfirmOpen(true)}>
                Assign Examiner
              </button>
            </div>

            <div className="sa-staff-block">
              <h5>Available Advisors</h5>
              {advisors.length === 0 ? (
                <div className="sa-empty-mini">No advisors available for this department.</div>
              ) : (
                <div className="sa-staff-list">
                  {advisors.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className={`sa-staff-card ${String(selectedAdvisorId) === String(a.id) ? 'active' : ''}`}
                      onClick={() => setSelectedAdvisorId(String(a.id))}
                    >
                      <div>
                        <b>{`${a.first_name} ${a.last_name}`}</b>
                        <div className="sa-small-meta">{safe(a.email)}</div>
                      </div>
                      <span className={`sa-workload ${workloadTone(a.workload)}`}>{safe(a.workload, 0)} students</span>
                    </button>
                  ))}
                </div>
              )}
              <button type="button" className="btn-primary" disabled={!canAssignAdvisor || loading} onClick={() => setConfirmOpen(true)}>
                Assign Advisor
              </button>
            </div>

            <div className="sa-both-actions">
              <button type="button" className="btn-primary" disabled={!canAssignBoth || loading} onClick={() => setConfirmOpen(true)}>
                Assign Both (Examiner + Advisor)
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="modal-overlay" onClick={() => setConfirmOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Assignment</h3>
              <button type="button" className="modal-close" onClick={() => setConfirmOpen(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="sa-detail-grid">
                <div>
                  <span>College</span>
                  <b>{safe(selectedCollegeName)}</b>
                </div>
                <div>
                  <span>Department</span>
                  <b>{safe(selectedDepartment?.name || selectedDepartmentName)}</b>
                </div>
                <div>
                  <span>Students</span>
                  <b>{selectedCount}</b>
                </div>
                <div>
                  <span>Action</span>
                  <b>{canAssignBoth ? 'Assign Both' : canAssignExaminer ? 'Assign Examiner' : 'Assign Advisor'}</b>
                </div>
                <div>
                  <span>Examiner</span>
                  <b>
                    {safe(
                      examiners.find((e) => String(e.id) === String(selectedExaminerId))
                        ? `${examiners.find((e) => String(e.id) === String(selectedExaminerId)).first_name} ${
                            examiners.find((e) => String(e.id) === String(selectedExaminerId)).last_name
                          }`
                        : ''
                    )}
                  </b>
                </div>
                <div>
                  <span>Advisor</span>
                  <b>
                    {safe(
                      advisors.find((a) => String(a.id) === String(selectedAdvisorId))
                        ? `${advisors.find((a) => String(a.id) === String(selectedAdvisorId)).first_name} ${
                            advisors.find((a) => String(a.id) === String(selectedAdvisorId)).last_name
                          }`
                        : ''
                    )}
                  </b>
                </div>
              </div>
              <p style={{ color: '#64748b', marginBottom: 0 }}>
                This will update selected students and record assignment history (who assigned whom and when).
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setConfirmOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={submitAssignment} disabled={loading || selectedCount === 0}>
                {loading ? 'Assigning...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignPanel;
