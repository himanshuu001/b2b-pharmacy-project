const API = 'http://localhost:5001/api/auth';

// ── Role selector ─────────────────────────────────────────────────────────────
const roles = {
  dist: { tag: '<i class="ri-shopping-bag-line"></i> DISTRIBUTOR / STOCKIST', tagClass: 'tag-dist', btn: 'Sign in as Distributor →' },
  ret:  { tag: '<i class="ri-price-tag-3-line"></i> RETAILER / CHEMIST',      tagClass: 'tag-ret',  btn: 'Sign in as Retailer →'    },
  hosp: { tag: '<i class="ri-hospital-line"></i> HOSPITAL / INSTITUTION',     tagClass: 'tag-hosp', btn: 'Sign in as Hospital →'    },
  mfr:  { tag: '<i class="ri-building-2-line"></i> MANUFACTURER',             tagClass: 'tag-mfr',  btn: 'Sign in as Manufacturer →'}
};

let activeRole = 'dist';

function selectRole(btn, role) {
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeRole = role;
  const r = roles[role];
  const ctag = document.getElementById('contextTag');
  ctag.className = 'context-tag ' + r.tagClass;
  ctag.innerHTML = r.tag;
  document.getElementById('signinBtn').textContent = r.btn;
}

// ── Password toggle ───────────────────────────────────────────────────────────
function togglePw() {
  const inp = document.getElementById('password');
  const btn = document.querySelector('.pw-toggle');
  if (inp.type === 'password') {
    inp.type = 'text';
    btn.innerHTML = '<i class="ri-eye-off-line"></i>';
  } else {
    inp.type = 'password';
    btn.innerHTML = '<i class="ri-eye-line"></i>';
  }
}

// ── Status message helper ─────────────────────────────────────────────────────
function showMsg(text, type = 'error') {
  const el = document.getElementById('authMessage');
  el.textContent = text;
  el.className = 'auth-msg auth-msg--' + type;
  el.style.display = 'block';
}
function hideMsg() {
  document.getElementById('authMessage').style.display = 'none';
}

// ── Login handler ─────────────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  hideMsg();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn      = document.getElementById('signinBtn');

  // Basic client-side check
  if (!email || !password) {
    showMsg('Please enter your email and password.');
    return;
  }

  btn.textContent = 'Authenticating…';
  btn.disabled    = true;
  btn.style.opacity = '0.7';

  try {
    const res  = await fetch(`${API}/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password, role: activeRole })
    });
    const data = await res.json();

    if (!data.success) {
      showMsg(data.message || 'Login failed. Please try again.');
      btn.textContent  = roles[activeRole].btn;
      btn.disabled     = false;
      btn.style.opacity = '1';
      return;
    }

    // Store token + user
    localStorage.setItem('ff_token', data.token);
    localStorage.setItem('ff_user',  JSON.stringify(data.user));

    btn.textContent  = '✓ Redirecting to Dashboard…';
    btn.style.opacity = '1';
    btn.style.background = 'linear-gradient(135deg,#12b886,#0ca678)';
    btn.style.boxShadow  = '0 4px 22px rgba(18,184,134,0.45)';

    setTimeout(() => { window.location.href = 'dashboard.html'; }, 600);

  } catch (err) {
    showMsg('Could not reach the server. Is it running on port 5001?');
    btn.textContent  = roles[activeRole].btn;
    btn.disabled     = false;
    btn.style.opacity = '1';
  }
}

// ── Auto-redirect if already logged in ───────────────────────────────────────
(function checkSession() {
  const token = localStorage.getItem('ff_token');
  if (token) window.location.href = 'dashboard.html';
})();
