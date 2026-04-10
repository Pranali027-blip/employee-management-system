import { useState, useRef } from "react";

function initials(name) {
  return name.trim().split(" ").map(w => w[0] || "").join("").toUpperCase().slice(0, 2);
}

function getBadgeClass(role) {
  const r = role.toLowerCase();
  if (r.includes("manager")) return "ems-badge badge-manager";
  if (r.includes("developer") || r.includes("engineer")) return "ems-badge badge-developer";
  if (r.includes("designer")) return "ems-badge badge-designer";
  if (r.includes("analyst")) return "ems-badge badge-analyst";
  if (r.includes("hr") || r.includes("human")) return "ems-badge badge-hr";
  return "ems-badge badge-default";
}

const INITIAL = [
  { id: 1, name: "John Doe", role: "Manager", salary: 50000 },
  { id: 2, name: "Jane Smith", role: "Developer", salary: 40000 },
];

export default function App() {
  const [employees, setEmployees] = useState(INITIAL);
  const [form, setForm] = useState({ name: "", role: "", salary: "" });
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [sortAsc, setSortAsc] = useState(true);
  const [dark, setDark] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(3);

  // Dark mode
  const toggleDark = () => {
    setDark(d => {
      document.body.classList.toggle("dark", !d);
      return !d;
    });
  };

  // Toast
  const showToast = (msg, type = "add") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  };

  // Stats
  const totalEmployees = employees.length;
  const uniqueRoles = new Set(employees.map(e => e.role)).size;
  const avgSalary = totalEmployees
    ? Math.round(employees.reduce((s, e) => s + e.salary, 0) / totalEmployees) : 0;
  const maxSalary = Math.max(...employees.map(e => e.salary), 1);

  // Form
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = (f) => {
    const e = {};
    if (!f.name.trim()) e.name = "Required";
    if (!f.role.trim()) e.role = "Required";
    if (!f.salary || isNaN(f.salary) || Number(f.salary) <= 0) e.salary = "Enter valid salary";
    return e;
  };

  const addEmployee = (ev) => {
    ev.preventDefault();
    const e = validate(form);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    const emp = { id: nextId.current++, name: form.name, role: form.role, salary: parseInt(form.salary) };
    setEmployees(prev => [...prev, emp]);
    setForm({ name: "", role: "", salary: "" });
    showToast(`✓ ${emp.name} added`, "add");
  };

  const deleteEmployee = (id) => {
    const emp = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    showToast(`✕ ${emp.name} removed`, "remove");
  };

  const saveEdit = () => {
    const e = validate(editEmp);
    if (Object.keys(e).length) return;
    setEmployees(prev => prev.map(emp => emp.id === editEmp.id
      ? { ...emp, name: editEmp.name, role: editEmp.role, salary: parseInt(editEmp.salary) }
      : emp
    ));
    showToast(`✎ ${editEmp.name} updated`, "add");
    setEditEmp(null);
  };

  // Sort + filter
  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filtered = employees
    .filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (typeof va === "string") va = va.toLowerCase(), vb = vb.toLowerCase();
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const arrow = (key) => (
    <span className={`sort-arrow${sortKey === key ? " active" : ""}`}>
      {sortKey === key ? (sortAsc ? " ↑" : " ↓") : " ↕"}
    </span>
  );

  return (
    <div className="ems-page">
      {/* Header */}
      <div className="ems-header">
        <div className="ems-header-top">
          <button className="ems-dark-toggle" onClick={toggleDark}>
            {dark ? "☀ Light" : "☾ Dark"}
          </button>
        </div>
        <div className="ems-eyebrow">Human Resources</div>
        <h1>Employee Directory</h1>
        <div className="ems-line"></div>
      </div>

      {/* Stats */}
      <div className="ems-stats">
        {[
          { val: totalEmployees, lbl: "Total Employees" },
          { val: uniqueRoles, lbl: "Unique Roles" },
          { val: avgSalary >= 1000 ? `₹${Math.round(avgSalary / 1000)}k` : `₹${avgSalary}`, lbl: "Avg. Salary" },
        ].map((s, i) => (
          <div className="ems-stat" key={i}>
            <div className="ems-stat-val">{s.val}</div>
            <div className="ems-stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="ems-card">
        <div className="ems-card-header">
          <span className="ems-dot"></span>
          <span className="ems-card-title">All Employees</span>
        </div>

        {/* Search */}
        <div className="ems-search-wrap">
          <input
            className="ems-search"
            placeholder="🔍  Search by name or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <table className="ems-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("id")}>ID{arrow("id")}</th>
              <th onClick={() => handleSort("name")}>Name{arrow("name")}</th>
              <th onClick={() => handleSort("role")}>Role{arrow("role")}</th>
              <th onClick={() => handleSort("salary")}>Salary{arrow("salary")}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <div className="ems-empty-state">
                    <div className="ems-empty-icon">👤</div>
                    <p>{search ? "No employees match your search." : "No employees yet. Add one below!"}</p>
                  </div>
                </td>
              </tr>
            ) : filtered.map((emp) => (
              <tr key={emp.id}>
                <td><span className="ems-id">#{emp.id}</span></td>
                <td>
                  <div className="ems-name">
                    <div className="ems-avatar">{initials(emp.name)}</div>
                    {emp.name}
                  </div>
                </td>
                <td><span className={getBadgeClass(emp.role)}>{emp.role}</span></td>
                <td>
                  <div className="ems-salary-wrap">
                    <span className="ems-salary">₹{emp.salary.toLocaleString("en-IN")}</span>
                    <div className="ems-salary-bar-bg">
                      <div className="ems-salary-bar" style={{ width: `${(emp.salary / maxSalary) * 100}%` }}></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="ems-actions">
                    <button className="ems-edit" onClick={() => setEditEmp({ ...emp })}>✎ Edit</button>
                    <button className="ems-del" onClick={() => deleteEmployee(emp.id)}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add form */}
      <div className="ems-card">
        <div className="ems-card-header">
          <span className="ems-dot"></span>
          <span className="ems-card-title">Add New Employee</span>
        </div>
        <form className="ems-form" onSubmit={addEmployee}>
          <div className="ems-form-grid">
            {[
              { name: "name", label: "Full Name", placeholder: "e.g. Rahul Sharma", type: "text" },
              { name: "role", label: "Role", placeholder: "e.g. Developer", type: "text" },
              { name: "salary", label: "Salary (₹)", placeholder: "e.g. 45000", type: "number" },
            ].map((f) => (
              <div className="ems-field" key={f.name}>
                <label>{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                  className={errors[f.name] ? "error" : ""}
                  min={f.type === "number" ? 1 : undefined}
                />
                {errors[f.name] && <div className="err-msg">{errors[f.name]}</div>}
              </div>
            ))}
          </div>
          <button type="submit" className="ems-btn-add">+ Add Employee</button>
        </form>
      </div>

      {/* Edit Modal */}
      {editEmp && (
        <div className="ems-modal-overlay" onClick={() => setEditEmp(null)}>
          <div className="ems-modal" onClick={e => e.stopPropagation()}>
            <h3>Edit Employee</h3>
            <div className="ems-modal-fields">
              {[
                { name: "name", label: "Full Name", type: "text" },
                { name: "role", label: "Role", type: "text" },
                { name: "salary", label: "Salary (₹)", type: "number" },
              ].map(f => (
                <div className="ems-field" key={f.name}>
                  <label>{f.label}</label>
                  <input
                    type={f.type}
                    value={editEmp[f.name]}
                    onChange={e => setEditEmp({ ...editEmp, [f.name]: e.target.value })}
                    min={f.type === "number" ? 1 : undefined}
                  />
                </div>
              ))}
            </div>
            <div className="ems-modal-actions">
              <button className="ems-btn-cancel" onClick={() => setEditEmp(null)}>Cancel</button>
              <button className="ems-btn-save" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="ems-toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`ems-toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </div>
  );
}