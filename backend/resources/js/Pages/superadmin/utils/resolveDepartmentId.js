const norm = (s) =>
  (s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[()]/g, '');

/** Match a display department label to an API department row (id + name). */
export function resolveDepartmentId(allDepartments, departmentLabel) {
  if (!departmentLabel || !Array.isArray(allDepartments) || !allDepartments.length) {
    return { id: '', department: null, ambiguous: false };
  }

  const target = norm(departmentLabel);
  const candidates = allDepartments.filter((d) => d && d.name);

  const exact = candidates.filter((d) => norm(d.name) === target);
  if (exact.length === 1) {
    return { id: String(exact[0].id), department: exact[0], ambiguous: false };
  }
  if (exact.length > 1) {
    return { id: String(exact[0].id), department: exact[0], ambiguous: true };
  }

  const loose = candidates.filter(
    (d) => norm(d.name).includes(target) || target.includes(norm(d.name))
  );
  if (loose.length === 1) {
    return { id: String(loose[0].id), department: loose[0], ambiguous: false };
  }

  return { id: '', department: null, ambiguous: loose.length > 1 };
}
