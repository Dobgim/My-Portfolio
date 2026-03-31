'use strict';
/* =============================================
   ADMIN PANEL - DOBGIMA JOSHUA FONCHAM
   ============================================= */

/* ==============================
   AUTH — SUPABASE AUTH
============================== */
const loginForm   = document.getElementById('loginForm');
const loginError  = document.getElementById('loginError');
const loginScreen = document.getElementById('loginScreen');
const adminApp    = document.getElementById('adminApp');

// Check if there is an active session on page load
async function initAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    showDashboard();
  }
}
initAuth();

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('adminEmail').value.trim();
  const pass  = document.getElementById('adminPass').value;

  const loginBtn = document.getElementById('loginBtn');
  loginBtn.disabled = true;
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

  const { error } = await sb.auth.signInWithPassword({ email, password: pass });

  if (error) {
    loginError.textContent = 'Incorrect email or password.';
    document.getElementById('adminPass').value = '';
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    setTimeout(() => { loginError.textContent = ''; }, 4000);
  } else {
    showDashboard();
  }
});

// Password toggle
document.getElementById('passToggle')?.addEventListener('click', () => {
  const input = document.getElementById('adminPass');
  const icon  = document.getElementById('passEyeIcon');
  const hide  = input.type === 'password';
  input.type  = hide ? 'text' : 'password';
  icon.className = hide ? 'fas fa-eye-slash' : 'fas fa-eye';
});

function showDashboard() {
  loginScreen.style.display = 'none';
  adminApp.style.display = 'flex';
  document.getElementById('adminBody').classList.remove('login-page');
  renderProjects();
  loadProfileAdmin();
  loadCvAdmin();
}

async function adminLogout() {
  await sb.auth.signOut();
  loginScreen.style.display = 'flex';
  adminApp.style.display = 'none';
  document.getElementById('adminBody').classList.add('login-page');
  document.getElementById('adminEmail').value = '';
  document.getElementById('adminPass').value = '';
}

/* ==============================
   PAGE NAVIGATION
============================== */
function showPage(pageId, btn) {
  document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.getElementById('page-' + pageId).classList.add('active');
  btn.classList.add('active');
  document.getElementById('topbarTitle').textContent = btn.textContent.trim();
}

function toggleSidebar() {
  document.getElementById('adminSidebar').classList.toggle('mobile-open');
}

/* ==============================
   URL NORMALIZER
============================== */
function normalizeUrl(url) {
  if (!url) return '';
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) return 'https://' + url;
  return url;
}

/* ==============================
   PROJECTS — SUPABASE CRUD
============================== */
const GRADIENTS = [
  'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
  'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
  'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',
  'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)',
  'linear-gradient(135deg,#fa709a 0%,#fee140 100%)',
  'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)',
  'linear-gradient(135deg,#30cfd0 0%,#330867 100%)',
  'linear-gradient(135deg,#f7971e 0%,#ffd200 100%)',
];

async function getProjects() {
  const { data, error } = await sb.from('projects').select('*').order('created_at', { ascending: true });
  if (error) { console.error('Supabase fetch error:', error); return []; }
  return data || [];
}

async function renderProjects() {
  const projects = await getProjects();
  const list  = document.getElementById('adminProjectsList');
  const empty = document.getElementById('adminEmpty');
  if (!list) return;

  list.querySelectorAll('.admin-project-row').forEach(r => r.remove());
  empty.style.display = projects.length === 0 ? 'block' : 'none';

  projects.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'admin-project-row';
    const gradient = GRADIENTS[i % GRADIENTS.length];
    const thumbHtml = p.image_url
      ? `<img src="${p.image_url}" alt="${p.title}" />`
      : `<i class="${p.icon || 'fas fa-code'}"></i>`;

    const tags = (p.tags || '').split(',').map(t => t.trim()).filter(Boolean)
      .map(t => `<span class="apr-tag">${t}</span>`).join('');

    row.innerHTML = `
      <div class="apr-thumb" style="background:${gradient}">${thumbHtml}</div>
      <div class="apr-info">
        <div class="apr-title">${p.title}</div>
        <div class="apr-tags">${tags}</div>
      </div>
      <div class="apr-links">
        ${p.live_url ? `<a href="${normalizeUrl(p.live_url)}" target="_blank" rel="noopener noreferrer" class="a-btn a-btn-ghost a-btn-sm" title="Live Demo"><i class="fas fa-eye"></i></a>` : ''}
        ${p.code_url ? `<a href="${p.code_url}" target="_blank" class="a-btn a-btn-ghost a-btn-sm" title="Code"><i class="fab fa-github"></i></a>` : ''}
        <button class="a-btn a-btn-ghost a-btn-sm a-btn-icon" onclick="editProject('${p.id}')" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="a-btn a-btn-icon" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#ef4444;" onclick="openDelete('${p.id}', '${p.title.replace(/'/g, "\\'")}')" title="Delete"><i class="fas fa-trash"></i></button>
      </div>`;
    list.appendChild(row);
  });

  updateStats(projects);
}

