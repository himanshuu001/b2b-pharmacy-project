let currentStep = 1;
  let selectedRole = '';
  const roleLabels = {
    dist: 'distributor / Stockist',
    ret:  'Retailer / Chemist',
    hosp: 'Hospital / Institution',
    mfr:  'Manufacturer'
  };
  
  function selectRole(el, role) {
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    selectedRole = role;
    document.getElementById('roleError').style.display = 'none';
  }

  function gotoStep(n) {
    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('step' + n).classList.add('active');
    currentStep = n;
    updateSidebar(n);
    updateProgress(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goNext(from) {
    if (from === 1) {
      if (!selectedRole) { document.getElementById('roleError').style.display = 'block'; return; }
    }
    if (from === 5) return;
    gotoStep(from + 1);
    if (from + 1 === 5) populateReview();
  }

  function goBack(from) {
    if (from <= 1) return;
    gotoStep(from - 1);
  }

  function updateProgress(step) {
    const pct = (step / 5) * 100;
    document.getElementById('progressBar').style.width = pct + '%';
  }

  function updateSidebar(step) {
    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById('sl-' + i);
      const num = el.querySelector('.step-num');
      el.classList.remove('active','done','upcoming');
      if (i < step)  { el.classList.add('done');    num.textContent = '✓'; }
      if (i === step){ el.classList.add('active');   num.textContent = i;  }
      if (i > step)  { el.classList.add('upcoming'); num.textContent = i;  }
    }
  }

  function populateReview() {
    document.getElementById('rv-role').textContent     = roleLabels[selectedRole] || '—';
    document.getElementById('rv-bizName').textContent  = v('bizName');
    document.getElementById('rv-ownerName').textContent= v('ownerName');
    document.getElementById('rv-bizEmail').textContent = v('bizEmail');
    document.getElementById('rv-bizMobile').textContent= v('bizMobile');
    document.getElementById('rv-bizState').textContent = v('bizState');
    document.getElementById('rv-bizCity').textContent  = v('bizCity');
    document.getElementById('rv-bizGst').textContent   = v('bizGst') || 'Not provided';
    document.getElementById('rv-bizPin').textContent   = v('bizPin');
    document.getElementById('rv-dlNum').textContent    = v('dlNum');
    document.getElementById('rv-dlExpiry').textContent = v('dlExpiry');
    document.getElementById('rv-panNum').textContent   = v('panNum');
    document.getElementById('rv-accName').textContent  = v('accName');
    document.getElementById('rv-ifsc').textContent     = v('ifsc') || 'Not provided';
    document.getElementById('rv-bankName').textContent = v('bankName') || 'Not provided';
  }

  function v(id) {
    const el = document.getElementById(id);
    return el ? (el.value.trim() || '—') : '—';
  }

  async function submitForm() {
    if (!document.getElementById('chk1').checked || !document.getElementById('chk2').checked) {
      alert('Please agree to the Terms of Service and confirm document validity to proceed.');
      return;
    }

    const name     = v('ownerName');
    const email    = v('bizEmail');
    const pwEl     = document.querySelector('input[type="password"]');
    const password = pwEl ? pwEl.value : '';

    if (!name || name === '—' || !email || email === '—' || !password || !selectedRole) {
      alert('Please complete all required fields before submitting.');
      return;
    }

    const btn = document.getElementById('submitBtn');
    btn.textContent = 'Submitting…';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    try {
      const res  = await fetch('http://localhost:5001/api/auth/signup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password, role: selectedRole })
      });
      const data = await res.json();

      if (!data.success) {
        btn.textContent = 'Submit Application';
        btn.disabled = false;
        btn.style.opacity = '1';
        alert(data.message || 'Registration failed. Please try again.');
        return;
      }

      localStorage.setItem('ff_token', data.token);
      localStorage.setItem('ff_user',  JSON.stringify(data.user));

      document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('progressBar').style.width = '100%';
      const screen = document.getElementById('successScreen');
      screen.classList.add('show');
      const ref = 'FF-2025-' + Math.floor(10000 + Math.random() * 90000);
      document.getElementById('successRef').textContent = 'Application Ref: ' + ref;
      for (let i = 1; i <= 5; i++) {
        const el = document.getElementById('sl-' + i);
        el.className = 'step-item done';
        el.querySelector('.step-num').textContent = '✓';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      btn.textContent = 'Submit Application';
      btn.disabled = false;
      btn.style.opacity = '1';
      alert('Could not reach the server. Is it running on port 5001?');
    }
  }

  function togglePw(id, btn) {
    const inp = document.getElementById(id);
    if (inp.type === 'password') { inp.type = 'text'; btn.textContent = 'Hide'; }
    else { inp.type = 'password'; btn.textContent = 'Show'; }
  }

  function checkStrength(val) {
    const bars  = [document.getElementById('bar1'), document.getElementById('bar2'), document.getElementById('bar3'), document.getElementById('bar4')];
    const label = document.getElementById('pwLabel');
    bars.forEach(b => b.className = 'pw-bar');
    if (!val) { label.className = 'pw-label'; label.textContent = 'Enter a password'; return; }
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const levels = [
      { cls:'weak',   txt:'Weak',   color:'weak-t' },
      { cls:'fair',   txt:'Fair',   color:'fair-t' },
      { cls:'good',   txt:'Good',   color:'good-t' },
      { cls:'strong', txt:'Strong', color:'strong-t' }
    ];
    const lvl = levels[score - 1] || levels[0];
    for (let i = 0; i < score; i++) bars[i].classList.add(lvl.cls);
    label.className = 'pw-label ' + lvl.color;
    label.textContent = lvl.txt + ' password';
  }

  function sendOtp() {
    const mob = document.getElementById('verifyMobile').value.trim();
    if (!mob) { alert('Please enter your mobile number first.'); return; }
    document.getElementById('otpSection').style.display = 'block';
    const btn = document.getElementById('sendOtpBtn');
    btn.textContent = 'Sent ✓';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = 'Resend OTP'; btn.disabled = false; }, 30000);
    document.getElementById('otp0').focus();
  }

  function otpNext(el, idx) {
    el.value = el.value.replace(/[^0-9]/g,'');
    if (el.value && idx < 5) document.getElementById('otp' + (idx+1)).focus();
  }

  function handleUpload(input, zoneId, valId) {
    if (input.files && input.files[0]) {
      const fname = input.files[0].name;
      document.getElementById(valId).textContent = '✓ ' + fname;
      document.getElementById(zoneId).style.borderColor = 'var(--emerald)';
      document.getElementById(zoneId).style.background  = 'rgba(18,184,134,0.07)';
    }
  }

  function formatDate(el) {
    let v = el.value.replace(/\D/g,'');
    if (v.length >= 3) v = v.slice(0,2) + ' / ' + v.slice(2);
    if (v.replace(/\D/g,'').length >= 5) v = v.slice(0,7) + ' / ' + v.replace(/\D/g,'').slice(4);
    el.value = v.slice(0,14);
  }