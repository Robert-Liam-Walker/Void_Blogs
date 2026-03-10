import { useState, useEffect, useCallback } from "react";

// ── CONFIG ─────────────────────────────────────────────────────────────────
// Replace with your API Gateway URL after deploying infra/template.yaml
const API_BASE = process.env.REACT_APP_API_URL || "https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod";

// ── STYLES ─────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #0a0a0a;
    --surface:   #0f0f0f;
    --border:    #1e3a1e;
    --green:     #00ff41;
    --green-dim: #00aa2a;
    --green-faint: #003a0a;
    --amber:     #ffb300;
    --red:       #ff3131;
    --text:      #c8ffc8;
    --text-dim:  #4a8a4a;
    --font-mono: 'Share Tech Mono', monospace;
    --font-display: 'VT323', monospace;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1.6;
    min-height: 100vh;
    cursor: default;
  }

  /* scanline overlay */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.08) 2px,
      rgba(0,0,0,0.08) 4px
    );
    pointer-events: none;
    z-index: 9999;
  }

  /* phosphor glow flicker */
  @keyframes flicker {
    0%,100% { opacity: 1; }
    92%      { opacity: 1; }
    93%      { opacity: 0.85; }
    94%      { opacity: 1; }
    96%      { opacity: 0.9; }
    97%      { opacity: 1; }
  }

  #root { animation: flicker 8s infinite; }

  @keyframes blink {
    0%,100% { opacity: 1; }
    50%      { opacity: 0; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes typeIn {
    from { width: 0; }
    to   { width: 100%; }
  }

  @keyframes scanIn {
    from { clip-path: inset(0 0 100% 0); }
    to   { clip-path: inset(0 0 0% 0); }
  }

  /* ── LAYOUT ── */
  .terminal {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px 16px 80px;
    animation: fadeIn 0.4s ease;
  }

  /* ── HEADER ── */
  .header {
    border: 1px solid var(--border);
    border-bottom: none;
    padding: 20px 24px 16px;
    position: relative;
    background: var(--surface);
  }

  .header::before {
    content: '● ● ●';
    position: absolute;
    top: 8px; left: 12px;
    font-size: 10px;
    color: var(--border);
    letter-spacing: 4px;
  }

  .header-title {
    font-family: var(--font-display);
    font-size: 52px;
    color: var(--green);
    text-shadow: 0 0 20px rgba(0,255,65,0.6), 0 0 40px rgba(0,255,65,0.2);
    line-height: 1;
    letter-spacing: 2px;
  }

  .header-sub {
    color: var(--text-dim);
    font-size: 12px;
    margin-top: 4px;
  }

  .header-sub span { color: var(--green-dim); }

  .cursor {
    display: inline-block;
    width: 9px; height: 16px;
    background: var(--green);
    vertical-align: middle;
    margin-left: 4px;
    animation: blink 1s step-end infinite;
    box-shadow: 0 0 8px var(--green);
  }

  /* ── NAV ── */
  .nav {
    border: 1px solid var(--border);
    border-bottom: none;
    border-top: none;
    padding: 8px 24px;
    display: flex;
    gap: 24px;
    background: var(--green-faint);
  }

  .nav-btn {
    background: none;
    border: none;
    color: var(--text-dim);
    font-family: var(--font-mono);
    font-size: 13px;
    cursor: pointer;
    padding: 4px 0;
    transition: color 0.15s;
    letter-spacing: 1px;
  }

  .nav-btn::before { content: '> '; color: var(--border); }
  .nav-btn:hover, .nav-btn.active { color: var(--green); }
  .nav-btn.active::before { color: var(--green); }

  /* ── MAIN PANEL ── */
  .panel {
    border: 1px solid var(--border);
    background: var(--surface);
    padding: 24px;
    animation: fadeIn 0.3s ease;
  }

  .panel-label {
    color: var(--text-dim);
    font-size: 11px;
    letter-spacing: 2px;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  .panel-label em { color: var(--green-dim); font-style: normal; }

  /* ── POST LIST ── */
  .post-list { display: flex; flex-direction: column; gap: 2px; }

  .post-row {
    display: grid;
    grid-template-columns: 140px 1fr 100px;
    gap: 12px;
    align-items: baseline;
    padding: 10px 12px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
    border-radius: 1px;
  }

  .post-row:hover {
    border-color: var(--border);
    background: var(--green-faint);
  }

  .post-row:hover .post-title { color: var(--green); text-shadow: 0 0 8px rgba(0,255,65,0.4); }

  .post-date { color: var(--text-dim); font-size: 12px; white-space: nowrap; }
  .post-title { color: var(--text); font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .post-author { color: var(--text-dim); font-size: 12px; text-align: right; }

  .post-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
  .tag {
    font-size: 11px;
    color: var(--green-dim);
    border: 1px solid var(--border);
    padding: 1px 6px;
    border-radius: 2px;
  }

  /* ── SINGLE POST ── */
  .post-detail { animation: fadeIn 0.25s ease; }

  .post-meta {
    display: flex;
    gap: 16px;
    color: var(--text-dim);
    font-size: 12px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }

  .post-meta span { color: var(--green-dim); }

  .post-full-title {
    font-family: var(--font-display);
    font-size: 36px;
    color: var(--green);
    text-shadow: 0 0 12px rgba(0,255,65,0.4);
    margin-bottom: 8px;
    line-height: 1.1;
  }

  .post-content {
    color: var(--text);
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .back-btn {
    background: none;
    border: 1px solid var(--border);
    color: var(--text-dim);
    font-family: var(--font-mono);
    font-size: 12px;
    cursor: pointer;
    padding: 6px 12px;
    margin-bottom: 20px;
    transition: all 0.15s;
  }

  .back-btn:hover { border-color: var(--green-dim); color: var(--green); }

  .delete-btn {
    background: none;
    border: 1px solid #3a0000;
    color: #aa2222;
    font-family: var(--font-mono);
    font-size: 12px;
    cursor: pointer;
    padding: 6px 12px;
    margin-top: 24px;
    transition: all 0.15s;
    float: right;
  }

  .delete-btn:hover { border-color: var(--red); color: var(--red); }

  /* ── NEW POST FORM ── */
  .form { display: flex; flex-direction: column; gap: 16px; }

  .form-group { display: flex; flex-direction: column; gap: 6px; }

  .form-label {
    color: var(--text-dim);
    font-size: 11px;
    letter-spacing: 2px;
  }

  .form-label::before { content: '// '; color: var(--border); }

  .form-input, .form-textarea {
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 14px;
    padding: 10px 12px;
    outline: none;
    resize: none;
    transition: border-color 0.15s;
    width: 100%;
  }

  .form-input:focus, .form-textarea:focus {
    border-color: var(--green-dim);
    box-shadow: 0 0 0 1px var(--green-faint);
  }

  .form-textarea { min-height: 200px; line-height: 1.7; }

  .submit-btn {
    background: var(--green-faint);
    border: 1px solid var(--green-dim);
    color: var(--green);
    font-family: var(--font-mono);
    font-size: 14px;
    cursor: pointer;
    padding: 12px 24px;
    letter-spacing: 2px;
    transition: all 0.15s;
    align-self: flex-start;
  }

  .submit-btn:hover {
    background: #005010;
    box-shadow: 0 0 12px rgba(0,255,65,0.2);
  }

  .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── STATES ── */
  .loading {
    color: var(--text-dim);
    padding: 32px 0;
    text-align: center;
  }

  .loading::after {
    content: '';
    animation: dots 1.5s infinite;
  }

  @keyframes dots {
    0%   { content: '.'; }
    33%  { content: '..'; }
    66%  { content: '...'; }
  }

  .empty { color: var(--text-dim); padding: 24px 0; font-size: 13px; }
  .empty::before { content: '// '; color: var(--border); }

  .error-msg {
    color: var(--red);
    font-size: 12px;
    margin-top: 8px;
  }

  .success-msg {
    color: var(--green);
    font-size: 12px;
    margin-top: 8px;
  }

  .status-bar {
    border: 1px solid var(--border);
    border-top: none;
    background: var(--green-faint);
    padding: 4px 24px;
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--text-dim);
  }

  /* scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); }
  ::-webkit-scrollbar-thumb:hover { background: var(--green-dim); }
`;

// ── UTILS ──────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "----/--/--";
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

// ── API ────────────────────────────────────────────────────────────────────
const api = {
  getPosts:    ()           => fetch(`${API_BASE}/posts`).then(r => r.json()),
  getPost:     (id)         => fetch(`${API_BASE}/posts/${id}`).then(r => r.json()),
  createPost:  (data)       => fetch(`${API_BASE}/posts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  deletePost:  (id)         => fetch(`${API_BASE}/posts/${id}`, { method: "DELETE" }).then(r => r.json()),
};

// ── COMPONENTS ─────────────────────────────────────────────────────────────

function PostList({ onSelect }) {
  const [posts, setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    api.getPosts()
      .then(data => setPosts(data.posts || []))
      .catch(() => setError("CONNECTION_REFUSED"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">FETCHING POSTS FROM VOID</div>;
  if (error)   return <div className="error-msg">ERR: {error} — check API_BASE in config</div>;

  return (
    <>
      <div className="panel-label">
        <em>VOID://POSTS</em> — {posts.length} entr{posts.length === 1 ? "y" : "ies"} found
      </div>
      {posts.length === 0
        ? <div className="empty">no posts yet. the void is empty.</div>
        : (
          <div className="post-list">
            {posts.map(post => (
              <div key={post.postId} className="post-row" onClick={() => onSelect(post.postId)}>
                <span className="post-date">{formatDate(post.createdAt)}</span>
                <div>
                  <div className="post-title">{post.title}</div>
                  {post.tags?.length > 0 && (
                    <div className="post-tags">{post.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
                  )}
                </div>
                <span className="post-author">@{post.author}</span>
              </div>
            ))}
          </div>
        )
      }
    </>
  );
}

function PostDetail({ postId, onBack }) {
  const [post, setPost]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.getPost(postId)
      .then(data => setPost(data.post))
      .finally(() => setLoading(false));
  }, [postId]);

  const handleDelete = async () => {
    if (!window.confirm("delete this post from the void?")) return;
    setDeleting(true);
    await api.deletePost(postId);
    onBack();
  };

  if (loading) return <div className="loading">LOADING TRANSMISSION</div>;
  if (!post)   return <div className="error-msg">ERR: post not found in void</div>;

  return (
    <div className="post-detail">
      <button className="back-btn" onClick={onBack}>← BACK</button>
      <div className="post-full-title">{post.title}</div>
      <div className="post-meta">
        <span>DATE: <span>{formatDate(post.createdAt)}</span></span>
        <span>AUTHOR: <span>@{post.author}</span></span>
        {post.tags?.length > 0 && (
          <span>TAGS: <span>{post.tags.join(", ")}</span></span>
        )}
      </div>
      <div className="post-content">{post.content}</div>
      <button className="delete-btn" onClick={handleDelete} disabled={deleting}>
        {deleting ? "DELETING..." : "[ DELETE ]"}
      </button>
    </div>
  );
}

function NewPost({ onDone }) {
  const [form, setForm]     = useState({ title: "", content: "", author: "", tags: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setStatus({ type: "error", msg: "ERR: title and content required" });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      const data = await api.createPost({ ...form, tags });
      if (data.post) {
        setStatus({ type: "success", msg: `OK: post "${data.post.title}" written to void` });
        setForm({ title: "", content: "", author: "", tags: "" });
        setTimeout(onDone, 1200);
      } else {
        setStatus({ type: "error", msg: "ERR: " + (data.error || "unknown error") });
      }
    } catch {
      setStatus({ type: "error", msg: "ERR: CONNECTION_REFUSED" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="panel-label"><em>VOID://NEW_POST</em> — compose transmission</div>
      <div className="form">
        <div className="form-group">
          <label className="form-label">TITLE</label>
          <input className="form-input" value={form.title} onChange={set("title")} placeholder="enter post title..." maxLength={120} />
        </div>
        <div className="form-group">
          <label className="form-label">AUTHOR</label>
          <input className="form-input" value={form.author} onChange={set("author")} placeholder="anonymous" maxLength={50} />
        </div>
        <div className="form-group">
          <label className="form-label">TAGS (comma separated)</label>
          <input className="form-input" value={form.tags} onChange={set("tags")} placeholder="thoughts, void, misc" />
        </div>
        <div className="form-group">
          <label className="form-label">CONTENT</label>
          <textarea className="form-textarea" value={form.content} onChange={set("content")} placeholder="write into the void..." />
        </div>
        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "TRANSMITTING..." : "> SEND TO VOID"}
        </button>
        {status && <div className={status.type === "error" ? "error-msg" : "success-msg"}>{status.msg}</div>}
      </div>
    </>
  );
}

// ── APP ────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]     = useState("list");   // list | post | new
  const [postId, setPostId] = useState(null);
  const [time, setTime]     = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const goList = useCallback(() => { setView("list"); setPostId(null); }, []);
  const goPost = useCallback((id) => { setPostId(id); setView("post"); }, []);
  const goNew  = useCallback(() => setView("new"), []);

  return (
    <>
      <style>{styles}</style>
      <div className="terminal">

        <div className="header">
          <div className="header-title">VOID_BLOGS<span className="cursor" /></div>
          <div className="header-sub">
            <span>SYSTEM://</span>spot for blogs that nobody's going to read
          </div>
        </div>

        <div className="nav">
          <button className={`nav-btn ${view === "list" ? "active" : ""}`} onClick={goList}>LIST_ALL</button>
          <button className={`nav-btn ${view === "new"  ? "active" : ""}`} onClick={goNew}>NEW_POST</button>
        </div>

        <div className="panel">
          {view === "list" && <PostList onSelect={goPost} />}
          {view === "post" && <PostDetail postId={postId} onBack={goList} />}
          {view === "new"  && <NewPost onDone={goList} />}
        </div>

        <div className="status-bar">
          <span>VOID_BLOGS v0.1.0 // AWS:LAMBDA+DYNAMODB</span>
          <span>{time.toISOString().replace("T", " ").slice(0, 19)} UTC</span>
        </div>

      </div>
    </>
  );
}