function updateStats(projects) {
  if (!projects) return;
  document.getElementById('totalProjects').textContent = projects.length;
  document.getElementById('withDemo').textContent = projects.filter(p => p.live_url).length;
  document.getElementById('withCode').textContent = projects.filter(p => p.code_url).length;
}

/* ==============================
   PROJECT MODAL
============================== */
let currentImageBase64 = '';
let editProjectId = null;

function openProjectModal(id = null) {
  editProjectId = id;
  document.getElementById('modalTitle').textContent = id !== null ? 'Edit Project' : 'Add New Project';
  document.getElementById('editIndex').value = id !== null ? id : '';
  clearForm();

  if (id !== null) {
    // Load data for editing
    sb.from('projects').select('*').eq('id', id).single().then(({ data: p }) => {
      if (!p) return;
      document.getElementById('pTitle').value   = p.title || '';
      document.getElementById('pTags').value    = p.tags  || '';
      document.getElementById('pDesc').value    = p.description || '';
      document.getElementById('pLiveUrl').value = p.live_url || '';
      document.getElementById('pCodeUrl').value = p.code_url || '';
      document.getElementById('pIcon').value    = p.icon  || 'fas fa-code';
      if (p.image_url) {
        currentImageBase64 = p.image_url;
        showImagePreview(p.image_url);
      }
    });
  }

  document.getElementById('projectModalOverlay').classList.add('active');
}

function closeProjectModal() {
  document.getElementById('projectModalOverlay').classList.remove('active');
  clearForm();
  editProjectId = null;
}

function clearForm() {
  document.getElementById('projectForm').reset();
  document.getElementById('editIndex').value = '';
  currentImageBase64 = '';
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('imagePreview').src = '';
  document.getElementById('uploadPlaceholder').style.display = 'flex';
  document.getElementById('removeImgBtn').style.display = 'none';
}

function editProject(id) { openProjectModal(id); }

/* ==============================
   IMAGE UPLOAD (Project)
============================== */
const imageUploadArea = document.getElementById('imageUploadArea');
const imageFileInput  = document.getElementById('pImageFile');

imageUploadArea?.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-img-btn') || e.target.closest('.remove-img-btn')) return;
  imageFileInput.click();
});

