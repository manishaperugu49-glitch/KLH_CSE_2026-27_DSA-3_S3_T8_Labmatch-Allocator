import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity, ArrowRight, BarChart3, BookOpen, CheckCircle2, ChevronRight,
  CircleHelp, Database, GitBranch, GraduationCap, FlaskConical, Home,
  Info, Layers3, Menu, Network, Plus, RefreshCw, Search, Settings2,
  ShieldCheck, Sparkles, Trash2, Users, X, Zap
} from "lucide-react";
import "./styles.css";

const initialLabs = [
  { id: "LAB-01", name: "Data Structures Lab", capacity: 3, room: "Block A • 201" },
  { id: "LAB-02", name: "Programming Lab", capacity: 3, room: "Block A • 202" },
  { id: "LAB-03", name: "Database Lab", capacity: 2, room: "Block B • 105" },
  { id: "LAB-04", name: "Computer Networks Lab", capacity: 2, room: "Block B • 106" }
];

const initialStudents = [
  { id: "STU-001", name: "Aarav Sharma", preferences: ["LAB-01", "LAB-02"] },
  { id: "STU-002", name: "Ananya Rao", preferences: ["LAB-01", "LAB-03"] },
  { id: "STU-003", name: "Rahul Kumar", preferences: ["LAB-02", "LAB-04"] },
  { id: "STU-004", name: "Priya Reddy", preferences: ["LAB-01", "LAB-02", "LAB-03"] },
  { id: "STU-005", name: "Vikram Singh", preferences: ["LAB-02", "LAB-04"] },
  { id: "STU-006", name: "Sneha Patel", preferences: ["LAB-03", "LAB-04"] },
  { id: "STU-007", name: "Kiran Das", preferences: ["LAB-01", "LAB-04"] },
  { id: "STU-008", name: "Meera Nair", preferences: ["LAB-02", "LAB-03"] }
];

const navItems = [
  ["dashboard", "Dashboard", Home],
  ["students", "Students", Users],
  ["labs", "Laboratories", FlaskConical],
  ["allocation", "Allocation", GitBranch],
  ["graph", "Graph View", Network],
  ["about", "About Project", BookOpen]
];

