import { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "";
const HAS_API_CONFIG = Boolean(API_BASE && !API_BASE.includes("YOUR_API_ID"));

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #070b09;
    --surface: rgba(11, 16, 13, 0.92);
    --surface-strong: rgba(8, 13, 10, 0.98);
    --border: #173f24;
    --border-bright: #26643a;
    --green: #68ff9f;
    --green-dim: #46be73;
    --green-faint: rgba(27, 72, 42, 0.35);
    --amber: #ffd166;
    --red: #ff6b6b;
    --text: #dcffe6;
    --text-dim: #84bb97;
    --font-mono: 'Share Tech Mono', monospace;
    --font-display: 'VT323', monospace;
  }

  html { scroll-behavior: smooth; }

  body {
    min-height: 100vh;
    background:
      radial-gradient(circle at top, rgba(52, 124, 78, 0.14), transparent 35%),
      linear-gradient(180deg, #09100c 0%, #050706 100%);
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1.6;
  }

  body::before {
    content: "";
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.12) 2px,
      rgba(0, 0, 0, 0.12) 4px
    );
    pointer-events: none;
    z-index: 9999;
  }

  @keyframes flicker {
    0%, 100% { opacity: 1; }
    92% { opacity: 1; }
    93% { opacity: 0.88; }
    94% { opacity: 1; }
    96% { opacity: 0.94; }
    97% { opacity: 1; }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  #root { animation: flicker 8s infinite; }

  .terminal {
    max-width: 960px;
    margin: 0 auto;
    padding: 28px 16px 80px;
    animation: fadeIn 0.4s ease;
  }

  .header {
    position: relative;
    border: 1px solid var(--border);
    border-bottom: none;
    padding: 20px 24px 16px;
    background: linear-gradient(180deg, rgba(13, 19, 15, 0.98), rgba(9, 14, 11, 0.95));
  }

  .header::before {
    content: "SYS LOG";
    position: absolute;
    top: 8px;
    left: 12px;
    color: var(--text-dim);
    font-size: 10px;
    letter-spacing: 3px;
  }

  .header-title {
    font-family: var(--font-display);
    font-size: 56px;
    color: var(--green);
    line-height: 1;
    letter-spacing: 2px;
    text-shadow: 0 0 18px rgba(104, 255, 159, 0.45);
  }

  .header-sub {
    margin-top: 6px;
    color: var(--text-dim);
    font-size: 12px;
  }

  .header-sub span {
    color: var(--green-dim);
  }

  .cursor {
    display: inline-block;
    width: 9px;
    height: 16px;
    margin-left: 4px;
    background: var(--green);
    vertical-align: middle;
    animation: blink 1s step-end infinite;
    box-shadow: 0 0 8px rgba(104, 255, 159, 0.9);
  }

  .nav {
    display: flex;
    gap: 24px;
    border: 1px solid var(--border);
    border-top: none;
    border-bottom: none;
    padding: 8px 24px;
    background: var(--green-faint);
  }

  .nav-btn {
    border: none;
    background: none;
    color: var(--text-dim);
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 1px;
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .nav-btn::before {
    content: "> ";
    color: var(--border-bright);
  }

  .nav-btn:hover,
  .nav-btn.active {
    color: var(--green);
  }

  .nav-btn.active::before {
    color: var(--green);
  }

  .panel {
    border: 1px solid var(--border);
    background: var(--surface);
    padding: 24px;
    animation: fadeIn 0.3s ease;
  }

  .panel-label {
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
    color: var(--text-dim);
    font-size: 11px;
    letter-spacing: 2px;
  }

  .panel-label em {
    color: var(--green-dim);
    font-style: normal;
  }

  .notice {
    margin-bottom: 16px;
    padding: 10px 12px;
    border: 1px solid rgba(255, 209, 102, 0.45);
    background: rgba(255, 209, 102, 0.08);
    color: var(--amber);
    font-size: 12px;
  }

  .post-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .post-row {
    display: grid;
    grid-template-columns: 130px 1fr 110px;
    gap: 12px;
    align-items: start;
    padding: 10px 12px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .post-row:hover {
    border-color: var(--border-bright);
    background: rgba(19, 51, 29, 0.32);
  }

  .post-row:hover .post-title {
    color: var(--green);
  }

  .post-date,
  .post-author {
    color: var(--text-dim);
    font-size: 12px;
    white-space: nowrap;
  }

  .post-author {
    text-align: right;
  }

  .post-title {
    color: var(--text);
    font-size: 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .post-excerpt {
    margin-top: 4px;
    color: var(--text-dim);
    font-size: 12px;
  }

  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
  }

  .tag {
    padding: 1px 6px;
    border: 1px solid var(--border);
    color: var(--green-dim);
    font-size: 11px;
  }

  .post-detail {
    animation: fadeIn 0.25s ease;
  }

  .post-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
    color: var(--text-dim);
    font-size: 12px;
  }

  .post-meta span span {
    color: var(--green-dim);
  }

  .post-full-title {
    margin-bottom: 8px;
    color: var(--green);
    font-family: var(--font-display);
    font-size: 38px;
    line-height: 1.1;
    text-shadow: 0 0 12px rgba(104, 255, 159, 0.28);
  }

  .post-content {
    color: var(--text);
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .button-row {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .back-btn,
  .delete-btn,
  .refresh-btn,
  .submit-btn {
    font-family: var(--font-mono);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .back-btn,
  .refresh-btn {
    padding: 8px 12px;
    border: 1px solid var(--border);
    background: none;
    color: var(--text-dim);
    font-size: 12px;
  }

  .back-btn:hover,
  .refresh-btn:hover {
    border-color: var(--green-dim);
    color: var(--green);
  }

  .delete-btn {
    margin-top: 24px;
    padding: 8px 12px;
    border: 1px solid rgba(255, 107, 107, 0.35);
    background: none;
    color: #ff8f8f;
    font-size: 12px;
  }

  .delete-btn:hover {
    border-color: var(--red);
    color: var(--red);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-label {
    color: var(--text-dim);
    font-size: 11px;
    letter-spacing: 2px;
  }

  .form-label::before {
    content: "// ";
    color: var(--border-bright);
  }

  .form-input,
  .form-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border);
    background: var(--surface-strong);
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .form-input:focus,
  .form-textarea:focus {
    border-color: var(--green-dim);
    box-shadow: 0 0 0 1px rgba(70, 190, 115, 0.22);
  }

  .form-textarea {
    min-height: 220px;
    resize: vertical;
    line-height: 1.7;
  }

  .submit-btn {
    align-self: flex-start;
    padding: 12px 24px;
    border: 1px solid var(--green-dim);
    background: rgba(19, 61, 34, 0.7);
    color: var(--green);
    font-size: 14px;
    letter-spacing: 2px;
  }

  .submit-btn:hover {
    background: rgba(28, 83, 47, 0.92);
    box-shadow: 0 0 12px rgba(104, 255, 159, 0.12);
  }

  .submit-btn:disabled,
  .delete-btn:disabled,
  .refresh-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .loading,
  .empty {
    padding: 24px 0;
    color: var(--text-dim);
    text-align: center;
  }

  .error-msg {
    margin-top: 8px;
    color: var(--red);
    font-size: 12px;
  }

  .success-msg {
    margin-top: 8px;
    color: var(--green);
    font-size: 12px;
  }

  .status-bar {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    border: 1px solid var(--border);
    border-top: none;
    padding: 6px 24px;
    background: var(--green-faint);
    color: var(--text-dim);
    font-size: 11px;
  }

  @media (max-width: 720px) {
    .header-title { font-size: 44px; }
    .nav { gap: 16px; overflow-x: auto; }
    .post-row {
      grid-template-columns: 1fr;
      gap: 6px;
    }
    .post-author { text-align: left; }
    .status-bar {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;

function formatDate(iso) {
  if (!iso) {
    return "----/--/--";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "----/--/--";
  }

  return date.toISOString().slice(0, 10);
}

function shorten(text, length = 96) {
  if (!text) {
    return "";
  }

  return text.length > length ? `${text.slice(0, length).trim()}...` : text;
}

async function fetchJson(path, options) {
  if (!HAS_API_CONFIG) {
    throw new Error("API_NOT_CONFIGURED");
  }

  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `REQUEST_FAILED_${response.status}`);
  }

  return data;
}

const api = {
  getPosts: () => fetchJson("/posts"),
  getPost: (id) => fetchJson(`/posts/${id}`),
  createPost: (data) =>
    fetchJson("/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  deletePost: (id) =>
    fetchJson(`/posts/${id}`, {
      method: "DELETE",
    }),
};

function ConfigNotice() {
  if (HAS_API_CONFIG) {
    return null;
  }

  return (
    <div className="notice">
      API endpoint is not configured. Set <code>REACT_APP_API_URL</code> to your API Gateway
      URL before trying to fetch or publish posts.
    </div>
  );
}

function PostList({ onSelect, reloadToken }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError(null);

    api
      .getPosts()
      .then((data) => {
        if (!ignore) {
          setPosts(data.posts || []);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message);
          setPosts([]);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [reloadToken]);

  if (loading) {
    return <div className="loading">FETCHING POSTS FROM VOID...</div>;
  }

  if (error) {
    return <div className="error-msg">ERR: {error}</div>;
  }

  return (
    <>
      <div className="panel-label">
        <em>VOID://POSTS</em> - {posts.length} entr{posts.length === 1 ? "y" : "ies"} found
      </div>
      {posts.length === 0 ? (
        <div className="empty">No posts yet. The void is currently silent.</div>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <div key={post.postId} className="post-row" onClick={() => onSelect(post.postId)}>
              <span className="post-date">{formatDate(post.createdAt)}</span>
              <div>
                <div className="post-title">{post.title}</div>
                <div className="post-excerpt">{shorten(post.content)}</div>
                {post.tags?.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="post-author">@{post.author || "anonymous"}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function PostDetail({ postId, onBack, onDeleted }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError(null);

    api
      .getPost(postId)
      .then((data) => {
        if (!ignore) {
          setPost(data.post || null);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message);
          setPost(null);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [postId]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this post from the void?")) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await api.deletePost(postId);
      onDeleted();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="loading">LOADING TRANSMISSION...</div>;
  }

  if (error) {
    return <div className="error-msg">ERR: {error}</div>;
  }

  if (!post) {
    return <div className="error-msg">ERR: post not found in void</div>;
  }

  return (
    <div className="post-detail">
      <div className="button-row">
        <button className="back-btn" onClick={onBack}>
          BACK
        </button>
      </div>
      <div className="post-full-title">{post.title}</div>
      <div className="post-meta">
        <span>
          DATE: <span>{formatDate(post.createdAt)}</span>
        </span>
        <span>
          AUTHOR: <span>@{post.author || "anonymous"}</span>
        </span>
        {post.tags?.length > 0 && (
          <span>
            TAGS: <span>{post.tags.join(", ")}</span>
          </span>
        )}
      </div>
      <div className="post-content">{post.content}</div>
      <button className="delete-btn" onClick={handleDelete} disabled={deleting}>
        {deleting ? "DELETING..." : "[ DELETE ]"}
      </button>
      {error && <div className="error-msg">ERR: {error}</div>}
    </div>
  );
}

function NewPost({ onDone }) {
  const [form, setForm] = useState({ title: "", content: "", author: "", tags: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setStatus({ type: "error", msg: "ERR: title and content are required" });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const tags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const data = await api.createPost({
        title: form.title.trim(),
        content: form.content.trim(),
        author: form.author.trim(),
        tags,
      });

      setStatus({
        type: "success",
        msg: `OK: post "${data.post.title}" written to void`,
      });
      setForm({ title: "", content: "", author: "", tags: "" });
      setTimeout(onDone, 900);
    } catch (err) {
      setStatus({ type: "error", msg: `ERR: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="panel-label">
        <em>VOID://NEW_POST</em> - compose transmission
      </div>
      <ConfigNotice />
      <div className="form">
        <div className="form-group">
          <label className="form-label">TITLE</label>
          <input
            className="form-input"
            value={form.title}
            onChange={setField("title")}
            placeholder="enter post title..."
            maxLength={120}
          />
        </div>
        <div className="form-group">
          <label className="form-label">AUTHOR</label>
          <input
            className="form-input"
            value={form.author}
            onChange={setField("author")}
            placeholder="anonymous"
            maxLength={50}
          />
        </div>
        <div className="form-group">
          <label className="form-label">TAGS (comma separated)</label>
          <input
            className="form-input"
            value={form.tags}
            onChange={setField("tags")}
            placeholder="thoughts, void, misc"
          />
        </div>
        <div className="form-group">
          <label className="form-label">CONTENT</label>
          <textarea
            className="form-textarea"
            value={form.content}
            onChange={setField("content")}
            placeholder="write into the void..."
          />
        </div>
        <button className="submit-btn" onClick={handleSubmit} disabled={loading || !HAS_API_CONFIG}>
          {loading ? "TRANSMITTING..." : "> SEND TO VOID"}
        </button>
        {status && (
          <div className={status.type === "error" ? "error-msg" : "success-msg"}>{status.msg}</div>
        )}
      </div>
    </>
  );
}

export default function App() {
  const [view, setView] = useState("list");
  const [postId, setPostId] = useState(null);
  const [time, setTime] = useState(new Date());
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const goList = () => {
    setView("list");
    setPostId(null);
  };

  const goPost = (id) => {
    setPostId(id);
    setView("post");
  };

  const goNew = () => {
    setView("new");
  };

  const refreshPosts = () => {
    setReloadToken((current) => current + 1);
    goList();
  };

  return (
    <>
      <style>{styles}</style>
      <div className="terminal">
        <div className="header">
          <div className="header-title">
            VOID_BLOGS<span className="cursor" />
          </div>
          <div className="header-sub">
            <span>SYSTEM://</span> a small signal in a very large void
          </div>
        </div>

        <div className="nav">
          <button className={`nav-btn ${view === "list" ? "active" : ""}`} onClick={goList}>
            LIST_ALL
          </button>
          <button className={`nav-btn ${view === "new" ? "active" : ""}`} onClick={goNew}>
            NEW_POST
          </button>
          <button className="nav-btn" onClick={refreshPosts}>
            REFRESH
          </button>
        </div>

        <div className="panel">
          {view === "list" && (
            <>
              <ConfigNotice />
              <PostList onSelect={goPost} reloadToken={reloadToken} />
            </>
          )}
          {view === "post" && <PostDetail postId={postId} onBack={goList} onDeleted={refreshPosts} />}
          {view === "new" && <NewPost onDone={refreshPosts} />}
        </div>

        <div className="status-bar">
          <span>
            VOID_BLOGS v1.0.0 // API {HAS_API_CONFIG ? "CONNECTED" : "UNCONFIGURED"}
          </span>
          <span>{time.toISOString().replace("T", " ").slice(0, 19)} UTC</span>
        </div>
      </div>
    </>
  );
}