imageFileInput?.addEventListener('change', () => {
  const file = imageFileInput.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast('Image too large. Max 2MB.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = (e) => { currentImageBase64 = e.target.result; showImagePreview(currentImageBase64); };
  reader.readAsDataURL(file);
});

imageUploadArea?.addEventListener('dragover', (e) => { e.preventDefault(); imageUploadArea.classList.add('drag-over'); });
imageUploadArea?.addEventListener('dragleave', () => imageUploadArea.classList.remove('drag-over'));
imageUploadArea?.addEventListener('drop', (e) => {
  e.preventDefault(); imageUploadArea.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    if (file.size > 2 * 1024 * 1024) { showToast('Image too large. Max 2MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { currentImageBase64 = ev.target.result; showImagePreview(currentImageBase64); };
    reader.readAsDataURL(file);
  }
});

function showImagePreview(src) {
  document.getElementById('imagePreview').src = src;
  document.getElementById('imagePreview').style.display = 'block';
  document.getElementById('uploadPlaceholder').style.display = 'none';
  document.getElementById('removeImgBtn').style.display = 'inline-flex';
}

function removeImage() {
  currentImageBase64 = '';
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('imagePreview').src = '';
  document.getElementById('uploadPlaceholder').style.display = 'flex';
  document.getElementById('removeImgBtn').style.display = 'none';
  imageFileInput.value = '';
}

/* ==============================
   SAVE PROJECT — SUPABASE
============================== */
document.getElementById('projectForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('pTitle').value.trim();
  const desc  = document.getElementById('pDesc').value.trim();
  if (!title || !desc) { showToast('Title and description are required.', 'error'); return; }

  const saveBtn = document.getElementById('saveProjectBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  // Upload image to Supabase Storage if it's a new base64 image
  let imageUrl = currentImageBase64;
  if (currentImageBase64 && currentImageBase64.startsWith('data:')) {
    const ext = currentImageBase64.split(';')[0].split('/')[1] || 'jpg';
    const filename = `projects/img_${Date.now()}.${ext}`;
    const blob = await (await fetch(currentImageBase64)).blob();
    const { error: uploadErr } = await sb.storage.from('portfolio').upload(filename, blob, { upsert: true });
    if (!uploadErr) {
      const { data: urlData } = sb.storage.from('portfolio').getPublicUrl(filename);
      imageUrl = urlData.publicUrl;
    } else {
      console.warn('Image upload error:', uploadErr);
      imageUrl = ''; // fallback: no image
    }
  }

  const project = {
    title,
    tags:        document.getElementById('pTags').value.trim(),
    description: desc,
    live_url:    document.getElementById('pLiveUrl').value.trim(),
    code_url:    document.getElementById('pCodeUrl').value.trim(),
    icon:        document.getElementById('pIcon').value,
    image_url:   imageUrl || '',
  };

  let error;
  if (editProjectId !== null) {
    ({ error } = await sb.from('projects').update(project).eq('id', editProjectId));
    if (!error) showToast('Project updated! ✅', 'success');
  } else {
    ({ error } = await sb.from('projects').insert([project]));
    if (!error) showToast('Project added! ✅', 'success');
  }

  if (error) { showToast('Error saving project. Try again.', 'error'); console.error(error); }

  saveBtn.disabled = false;
  saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Project';
  closeProjectModal();
  renderProjects();
});

/* ==============================
   DELETE PROJECT — SUPABASE
============================== */
let deleteTargetId = null;

function openDelete(id, title) {
  deleteTargetId = id;
  document.getElementById('deleteProjectName').textContent = title;
  document.getElementById('deleteConfirmOverlay').classList.add('active');
}

function closeDelete() {
  deleteTargetId = null;
  document.getElementById('deleteConfirmOverlay').classList.remove('active');
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  const { error } = await sb.from('projects').delete().eq('id', deleteTargetId);
  if (error) { showToast('Error deleting project.', 'error'); return; }
  renderProjects();
  closeDelete();
  showToast('Project deleted.', 'success');
}

/* ==============================
   PROFILE PICTURE — SUPABASE STORAGE
============================== */
let currentProfileBase64 = '';

async function loadProfileAdmin() {
  const { data } = await sb.from('settings').select('value').eq('key', 'profile_pic').single();
  if (data?.value) {
    currentProfileBase64 = data.value;
    document.getElementById('profilePreview').src = data.value;
    document.getElementById('profilePreview').style.display = 'block';
    document.getElementById('profilePlaceholder').style.display = 'none';
    document.getElementById('removeProfileBtn').style.display = 'inline-flex';
  }
}

const profileUploadArea = document.getElementById('profileUploadArea');
const profileFileInput  = document.getElementById('pProfileFile');

profileUploadArea?.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-img-btn') || e.target.closest('.remove-img-btn')) return;
  profileFileInput?.click();
});

profileFileInput?.addEventListener('change', () => {
  const file = profileFileInput.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast('Image too large. Max 2MB.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    currentProfileBase64 = e.target.result;
    document.getElementById('profilePreview').src = currentProfileBase64;
    document.getElementById('profilePreview').style.display = 'block';
    document.getElementById('profilePlaceholder').style.display = 'none';
    document.getElementById('removeProfileBtn').style.display = 'inline-flex';
  };
  reader.readAsDataURL(file);
});

profileUploadArea?.addEventListener('dragover', (e) => { e.preventDefault(); profileUploadArea.classList.add('drag-over'); });
profileUploadArea?.addEventListener('dragleave', () => profileUploadArea.classList.remove('drag-over'));
profileUploadArea?.addEventListener('drop', (e) => {
  e.preventDefault(); profileUploadArea.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    if (file.size > 2 * 1024 * 1024) { showToast('Image too large. Max 2MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      currentProfileBase64 = ev.target.result;
      document.getElementById('profilePreview').src = currentProfileBase64;
      document.getElementById('profilePreview').style.display = 'block';
      document.getElementById('profilePlaceholder').style.display = 'none';
      document.getElementById('removeProfileBtn').style.display = 'inline-flex';
    };
    reader.readAsDataURL(file);
  }
});

function removeProfileImage() {
  currentProfileBase64 = '';
  document.getElementById('profilePreview').style.display = 'none';
  document.getElementById('profilePreview').src = '';
  document.getElementById('profilePlaceholder').style.display = 'flex';
  document.getElementById('removeProfileBtn').style.display = 'none';
  if (profileFileInput) profileFileInput.value = '';
}