function runMatching(students, labs) {
  // Capacity-aware Maximum Bipartite Matching.
  // Each lab is represented by one slot per available capacity.
  const slots = [];
  labs.forEach(lab => {
    for (let i = 0; i < lab.capacity; i++) {
      slots.push({ labId: lab.id, slot: i + 1 });
    }
  });

  const slotOwner = new Map();
  const studentToLab = new Map();
  const steps = [];

  function tryAssign(student, visited) {
    for (const labId of student.preferences) {
      const labSlots = slots.filter(s => s.labId === labId);
      for (const s of labSlots) {
        const key = `${s.labId}::${s.slot}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const previousStudent = slotOwner.get(key);
        steps.push({
          type: "check",
          student: student.id,
          studentName: student.name,
          labId,
          slot: s.slot,
          previousStudent: previousStudent || null
        });

        if (!previousStudent || tryAssign(students.find(x => x.id === previousStudent), visited)) {
          slotOwner.set(key, student.id);
          studentToLab.set(student.id, labId);
          steps.push({
            type: "match",
            student: student.id,
            studentName: student.name,
            labId,
            slot: s.slot,
            replaced: previousStudent || null
          });
          return true;
        }
      }
    }
    steps.push({ type: "unmatched", student: student.id, studentName: student.name });
    return false;
  }

  for (const student of students) tryAssign(student, new Set());

  const assignments = students.map(student => ({
    studentId: student.id,
    studentName: student.name,
    labId: studentToLab.get(student.id) || null,
    labName: labs.find(l => l.id === studentToLab.get(student.id))?.name || null
  }));

  return { assignments, steps };
}

function App() {
  const [page, setPage] = useState("dashboard");
  const [students, setStudents] = useState(initialStudents);
  const [labs, setLabs] = useState(initialLabs);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [allocation, setAllocation] = useState(() => runMatching(initialStudents, initialLabs).assignments);
  const [lastRun, setLastRun] = useState(new Date());
  const [toast, setToast] = useState("");

  const result = useMemo(() => runMatching(students, labs), [students, labs]);
  const allocatedCount = allocation.filter(a => a.labId).length;
  const unallocatedCount = students.length - allocatedCount;
  const totalCapacity = labs.reduce((sum, l) => sum + l.capacity, 0);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  function executeAllocation() {
    setAllocation(result.assignments);
    setLastRun(new Date());
    setPage("allocation");
    showToast("Maximum Bipartite Matching completed successfully.");
  }

  function resetDemo() {
    setStudents(initialStudents);
    setLabs(initialLabs);
    setAllocation(runMatching(initialStudents, initialLabs).assignments);
    setLastRun(new Date());
    showToast("Demo data restored.");
  }

  const currentTitle = navItems.find(n => n[0] === page)?.[1] || "Dashboard";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Network size={21}/></div>
          <div>
            <div className="brand-name">LabMatch</div>
            <div className="brand-sub">ALLOCATOR</div>
          </div>
        </div>

        <div className="nav-label">MAIN MENU</div>
        <nav>
          {navItems.map(([id, label, Icon]) => (
            <button key={id} className={`nav-item ${page === id ? "active" : ""}`}
              onClick={() => { setPage(id); setSidebarOpen(false); }}>
              <Icon size={18}/><span>{label}</span>
              {id === "allocation" && <span className="nav-dot">•</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="algorithm-card">
            <div className="algo-icon"><GitBranch size={18}/></div>
            <div>
              <strong>Maximum Matching</strong>
              <span>DSA Core Algorithm</span>
            </div>
          </div>
          <button className="nav-item" onClick={resetDemo}><RefreshCw size={18}/><span>Reset Demo</span></button>
          <div className="profile-mini">
            <div className="avatar">M</div>
            <div><strong>Team 8</strong><span>DSA-3 Project</span></div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu/></button>
          <div>
            <div className="breadcrumb">LabMatch <ChevronRight size={13}/> {currentTitle}</div>
            <h1>{currentTitle}</h1>
          </div>
          <div className="top-actions">
            <div className="status-pill"><span className="status-dot"></span> System Online</div>
            <button className="icon-btn" title="Help"><CircleHelp size={19}/></button>
            <button className="avatar top-avatar">M</button>
          </div>
        </header>

        <div className="content">
          {page === "dashboard" && <Dashboard students={students} labs={labs} allocation={allocation}
            allocatedCount={allocatedCount} unallocatedCount={unallocatedCount} totalCapacity={totalCapacity}
            onAllocate={executeAllocation} setPage={setPage} lastRun={lastRun}/>}
          {page === "students" && <StudentsPage students={students} labs={labs} search={search} setSearch={setSearch}
            onAdd={() => setShowStudentModal(true)} onDelete={id => {setStudents(students.filter(s=>s.id!==id)); showToast("Student removed.");}}/>}
          {page === "labs" && <LabsPage labs={labs} students={students} allocation={allocation}
            onAdd={() => setShowLabModal(true)} onDelete={id => {setLabs(labs.filter(l=>l.id!==id)); showToast("Laboratory removed.");}}/>}
          {page === "allocation" && <AllocationPage students={students} labs={labs} allocation={allocation}
            result={result} onRun={executeAllocation} lastRun={lastRun}/>}
          {page === "graph" && <GraphPage students={students} labs={labs} allocation={allocation}/>}
          {page === "about" && <AboutPage/>}
        </div>
      </main>

      {showStudentModal && <StudentModal labs={labs} students={students}
        onClose={() => setShowStudentModal(false)}
        onSave={student => {setStudents([...students, student]); setShowStudentModal(false); showToast("Student added.");}}/>}
      {showLabModal && <LabModal labs={labs}
        onClose={() => setShowLabModal(false)}
        onSave={lab => {setLabs([...labs, lab]); setShowLabModal(false); showToast("Laboratory added.");}}/>}
      {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
    </div>
  );
}

function Dashboard({students, labs, allocation, allocatedCount, unallocatedCount, totalCapacity, onAllocate, setPage, lastRun}) {
  const usage = labs.map(lab => {
    const used = allocation.filter(a => a.labId === lab.id).length;
    return {...lab, used};
  });
  return <div className="page">
    <section className="hero">
      <div>
        <div className="eyebrow"><Sparkles size={14}/> SMART DSA ALLOCATION</div>
        <h2>Allocate students to<br/><span>the right laboratory.</span></h2>
        <p>Automate student–laboratory assignment using Maximum Bipartite Matching while respecting laboratory capacity and student preferences.</p>
        <div className="hero-actions">
          <button className="primary-btn" onClick={onAllocate}><Zap size={17}/> Run Allocation <ArrowRight size={17}/></button>
          <button className="secondary-btn" onClick={() => setPage("graph")}><Network size={17}/> View Graph</button>
        </div>
      </div>
      <div className="hero-visual">
        <div className="orb orb1"></div><div className="orb orb2"></div>
        <div className="matching-preview">
          <div className="preview-title"><Network size={15}/> Bipartite Graph</div>
          <div className="preview-flow">
            <div><span className="node student-node">S1</span><span className="node student-node">S2</span><span className="node student-node">S3</span></div>
            <div className="lines"><i></i><i></i><i></i><i></i></div>
            <div><span className="node lab-node">L1</span><span className="node lab-node">L2</span><span className="node lab-node">L3</span></div>
          </div>
          <div className="preview-match"><CheckCircle2 size={14}/> Maximum matching found</div>
        </div>
      </div>
    </section>

    <div className="stats-grid">
      <Stat icon={Users} label="Total Students" value={students.length} sub="Registered students" />
      <Stat icon={FlaskConical} label="Laboratories" value={labs.length} sub={`${totalCapacity} total seats`} />
      <Stat icon={CheckCircle2} label="Allocated" value={allocatedCount} sub={`${students.length ? Math.round(allocatedCount/students.length*100) : 0}% allocation rate`} positive />
      <Stat icon={Activity} label="Unallocated" value={unallocatedCount} sub="Need manual review" warning />
    </div>

    <div className="section-head">
      <div><h3>Allocation Overview</h3><p>Current laboratory capacity and assignment status</p></div>
      <button className="text-btn" onClick={() => setPage("allocation")}>View details <ArrowRight size={15}/></button>
    </div>
    <div className="overview-grid">
      <div className="panel capacity-panel">
        <div className="panel-title"><span>Laboratory Capacity</span><span className="muted">Used / Total</span></div>
        {usage.map(lab => <div className="capacity-row" key={lab.id}>
          <div className="capacity-label"><div className="lab-symbol"><FlaskConical size={15}/></div><div><strong>{lab.name}</strong><span>{lab.id} • {lab.room}</span></div></div>
          <div className="capacity-bar-wrap"><div className="capacity-bar"><div style={{width:`${Math.min(100, lab.used/lab.capacity*100)}%`}}></div></div><span>{lab.used}/{lab.capacity}</span></div>
        </div>)}
      </div>
      <div className="panel quick-panel">
        <div className="panel-title">Quick Actions</div>
        <QuickAction icon={Users} title="Add Student" desc="Register a new student" onClick={() => setPage("students")}/>
        <QuickAction icon={FlaskConical} title="Manage Labs" desc="Update laboratory capacity" onClick={() => setPage("labs")}/>
        <QuickAction icon={Network} title="Explore Graph" desc="See the bipartite network" onClick={() => setPage("graph")}/>
      </div>
    </div>
    <div className="last-run"><Activity size={15}/> Last allocation run: <strong>{lastRun.toLocaleString()}</strong></div>
  </div>
}

function Stat({icon: Icon,label,value,sub,positive,warning}) {
  return <div className="stat-card"><div className={`stat-icon ${positive?"green":warning?"orange":""}`}><Icon size={19}/></div><div><span>{label}</span><strong>{value}</strong><small className={positive?"positive":warning?"warning":""}>{sub}</small></div></div>
}
function QuickAction({icon:Icon,title,desc,onClick}) {
  return <button className="quick-action" onClick={onClick}><div className="quick-icon"><Icon size={18}/></div><div><strong>{title}</strong><span>{desc}</span></div><ArrowRight size={16}/></button>
}

function StudentsPage({students,labs,search,setSearch,onAdd,onDelete}) {
  const filtered = students.filter(s => `${s.id} ${s.name}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="page">
    <PageIntro icon={Users} title="Student Management" desc="Register students and define their preferred laboratories." action="+ Add Student" onAction={onAdd}/>
    <div className="toolbar"><div className="search-box"><Search size={17}/><input placeholder="Search students..." value={search} onChange={e=>setSearch(e.target.value)}/></div><span className="result-count">{filtered.length} students</span></div>
    <div className="panel table-panel"><table><thead><tr><th>Student</th><th>Student ID</th><th>Preferences</th><th>Preference Count</th><th>Action</th></tr></thead><tbody>
      {filtered.map(s=><tr key={s.id}><td><div className="person"><div className="person-avatar">{s.name.charAt(0)}</div><strong>{s.name}</strong></div></td><td><code>{s.id}</code></td><td><div className="tag-list">{s.preferences.map(p=><span className="tag" key={p}>{labs.find(l=>l.id===p)?.name || p}</span>)}</div></td><td>{s.preferences.length}</td><td><button className="danger-icon" onClick={()=>onDelete(s.id)}><Trash2 size={16}/></button></td></tr>)}
    </tbody></table></div>
  </div>
}

function LabsPage({labs,students,allocation,onAdd,onDelete}) {
  return <div className="page">
    <PageIntro icon={FlaskConical} title="Laboratory Management" desc="Configure laboratories, rooms, and available capacities." action="+ Add Laboratory" onAction={onAdd}/>
    <div className="lab-grid">{labs.map(lab=>{
      const used=allocation.filter(a=>a.labId===lab.id).length;
      const interested=students.filter(s=>s.preferences.includes(lab.id)).length;
      return <div className="lab-card" key={lab.id}>
        <div className="lab-card-top"><div className="big-lab-icon"><FlaskConical/></div><button className="danger-icon" onClick={()=>onDelete(lab.id)}><Trash2 size={16}/></button></div>
        <span className="lab-id">{lab.id}</span><h3>{lab.name}</h3><p>{lab.room}</p>
        <div className="lab-metrics"><div><span>Capacity</span><strong>{lab.capacity}</strong></div><div><span>Allocated</span><strong>{used}</strong></div><div><span>Interested</span><strong>{interested}</strong></div></div>
        <div className="capacity-bar"><div style={{width:`${Math.min(100,used/lab.capacity*100)}%`}}></div></div>
      </div>
    })}</div>
  </div>
}

function AllocationPage({students,labs,allocation,result,onRun,lastRun}) {
  const allocated=allocation.filter(a=>a.labId);
  const unallocated=allocation.filter(a=>!a.labId);
  return <div className="page">
    <PageIntro icon={GitBranch} title="Allocation Engine" desc="Run Maximum Bipartite Matching to generate student–laboratory assignments." action="Run Matching" onAction={onRun}/>
    <div className="algorithm-banner"><div className="algo-big"><GitBranch/></div><div><strong>Maximum Bipartite Matching</strong><p>Students and laboratories are treated as two sets of vertices. An edge exists when a student prefers a laboratory. Laboratory capacity is represented using multiple matching slots.</p></div><div className="complexity"><span>Algorithm</span><strong>Augmenting Path</strong></div></div>
    <div className="allocation-summary"><Stat icon={CheckCircle2} label="Successful Assignments" value={allocated.length} sub="Matching found" positive/><Stat icon={CircleHelp} label="Unallocated" value={unallocated.length} sub="No available match" warning/><Stat icon={Database} label="Matching Attempts" value={result.steps.length} sub="Graph operations"/></div>
    <div className="panel table-panel"><div className="panel-title"><span>Allocation Report</span><span className="muted">Generated {lastRun.toLocaleString()}</span></div><table><thead><tr><th>Student</th><th>Student ID</th><th>Assigned Laboratory</th><th>Status</th></tr></thead><tbody>
      {allocation.map(a=><tr key={a.studentId}><td><div className="person"><div className="person-avatar">{a.studentName.charAt(0)}</div><strong>{a.studentName}</strong></div></td><td><code>{a.studentId}</code></td><td>{a.labName ? <span className="assignment"><FlaskConical size={15}/>{a.labName}</span> : <span className="muted">No laboratory available</span>}</td><td>{a.labId?<span className="status success"><CheckCircle2 size={14}/> Allocated</span>:<span className="status failed"><X size={14}/> Unallocated</span>}</td></tr>)}
    </tbody></table></div>
  </div>
}

function GraphPage({students,labs,allocation}) {
  const width=900, leftX=145, rightX=755;
  const studentY = i => 100 + i * Math.min(62, 420/Math.max(1,students.length));
  const labY = i => 100 + i * Math.min(90, 420/Math.max(1,labs.length));
  const edges=[];
  students.forEach((s,si)=>s.preferences.forEach(lid=>{
    const li=labs.findIndex(l=>l.id===lid);
    if(li>=0) edges.push({si,li,matched:allocation.find(a=>a.studentId===s.id)?.labId===lid});
  }));
  return <div className="page">
    <PageIntro icon={Network} title="Bipartite Graph View" desc="Visual representation of student preferences and the resulting matching."/>
    <div className="graph-legend"><span><i className="legend-dot student"></i> Students</span><span><i className="legend-dot lab"></i> Laboratories</span><span><i className="legend-line"></i> Preference edge</span><span><i className="legend-line matched"></i> Matched edge</span></div>
    <div className="panel graph-panel">
      <div className="graph-label student-label"><Users size={15}/> STUDENTS</div><div className="graph-label lab-label"><FlaskConical size={15}/> LABORATORIES</div>
      <svg viewBox={`0 0 ${width} 560`} className="graph-svg">
        {edges.map((e,i)=><line key={i} x1={leftX+22} y1={studentY(e.si)} x2={rightX-22} y2={labY(e.li)} className={e.matched?"edge matched":"edge"}/>)}
        {students.map((s,i)=><g key={s.id}><circle cx={leftX} cy={studentY(i)} r="24" className="student-circle"/><text x={leftX} y={studentY(i)+5} textAnchor="middle">S{i+1}</text><text x={leftX+37} y={studentY(i)+5} className="node-name">{s.name}</text></g>)}
        {labs.map((l,i)=><g key={l.id}><circle cx={rightX} cy={labY(i)} r="25" className="lab-circle"/><text x={rightX} y={labY(i)+5} textAnchor="middle">L{i+1}</text><text x={rightX-38} y={labY(i)+5} textAnchor="end" className="node-name">{l.name.replace(" Lab","")}</text></g>)}
      </svg>
      <div className="graph-note"><Info size={15}/><span>Highlighted edges show the current student → laboratory assignments.</span></div>
    </div>
  </div>
}

function AboutPage() {
  return <div className="page">
    <PageIntro icon={BookOpen} title="About LabMatch Allocator" desc="A Data Structures and Algorithms project based on Maximum Bipartite Matching."/>
    <div className="about-grid">
      <div className="panel about-main"><div className="about-icon"><Network/></div><span className="eyebrow">PROJECT OVERVIEW</span><h2>Automated Student–Laboratory Allocation System</h2><p>Laboratory allocation becomes challenging when multiple students prefer the same laboratory while each laboratory has limited capacity. LabMatch automates this allocation process through Maximum Bipartite Matching.</p><p>Students and laboratories are represented as two separate sets of vertices. An edge is created between a student and a laboratory when the student prefers that laboratory. The algorithm searches for augmenting paths to maximize successful assignments.</p></div>
      <div className="panel"><h3>DSA Concepts Used</h3><div className="concept"><div><GitBranch/></div><span><strong>Bipartite Graph</strong><small>Two disjoint sets: students and laboratories</small></span></div><div className="concept"><div><Zap/></div><span><strong>Maximum Matching</strong><small>Maximizes valid student–lab assignments</small></span></div><div className="concept"><div><RefreshCw/></div><span><strong>Augmenting Path</strong><small>Reassigns existing matches when needed</small></span></div><div className="concept"><div><Layers3/></div><span><strong>Capacity Handling</strong><small>Multiple slots represent laboratory capacity</small></span></div></div>
    </div>
    <div className="team-banner"><GraduationCap/><div><strong>Data Structures and Algorithms - 3</strong><span>Team 8 • Section 3 • Academic Year 2026–2027</span></div><span className="team-members">P. Renuka Chowdary • Manisha • U. Sri Laxmi</span></div>
  </div>
}

function PageIntro({icon:Icon,title,desc,action,onAction}) {
  return <div className="page-intro"><div className="intro-left"><div className="intro-icon"><Icon size={21}/></div><div><h2>{title}</h2><p>{desc}</p></div></div>{action&&<button className="primary-btn" onClick={onAction}><Plus size={16}/>{action}</button>}</div>
}

function StudentModal({labs,students,onClose,onSave}) {
  const [name,setName]=useState(""); const [prefs,setPrefs]=useState([]);
  const toggle=l=>setPrefs(p=>p.includes(l)?p.filter(x=>x!==l):[...p,l]);
  const save=()=>{if(!name.trim()||!prefs.length)return;onSave({id:`STU-${String(students.length+1).padStart(3,"0")}`,name:name.trim(),preferences:prefs});};
  return <Modal title="Add Student" onClose={onClose}><label>Student Name<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Enter student name"/></label><label>Preferred Laboratories</label><div className="check-grid">{labs.map(l=><button type="button" className={`check-option ${prefs.includes(l.id)?"selected":""}`} onClick={()=>toggle(l.id)} key={l.id}>{prefs.includes(l.id)?<CheckCircle2 size={16}/>:<FlaskConical size={16}/>}<span>{l.name}<small>{l.id} • capacity {l.capacity}</small></span></button>)}</div><div className="modal-actions"><button className="secondary-btn" onClick={onClose}>Cancel</button><button className="primary-btn" disabled={!name.trim()||!prefs.length} onClick={save}>Add Student</button></div></Modal>
}
function LabModal({labs,onClose,onSave}) {
  const [name,setName]=useState(""); const [room,setRoom]=useState(""); const [capacity,setCapacity]=useState(2);
  const save=()=>{if(!name.trim())return;onSave({id:`LAB-${String(labs.length+1).padStart(2,"0")}`,name:name.trim(),room:room||"Not specified",capacity:Number(capacity)||1});};
  return <Modal title="Add Laboratory" onClose={onClose}><label>Laboratory Name<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. AI Lab"/></label><div className="form-row"><label>Room<input value={room} onChange={e=>setRoom(e.target.value)} placeholder="Block C • 301"/></label><label>Capacity<input type="number" min="1" max="100" value={capacity} onChange={e=>setCapacity(e.target.value)}/></label></div><div className="modal-actions"><button className="secondary-btn" onClick={onClose}>Cancel</button><button className="primary-btn" disabled={!name.trim()} onClick={save}>Add Laboratory</button></div></Modal>
}
function Modal({title,onClose,children}) {return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose}><X/></button></div>{children}</div></div>}

createRoot(document.getElementById("root")).render(<App />);