document.getElementById('profilePicForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentProfileBase64) { showToast('No image selected.', 'error'); return; }

  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  let picUrl = currentProfileBase64;

  // Upload to Storage if it's a new file (base64), then save public URL
  if (currentProfileBase64.startsWith('data:')) {
    const ext = currentProfileBase64.split(';')[0].split('/')[1] || 'jpg';
    const filename = `profile/profile.${ext}`;
    const blob = await (await fetch(currentProfileBase64)).blob();
    const { error: uploadErr } = await sb.storage.from('portfolio').upload(filename, blob, { upsert: true });
    if (!uploadErr) {
      const { data: urlData } = sb.storage.from('portfolio').getPublicUrl(filename);
      picUrl = urlData.publicUrl;
    }
  }

  await sb.from('settings').upsert({ key: 'profile_pic', value: picUrl }, { onConflict: 'key' });
  btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Save Picture';
  showToast('Profile Picture saved! ✅', 'success');
});

/* ==============================
   CV UPLOAD — SUPABASE STORAGE
============================== */
let currentCvBase64 = '';

async function loadCvAdmin() {
  const { data } = await sb.from('settings').select('value').eq('key', 'cv').single();
  if (data?.value) {
    currentCvBase64 = data.value;
    document.getElementById('cvPreview').style.display = 'block';
    document.getElementById('cvPlaceholder').style.display = 'none';
    document.getElementById('removeCvBtn').style.display = 'inline-flex';
    const urlParts = data.value.split('/');
    document.getElementById('cvFileName').textContent = decodeURIComponent(urlParts[urlParts.length - 1]);
  }
}

const cvUploadArea = document.getElementById('cvUploadArea');
const cvFileInput  = document.getElementById('pCvFile');

cvUploadArea?.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-img-btn') || e.target.closest('.remove-img-btn')) return;
  cvFileInput?.click();
});

cvFileInput?.addEventListener('change', () => {
  const file = cvFileInput.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('File too large. Max 5MB.', 'error'); return; }
  currentCvBase64 = file; // Store file object
  document.getElementById('cvFileName').textContent = file.name;
  document.getElementById('cvPreview').style.display = 'block';
  document.getElementById('cvPlaceholder').style.display = 'none';
  document.getElementById('removeCvBtn').style.display = 'inline-flex';
});

function removeCvFile() {
  currentCvBase64 = '';
  document.getElementById('cvPreview').style.display = 'none';
  document.getElementById('cvPlaceholder').style.display = 'flex';
  document.getElementById('removeCvBtn').style.display = 'none';
  if (cvFileInput) cvFileInput.value = '';
}

document.getElementById('cvForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentCvBase64) { showToast('No CV selected.', 'error'); return; }

  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

  const file = currentCvBase64;
  const filename = `cv/cv_${Date.now()}.pdf`;

  const { error: uploadErr } = await sb.storage.from('portfolio').upload(filename, file, { upsert: true, contentType: file.type || 'application/pdf' });
  if (uploadErr) {
    showToast('Upload failed. Try again.', 'error');
    console.error(uploadErr);
    btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Save CV';
    return;
  }

  const { data: urlData } = sb.storage.from('portfolio').getPublicUrl(filename);
  await sb.from('settings').upsert({ key: 'cv', value: urlData.publicUrl }, { onConflict: 'key' });

  btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Save CV';
  showToast('CV saved! ✅', 'success');
});

/* ==============================
   SETTINGS - CHANGE PASSWORD (Supabase Auth)
============================== */
document.getElementById('changePassForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPass  = document.getElementById('newPass').value;
  const confPass = document.getElementById('confirmPass').value;
  const msgEl    = document.getElementById('passMsg');

  if (newPass.length < 8) {
    msgEl.textContent = 'New password must be at least 8 characters.';
    msgEl.className = 'pass-msg err'; return;
  }
  if (newPass !== confPass) {
    msgEl.textContent = 'Passwords do not match.';
    msgEl.className = 'pass-msg err'; return;
  }

  const { error } = await sb.auth.updateUser({ password: newPass });
  if (error) {
    msgEl.textContent = 'Failed to update password. ' + error.message;
    msgEl.className = 'pass-msg err';
  } else {
    msgEl.textContent = 'Password updated successfully!';
    msgEl.className = 'pass-msg ok';
    document.getElementById('changePassForm').reset();
    setTimeout(() => { msgEl.textContent = ''; }, 3000);
  }
});

/* ==============================
   TOAST NOTIFICATIONS
============================== */
function showToast(msg, type = 'success') {
  const toast = document.getElementById('adminToast');
  toast.textContent = msg;
  toast.className = `admin-toast ${type} show`;
  setTimeout(() => { toast.className = 'admin-toast'; }, 3000);
}

/* ==============================
   KEYBOARD SHORTCUTS & MODAL CLOSE
============================== */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeProjectModal(); closeDelete(); }
});
document.getElementById('projectModalOverlay')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('projectModalOverlay')) closeProjectModal();
});
document.getElementById('deleteConfirmOverlay')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('deleteConfirmOverlay')) closeDelete();
});
