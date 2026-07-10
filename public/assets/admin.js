document.addEventListener('DOMContentLoaded', () => {
    
    const API_BASE = '/v1/admin';
    let allRegistrations = [];

    // --- Custom Alert, Confirm & Toast Notification System ---
    const showToast = (message, type = 'success') => {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = '';
        if (type === 'success') {
            icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
        } else if (type === 'error') {
            icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
        } else {
            icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
        }

        toast.innerHTML = `
            ${icon}
            <span>${message}</span>
        `;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => {
                toast.remove();
                if (container.childNodes.length === 0) container.remove();
            });
        }, 3000);
    };

    const showConfirm = (title, message, confirmText = 'Confirm', type = 'confirm') => {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'custom-modal-overlay';
            
            let iconHtml = '';
            if (type === 'confirm') {
                iconHtml = `<div class="custom-modal-icon confirm"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>`;
            } else if (type === 'warning') {
                iconHtml = `<div class="custom-modal-icon warning"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>`;
            } else {
                iconHtml = `<div class="custom-modal-icon critical"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>`;
            }

            overlay.innerHTML = `
                <div class="custom-modal">
                    <div class="custom-modal-header">
                        ${iconHtml}
                        <h3>${title}</h3>
                    </div>
                    <div class="custom-modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="custom-modal-footer">
                        <button class="btn-ghost btn-small" id="customConfirmCancel">Cancel</button>
                        <button class="btn-primary btn-small" id="customConfirmOk">${confirmText}</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            const cleanUp = (result) => {
                overlay.remove();
                resolve(result);
            };

            overlay.querySelector('#customConfirmCancel').addEventListener('click', () => cleanUp(false));
            overlay.querySelector('#customConfirmOk').addEventListener('click', () => cleanUp(true));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) cleanUp(false);
            });
        });
    };

    const showAlert = (title, message) => {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'custom-modal-overlay';
            overlay.innerHTML = `
                <div class="custom-modal">
                    <div class="custom-modal-header">
                        <div class="custom-modal-icon confirm">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                        </div>
                        <h3>${title}</h3>
                    </div>
                    <div class="custom-modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="custom-modal-footer">
                        <button class="btn-primary btn-small" id="customAlertOk">OK</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            const cleanUp = () => {
                overlay.remove();
                resolve();
            };

            overlay.querySelector('#customAlertOk').addEventListener('click', cleanUp);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) cleanUp();
            });
        });
    };

    // --- Authentication ---
    const getToken = () => localStorage.getItem('admin_token');
    const setToken = (token) => localStorage.setItem('admin_token', token);
    const clearToken = () => localStorage.removeItem('admin_token');

    // --- Login Logic ---
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        if (getToken()) {
            window.location.href = '/admin/dashboard';
            return;
        }

        // Password Toggle
        const togglePasswordBtn = document.getElementById('togglePasswordBtn');
        const passwordInput = document.getElementById('password');
        const eyeIcon = document.getElementById('eyeIcon');
        if (togglePasswordBtn && passwordInput) {
            togglePasswordBtn.addEventListener('click', () => {
                const isPassword = passwordInput.getAttribute('type') === 'password';
                passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
                
                if (isPassword) {
                    // Show eye-off icon
                    eyeIcon.innerHTML = `
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    `;
                } else {
                    // Show eye icon
                    eyeIcon.innerHTML = `
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    `;
                }
            });
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('loginError');
            const loader = document.getElementById('loginLoader');

            loader.classList.remove('hidden');
            errorDiv.textContent = '';

            try {
                const res = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();

                if (res.ok && data.success) {
                    setToken(data.token);
                    window.location.href = '/admin/dashboard';
                } else {
                    errorDiv.textContent = data.message || 'Login failed.';
                }
            } catch (err) {
                errorDiv.textContent = 'Server error. Please try again.';
            } finally {
                loader.classList.add('hidden');
            }
        });
    }

    // --- Dashboard Logic ---
    const dashboardBody = document.querySelector('.dashboard-body');
    if (dashboardBody) {
        if (!getToken()) {
            window.location.href = '/admin/login';
            return;
        }

        // Initialize Premium App Shell Interactivity
        const initPremiumShell = () => {
            const sidebar = document.getElementById('appSidebar');
            const toggleBtn = document.getElementById('sidebarToggle');
            if (sidebar && toggleBtn) {
                const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
                if (isCollapsed) sidebar.classList.add('collapsed');
                
                toggleBtn.addEventListener('click', () => {
                    sidebar.classList.toggle('collapsed');
                    localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
                });
            }

            const searchBar = document.getElementById('globalCommandSearch');
            if (searchBar) {
                window.addEventListener('keydown', (e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                        e.preventDefault();
                        searchBar.focus();
                    }
                });
                searchBar.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase().trim();
                    if (!query) return;
                    const links = document.querySelectorAll('.nav-links li');
                    links.forEach(link => {
                        const text = link.textContent.toLowerCase();
                        link.style.outline = text.includes(query) ? '2px solid var(--fao-accent)' : '';
                    });
                });
                searchBar.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const query = e.target.value.toLowerCase().trim();
                        const links = document.querySelectorAll('.nav-links li');
                        for (let link of links) {
                            if (link.textContent.toLowerCase().includes(query)) {
                                link.click();
                                searchBar.value = '';
                                searchBar.blur();
                                break;
                            }
                        }
                    }
                });
            }

            const profileToggle = document.getElementById('profileMenuToggle');
            const profileDropdown = document.getElementById('profileDropdown');
            if (profileToggle && profileDropdown) {
                profileToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    profileDropdown.classList.toggle('show');
                });
                document.addEventListener('click', (e) => {
                    if (!profileToggle.contains(e.target) && !profileDropdown.contains(e.target)) {
                        profileDropdown.classList.remove('show');
                    }
                });
            }

            const dropLogout = document.getElementById('dropdownLogoutBtn');
            if (dropLogout) {
                dropLogout.addEventListener('click', async () => {
                    const confirmed = await showConfirm('Secure Logout', 'Are you sure you want to log out of the Event Command Center?', 'Logout', 'warning');
                    if (confirmed) {
                        clearToken();
                        window.location.href = '/admin/login';
                    }
                });
            }

            const standardLogout = document.getElementById('logoutBtn');
            if (standardLogout) {
                standardLogout.addEventListener('click', async () => {
                    const confirmed = await showConfirm('Secure Logout', 'Are you sure you want to log out of the Event Command Center?', 'Logout', 'warning');
                    if (confirmed) {
                        clearToken();
                        window.location.href = '/admin/login';
                    }
                });
            }

            // Setup Details Tabs
            const tabBtns = document.querySelectorAll('.modal-tab-btn');
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    tabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const tabId = btn.dataset.tab;
                    document.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    const targetContent = document.getElementById(tabId);
                    if (targetContent) targetContent.classList.add('active');
                });
            });
        };

        initPremiumShell();

        // Navigation
        const navLinks = document.querySelectorAll('.nav-links li');
        const sections = document.querySelectorAll('.content-section');
        const breadcrumb = document.getElementById('activeBreadcrumb');

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.forEach(l => l.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));
                link.classList.add('active');
                document.getElementById(link.dataset.target).classList.add('active');
                if (breadcrumb) {
                    breadcrumb.textContent = link.querySelector('span').textContent;
                }
            });
        });

        // Fetch Data
        const authHeaders = {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        };

        const loadDashboard = async () => {
            try {
                // Fetch Stats
                const statsRes = await fetch(`${API_BASE}/stats`, { headers: authHeaders });
                if (statsRes.status === 401) throw new Error('Unauthorized');
                const statsData = await statsRes.json();
                
                if (statsData.success) {
                    document.getElementById('statTotal').textContent = statsData.data.total;
                    document.getElementById('statApproved').textContent = statsData.data.approved;
                    document.getElementById('statPending').textContent = statsData.data.pending;
                    document.getElementById('statInPerson').textContent = statsData.data.inPerson;
                    document.getElementById('statVirtual').textContent = statsData.data.virtual;
                }

                // Fetch Registrations
                const regRes = await fetch(`${API_BASE}/registrations`, { headers: authHeaders });
                const regData = await regRes.json();

                if (regData.success) {
                    allRegistrations = regData.data;
                    renderTable();
                    renderCharts();
                }

            } catch (err) {
                if (err.message === 'Unauthorized') {
                    clearToken();
                    window.location.href = '/admin/login';
                } else {
                    console.error('Error loading dashboard data', err);
                }
            }
        };

        // Render Analytics Charts
        const renderCharts = () => {
            const modeChart = document.getElementById('modeChart');
            const typeChart = document.getElementById('typeChart');
            if (!modeChart || !typeChart) return;

            // Mode Breakdown counts
            let inPersonCount = 0;
            let onlineCount = 0;
            allRegistrations.forEach(r => {
                if (r.attendance_mode === 'in-person') inPersonCount++;
                else if (r.attendance_mode === 'online') onlineCount++;
            });
            const modeTotal = inPersonCount + onlineCount || 1;
            const inPersonPct = Math.round((inPersonCount / modeTotal) * 100);
            const onlinePct = Math.round((onlineCount / modeTotal) * 100);

            modeChart.innerHTML = `
                <div class="chart-row">
                    <div class="chart-label-group">
                        <span class="chart-label">In-Person</span>
                        <span class="chart-count">${inPersonCount} (${inPersonPct}%)</span>
                    </div>
                    <div class="chart-bar-bg">
                        <div class="chart-bar-fill bg-primary" style="width: ${inPersonPct}%"></div>
                    </div>
                </div>
                <div class="chart-row">
                    <div class="chart-label-group">
                        <span class="chart-label">Virtual</span>
                        <span class="chart-count">${onlineCount} (${onlinePct}%)</span>
                    </div>
                    <div class="chart-bar-bg">
                        <div class="chart-bar-fill bg-success" style="width: ${onlinePct}%"></div>
                    </div>
                </div>
            `;

            // Type Breakdown counts
            const types = {};
            allRegistrations.forEach(r => {
                const t = r.registration_type || 'other';
                types[t] = (types[t] || 0) + 1;
            });

            const typeTotal = allRegistrations.length || 1;
            let typeHtml = '';
            const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-purple', 'bg-rose'];
            let colorIdx = 0;

            Object.entries(types).forEach(([type, count]) => {
                const pct = Math.round((count / typeTotal) * 100);
                const colorClass = colors[colorIdx % colors.length];
                colorIdx++;

                typeHtml += `
                    <div class="chart-row">
                        <div class="chart-label-group">
                            <span class="chart-label">${type}</span>
                            <span class="chart-count">${count} (${pct}%)</span>
                        </div>
                        <div class="chart-bar-bg">
                            <div class="chart-bar-fill ${colorClass}" style="width: ${pct}%"></div>
                        </div>
                    </div>
                `;
            });

            typeChart.innerHTML = typeHtml || '<p class="placeholder-text">No registrations data available.</p>';
        };

        // Render Table
        const renderTable = () => {
            const tbody = document.getElementById('registrationsBody');
            const search = document.getElementById('searchInput').value.toLowerCase();
            const filterMode = document.getElementById('filterMode').value;
            const filterStatus = document.getElementById('filterStatus').value;

            tbody.innerHTML = '';
            
            // Reset Select All
            const selectAllCheckbox = document.getElementById('selectAllCheckbox');
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            updateBatchActionsBar();

            const filtered = allRegistrations.filter(r => {
                const name = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
                const email = (r.email || '').toLowerCase();
                const matchSearch = name.includes(search) || email.includes(search);
                
                const rMode = r.attendance_mode || 'none';
                const matchMode = filterMode === 'all' || rMode === filterMode;

                const rStatus = r.approval_status !== undefined ? String(r.approval_status) : "0";
                const matchStatus = filterStatus === 'all' || rStatus === filterStatus;

                return matchSearch && matchMode && matchStatus;
            });

            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No records found.</td></tr>';
                return;
            }

            filtered.forEach(r => {
                const tr = document.createElement('tr');
                
                let statusBadge = '';
                if (r.approval_status === 1) statusBadge = '<span class="badge badge-success">Approved</span>';
                else if (r.approval_status === -1) statusBadge = '<span class="badge badge-danger">Rejected</span>';
                else statusBadge = '<span class="badge badge-warning">Pending</span>';

                let modeBadge = r.attendance_mode === 'in-person' 
                                ? '<span class="badge badge-info">In-Person</span>' 
                                : '<span class="badge badge-info">Virtual</span>';

                tr.innerHTML = `
                    <td><input type="checkbox" class="row-checkbox" data-id="${r.id}"></td>
                    <td>${r.first_name} ${r.last_name}</td>
                    <td>${r.email}</td>
                    <td><span style="text-transform: capitalize;">${r.registration_type}</span></td>
                    <td>${modeBadge}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="action-dropdown">
                            <button class="dropdown-trigger" data-id="${r.id}">
                                Actions
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </button>
                            <div class="dropdown-menu" id="dropdown-${r.id}">
                                <button class="dropdown-item view-btn" data-id="${r.id}">View Details</button>
                                ${r.approval_status !== 1 ? `<button class="dropdown-item text-success approve-btn" data-id="${r.id}">Approve</button>` : ''}
                                ${r.approval_status !== -1 ? `<button class="dropdown-item text-warning reject-btn" data-id="${r.id}">Reject</button>` : ''}
                                <button class="dropdown-item text-danger del-btn" data-id="${r.id}">Delete</button>
                            </div>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Attach events for Dropdowns
            document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = trigger.dataset.id;
                    const menu = document.getElementById(`dropdown-${id}`);
                    
                    // Close all others first
                    document.querySelectorAll('.dropdown-menu').forEach(m => {
                        if (m !== menu) m.classList.remove('show');
                    });
                    
                    menu.classList.toggle('show');
                });
            });

            // Close dropdowns on document click
            document.addEventListener('click', () => {
                document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
            });

            // Attach events for Actions
            document.querySelectorAll('.view-btn').forEach(b => b.addEventListener('click', handleView));
            document.querySelectorAll('.approve-btn').forEach(b => b.addEventListener('click', handleApprove));
            document.querySelectorAll('.reject-btn').forEach(b => b.addEventListener('click', handleReject));
            document.querySelectorAll('.del-btn').forEach(b => b.addEventListener('click', handleDelete));

            // Attach events for Checkboxes
            document.querySelectorAll('.row-checkbox').forEach(cb => {
                cb.addEventListener('change', updateBatchActionsBar);
            });
        };

        // Select All Checkbox Handler
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', () => {
                const checked = selectAllCheckbox.checked;
                document.querySelectorAll('.row-checkbox').forEach(cb => {
                    cb.checked = checked;
                });
                updateBatchActionsBar();
            });
        }

        // Update Batch Actions Bar State
        function updateBatchActionsBar() {
            const selectedCbs = document.querySelectorAll('.row-checkbox:checked');
            const count = selectedCbs.length;
            const bar = document.getElementById('batchActionsBar');
            const text = document.getElementById('selectedCountText');

            if (!bar || !text) return;

            if (count > 0) {
                text.textContent = `${count} participant${count > 1 ? 's' : ''} selected`;
                bar.classList.remove('hidden');
            } else {
                bar.classList.add('hidden');
            }
        }

        // --- Batch Actions ---
        const getSelectedIds = () => {
            return Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => parseInt(cb.dataset.id));
        };

        const handleBatchStatus = async (status) => {
            const ids = getSelectedIds();
            if (ids.length === 0) return;
            const label = status === 1 ? 'approve' : 'reject';
            const confirmed = await showConfirm(
                'Confirm Batch Action', 
                `Are you sure you want to ${label} the ${ids.length} selected registration(s)?`,
                `Yes, ${label}`,
                status === 1 ? 'confirm' : 'warning'
            );
            if (!confirmed) return;

            try {
                const res = await fetch(`${API_BASE}/registrations/batch-status`, {
                    method: 'PUT',
                    headers: authHeaders,
                    body: JSON.stringify({ ids, status })
                });
                if (res.ok) {
                    ids.forEach(id => {
                        const idx = allRegistrations.findIndex(r => r.id === id);
                        if (idx > -1) allRegistrations[idx].approval_status = status;
                    });
                    loadDashboard();
                    showToast(`Successfully updated ${ids.length} registrations.`, 'success');
                } else {
                    showToast('Error processing batch update', 'error');
                }
            } catch (err) {
                showToast('Error processing batch update', 'error');
            }
        };

        const handleBatchDelete = async () => {
            const ids = getSelectedIds();
            if (ids.length === 0) return;
            const confirmed = await showConfirm(
                'Delete Registrations',
                `Are you sure you want to permanently delete the ${ids.length} selected registration(s)?`,
                'Delete',
                'critical'
            );
            if (!confirmed) return;

            try {
                const res = await fetch(`${API_BASE}/registrations/batch-delete`, {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify({ ids })
                });
                if (res.ok) {
                    allRegistrations = allRegistrations.filter(r => !ids.includes(r.id));
                    loadDashboard();
                    showToast(`Successfully deleted ${ids.length} registrations.`, 'success');
                } else {
                    showToast('Error processing batch delete', 'error');
                }
            } catch (err) {
                showToast('Error processing batch delete', 'error');
            }
        };

        // Attach Batch buttons events
        const batchApproveBtn = document.getElementById('batchApproveBtn');
        const batchRejectBtn = document.getElementById('batchRejectBtn');
        const batchDeleteBtn = document.getElementById('batchDeleteBtn');

        if (batchApproveBtn) batchApproveBtn.addEventListener('click', () => handleBatchStatus(1));
        if (batchRejectBtn) batchRejectBtn.addEventListener('click', () => handleBatchStatus(-1));
        if (batchDeleteBtn) batchDeleteBtn.addEventListener('click', handleBatchDelete);

        // --- CSV Export ---
        const exportCsvBtn = document.getElementById('exportCsvBtn');
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => {
                if (allRegistrations.length === 0) {
                    showToast('No registration data to export.', 'warning');
                    return;
                }

                // Get currently filtered list or fallback to all
                const search = document.getElementById('searchInput').value.toLowerCase();
                const filterMode = document.getElementById('filterMode').value;
                const filterStatus = document.getElementById('filterStatus').value;

                const filtered = allRegistrations.filter(r => {
                    const name = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
                    const email = (r.email || '').toLowerCase();
                    const matchSearch = name.includes(search) || email.includes(search);
                    const rMode = r.attendance_mode || 'none';
                    const matchMode = filterMode === 'all' || rMode === filterMode;
                    const rStatus = r.approval_status !== undefined ? String(r.approval_status) : "0";
                    const matchStatus = filterStatus === 'all' || rStatus === filterStatus;
                    return matchSearch && matchMode && matchStatus;
                });

                const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Registration Type', 'Speaker Type', 'Attendance Mode', 'Attendance Days', 'Nationality', 'Company/Affiliation', 'Designation', 'Status', 'Registered At'];
                const csvRows = [headers.join(',')];

                filtered.forEach(r => {
                    let statusLabel = 'Pending';
                    if (r.approval_status === 1) statusLabel = 'Approved';
                    else if (r.approval_status === -1) statusLabel = 'Rejected';

                    const row = [
                        r.id,
                        `"${(r.full_name || r.first_name + ' ' + r.last_name).replace(/"/g, '""')}"`,
                        `"${(r.email || '').replace(/"/g, '""')}"`,
                        `"${(r.phone || '').replace(/"/g, '""')}"`,
                        `"${(r.registration_type || '').replace(/"/g, '""')}"`,
                        `"${(r.speaker_type || '').replace(/"/g, '""')}"`,
                        `"${(r.attendance_mode || '').replace(/"/g, '""')}"`,
                        `"${(r.attendance_days || '').replace(/"/g, '""')}"`,
                        `"${(r.nationality || '').replace(/"/g, '""')}"`,
                        `"${(r.company || r.affiliation || '').replace(/"/g, '""')}"`,
                        `"${(r.designation || '').replace(/"/g, '""')}"`,
                        `"${statusLabel}"`,
                        `"${r.created_at || ''}"`
                    ];
                    csvRows.push(row.join(','));
                });

                const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `fao_registrations_${new Date().toISOString().slice(0,10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showToast('CSV export downloaded successfully.', 'success');
            });
        }

        // --- Actions ---
        const handleView = (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            const user = allRegistrations.find(r => r.id === id);
            if (!user) return;

            const content = `
                <div id="tab-overview" class="tab-content active">
                    <div class="detail-grid">
                        <div class="detail-row"><div class="detail-label">Prefix</div><div class="detail-value" style="text-transform: capitalize;">${user.prefix || 'N/A'}</div></div>
                        <div class="detail-row"><div class="detail-label">Full Name</div><div class="detail-value">${user.full_name || (user.first_name + ' ' + user.last_name)}</div></div>
                        <div class="detail-row"><div class="detail-label">Email</div><div class="detail-value">${user.email}</div></div>
                        <div class="detail-row"><div class="detail-label">Mobile Number</div><div class="detail-value">${user.phone || 'N/A'}</div></div>
                        <div class="detail-row"><div class="detail-label">Nationality</div><div class="detail-value" style="text-transform: capitalize;">${user.nationality || 'N/A'}</div></div>
                        <div class="detail-row"><div class="detail-label">Company / Affiliation</div><div class="detail-value">${user.company || 'N/A'}</div></div>
                        <div class="detail-row"><div class="detail-label">Designation</div><div class="detail-value">${user.designation || 'N/A'}</div></div>
                        <div class="detail-row"><div class="detail-label">Country of Affiliation</div><div class="detail-value" style="text-transform: capitalize;">${user.address_country || 'N/A'}</div></div>
                        <div class="detail-row"><div class="detail-label">Registration Type</div><div class="detail-value" style="text-transform: capitalize;">${user.registration_type}</div></div>
                    </div>
                </div>
                <div id="tab-attendance" class="tab-content">
                    <div class="detail-grid">
                        <div class="detail-row"><div class="detail-label">Attendance Mode</div><div class="detail-value" style="text-transform: capitalize;">${user.attendance_mode}</div></div>
                        <div class="detail-row"><div class="detail-label">Attendance Days</div><div class="detail-value">${user.attendance_days || 'N/A'}</div></div>
                        <div class="detail-row"><div class="detail-label">Speaker Type</div><div class="detail-value" style="text-transform: capitalize;">${user.speaker_type || 'N/A'}</div></div>
                        <div class="detail-row"><div class="detail-label">Zoom Meeting ID(s)</div><div class="detail-value">${user.zoom_meeting_id || 'N/A'}</div></div>
                    </div>
                </div>
                <div id="tab-logistics" class="tab-content">
                    <div class="detail-grid">
                        <div class="detail-row"><div class="detail-label">Dietary Preference</div><div class="detail-value" style="text-transform: capitalize;">${user.dietary || 'N/A'}</div></div>
                        <div class="detail-row"><div class="detail-label">Dietary Details</div><div class="detail-value">${user.dietary_details || 'None'}</div></div>
                        <div class="detail-row"><div class="detail-label">Visa Assistance Required</div><div class="detail-value">${user.visa_assistance == '1' || user.visa_assistance === true ? 'Yes' : 'No'}</div></div>
                        <div class="detail-row"><div class="detail-label">Field Trip Selection</div><div class="detail-value">${user.field_trip || 'None'}</div></div>
                        <div class="detail-row"><div class="detail-label">Registered At</div><div class="detail-value">${user.created_at || 'N/A'}</div></div>
                    </div>
                </div>
            `;
            document.getElementById('modalBodyContent').innerHTML = content;
            // Activate first tab
            const tabBtns = document.querySelectorAll('.modal-tab-btn');
            if (tabBtns.length > 0) {
                tabBtns.forEach(btn => btn.classList.remove('active'));
                tabBtns[0].classList.add('active');
            }
            document.getElementById('detailsModal').classList.remove('hidden');
        };

        const handleApprove = async (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            const confirmed = await showConfirm('Approve Registration', 'Are you sure you want to approve this registration?', 'Approve', 'confirm');
            if (!confirmed) return;
            await updateStatus(id, 1);
        };

        const handleReject = async (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            const confirmed = await showConfirm('Reject Registration', 'Are you sure you want to reject this registration?', 'Reject', 'warning');
            if (!confirmed) return;
            await updateStatus(id, -1);
        };

        const handleDelete = async (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            const confirmed = await showConfirm('Delete Registration', 'Are you sure you want to permanently delete this registration?', 'Delete', 'critical');
            if (!confirmed) return;
            
            try {
                const res = await fetch(`${API_BASE}/registrations/${id}`, {
                    method: 'DELETE',
                    headers: authHeaders
                });
                if (res.ok) {
                    allRegistrations = allRegistrations.filter(r => r.id !== id);
                    loadDashboard(); // Refresh stats
                    showToast('Registration deleted successfully.', 'success');
                } else {
                    showToast('Error deleting registration', 'error');
                }
            } catch (err) {
                showToast('Error deleting registration', 'error');
            }
        };

        const updateStatus = async (id, status) => {
            try {
                const res = await fetch(`${API_BASE}/registrations/${id}/status`, {
                    method: 'PUT',
                    headers: authHeaders,
                    body: JSON.stringify({ status })
                });
                if (res.ok) {
                    const idx = allRegistrations.findIndex(r => r.id === id);
                    if (idx > -1) allRegistrations[idx].approval_status = status;
                    loadDashboard(); // Refresh stats
                    showToast('Status updated successfully.', 'success');
                } else {
                    showToast('Error updating status', 'error');
                }
            } catch (err) {
                showToast('Error updating status', 'error');
            }
        };

        // Modal close
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            document.getElementById('detailsModal').classList.add('hidden');
        });
        document.getElementById('modalCloseBtn').addEventListener('click', () => {
            document.getElementById('detailsModal').classList.add('hidden');
        });

        // === ZOOM INTEGRATION SCRIPTS ===

        // Settings Elements
        const zoomSettingsForm = document.getElementById('zoomSettingsForm');
        const settingsSaveStatus = document.getElementById('settingsSaveStatus');
        
        // Configured Meetings Elements
        const configMeetingForm = document.getElementById('configMeetingForm');
        const configMeetingsBody = document.getElementById('configMeetingsBody');
        
        // Live Meetings Elements
        const refreshLiveMeetingsBtn = document.getElementById('refreshLiveMeetingsBtn');
        const liveMeetingsBody = document.getElementById('liveMeetingsBody');
        
        // Zoom inspect modal Elements
        const zoomInspectModal = document.getElementById('zoomInspectModal');
        const zoomInspectBodyContent = document.getElementById('zoomInspectBodyContent');
        const zoomInspectTitle = document.getElementById('zoomInspectTitle');
        const closeZoomInspectModalBtn = document.getElementById('closeZoomInspectModalBtn');
        const zoomInspectCloseBtn = document.getElementById('zoomInspectCloseBtn');

        // Load credentials from database/env
        const loadZoomSettings = async () => {
            try {
                const res = await fetch(`${API_BASE}/zoom/settings`, { headers: authHeaders });
                const data = await res.json();
                if (data.success) {
                    document.getElementById('zoomAccountId').value = data.data.account_id || '';
                    document.getElementById('zoomClientId').value = data.data.client_id || '';
                    document.getElementById('zoomClientSecret').value = data.data.client_secret || '';
                    document.getElementById('zoomSecretToken').value = data.data.secret_token || '';
                }
            } catch (err) {
                console.error('Error loading Zoom settings', err);
            }
        };

        // Save Credentials
        zoomSettingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            settingsSaveStatus.className = 'status-indicator';
            settingsSaveStatus.textContent = 'Saving...';

            const account_id = document.getElementById('zoomAccountId').value;
            const client_id = document.getElementById('zoomClientId').value;
            const client_secret = document.getElementById('zoomClientSecret').value;
            const secret_token = document.getElementById('zoomSecretToken').value;

            try {
                const res = await fetch(`${API_BASE}/zoom/settings`, {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify({ account_id, client_id, client_secret, secret_token })
                });
                const data = await res.json();
                if (data.success) {
                    settingsSaveStatus.className = 'status-indicator success';
                    settingsSaveStatus.textContent = 'Settings saved successfully!';
                    setTimeout(() => { settingsSaveStatus.textContent = ''; }, 3000);
                } else {
                    settingsSaveStatus.className = 'status-indicator error';
                    settingsSaveStatus.textContent = 'Failed to save settings.';
                }
            } catch (err) {
                settingsSaveStatus.className = 'status-indicator error';
                settingsSaveStatus.textContent = 'Connection error.';
            }
        });

        // Load Configured Meetings (Dropdown selections)
        const loadConfigMeetings = async () => {
            try {
                const res = await fetch(`${API_BASE}/zoom/config`, { headers: authHeaders });
                const data = await res.json();
                if (data.success) {
                    renderConfigMeetingsTable(data.data);
                }
            } catch (err) {
                console.error('Error loading config meetings', err);
            }
        };

        const renderConfigMeetingsTable = (meetings) => {
            configMeetingsBody.innerHTML = '';
            if (meetings.length === 0) {
                configMeetingsBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No sessions configured. Add one above!</td></tr>';
                return;
            }

            meetings.forEach(m => {
                const tr = document.createElement('tr');
                const badge = m.is_active 
                    ? '<span class="badge badge-success">Active</span>' 
                    : '<span class="badge badge-warning">Inactive</span>';

                const imgUrl = m.image_url || '/assets/event_1.png';
                const imgTag = `<img src="${imgUrl}" style="width:50px; height:30px; object-fit:cover; border-radius:4px; border: 1px solid var(--surface-border);" />`;

                tr.innerHTML = `
                    <td>${imgTag}</td>
                    <td>${m.meeting_id}</td>
                    <td>${m.topic}</td>
                    <td>${m.display_name}</td>
                    <td><code style="background:rgba(0,0,0,0.05); padding:2px 6px; border-radius:4px;">${m.passcode || 'FAO2026'}</code></td>
                    <td><strong>${m.registrants_count ?? 0}</strong></td>
                    <td>${badge}</td>
                    <td class="action-btns">
                        <button class="btn-ghost btn-small edit-config-btn" data-id="${m.meeting_id}" data-topic="${m.topic}" data-display="${m.display_name}" data-passcode="${m.passcode || ''}" data-image="${imgUrl}">Edit</button>
                        <button class="btn-ghost btn-small toggle-active-btn" data-id="${m.meeting_id}" data-active="${m.is_active ? '0' : '1'}">
                            ${m.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button class="btn-danger btn-small delete-config-btn" data-id="${m.meeting_id}">Delete</button>
                    </td>
                `;
                configMeetingsBody.appendChild(tr);
            });

            // Attach Edit handlers
            document.querySelectorAll('.edit-config-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const dataset = e.target.dataset;
                    document.getElementById('configMeetingId').value = dataset.id;
                    document.getElementById('configTopic').value = dataset.topic;
                    document.getElementById('configDisplayName').value = dataset.display;
                    document.getElementById('configPasscode').value = dataset.passcode || '';
                    document.getElementById('configImage').value = dataset.image;
                    
                    // Smooth scroll to form
                    document.getElementById('configMeetingForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
            });

            // Attach events
            document.querySelectorAll('.toggle-active-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const meeting_id = e.target.dataset.id;
                    const is_active = e.target.dataset.active === '1';
                    const meeting = meetings.find(m => m.meeting_id === meeting_id);
                    if (!meeting) return;

                    try {
                        const res = await fetch(`${API_BASE}/zoom/config`, {
                            method: 'POST',
                            headers: authHeaders,
                            body: JSON.stringify({
                                meeting_id,
                                topic: meeting.topic,
                                display_name: meeting.display_name,
                                image_url: meeting.image_url || '/assets/event_1.png',
                                passcode: meeting.passcode || '',
                                is_active
                            })
                        });
                        if (res.ok) {
                            loadConfigMeetings();
                            showToast(`Session ${is_active ? 'activated' : 'deactivated'} successfully.`, 'success');
                        } else {
                            showToast('Error toggling session status', 'error');
                        }
                    } catch (err) {
                        showToast('Error toggling session status', 'error');
                    }
                });
            });

            document.querySelectorAll('.delete-config-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const meetingId = e.target.dataset.id;
                    const confirmed = await showConfirm(
                        'Remove Zoom Session',
                        'Are you sure you want to remove this session from the registration form?',
                        'Remove',
                        'critical'
                    );
                    if (!confirmed) return;
                    try {
                        const res = await fetch(`${API_BASE}/zoom/config/${meetingId}`, {
                            method: 'DELETE',
                            headers: authHeaders
                        });
                        if (res.ok) {
                            loadConfigMeetings();
                            showToast('Session removed from registration form.', 'success');
                        } else {
                            showToast('Error deleting session', 'error');
                        }
                    } catch (err) {
                        showToast('Error deleting session', 'error');
                    }
                });
            });
        };

        // Add Config Meeting Form
        configMeetingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const meeting_id = document.getElementById('configMeetingId').value.trim();
            const topic = document.getElementById('configTopic').value.trim();
            const display_name = document.getElementById('configDisplayName').value.trim();
            const passcode = document.getElementById('configPasscode').value.trim();
            const image_url = document.getElementById('configImage').value;

            try {
                const res = await fetch(`${API_BASE}/zoom/config`, {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify({ meeting_id, topic, display_name, image_url, passcode, is_active: true })
                });
                const data = await res.json();
                if (data.success) {
                    document.getElementById('configMeetingId').value = '';
                    document.getElementById('configTopic').value = '';
                    document.getElementById('configDisplayName').value = '';
                    document.getElementById('configPasscode').value = '';
                    document.getElementById('configImage').selectedIndex = 0;
                    loadConfigMeetings();
                    showToast('Zoom session added/updated successfully.', 'success');
                } else {
                    showToast(data.message || 'Error saving session config', 'error');
                }
            } catch (err) {
                showToast('Connection error', 'error');
            }
        });

        // Load Live Zoom Account Meetings
        const loadLiveZoomMeetings = async () => {
            liveMeetingsBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Retrieving live scheduled meetings from Zoom API...</td></tr>';
            try {
                const res = await fetch(`${API_BASE}/zoom/meetings`, { headers: authHeaders });
                const data = await res.json();
                if (data.success) {
                    renderLiveMeetingsTable(data.data);
                } else {
                    liveMeetingsBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--danger-color);">Error fetching live meetings. Check credentials.</td></tr>';
                }
            } catch (err) {
                liveMeetingsBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--danger-color);">Connection error while syncing with Zoom.</td></tr>';
            }
        };

        const renderLiveMeetingsTable = (meetings) => {
            liveMeetingsBody.innerHTML = '';
            if (meetings.length === 0) {
                liveMeetingsBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No scheduled Zoom meetings found in this account.</td></tr>';
                return;
            }

            meetings.forEach(m => {
                const tr = document.createElement('tr');
                const startTime = m.start_time ? new Date(m.start_time).toLocaleString() : 'N/A';
                const duration = m.duration ? `${m.duration} mins` : 'N/A';
                const type = m.type === 2 ? 'Scheduled' : 'Recurring';

                tr.innerHTML = `
                    <td><strong>${m.id}</strong></td>
                    <td>${m.topic}</td>
                    <td>${startTime}</td>
                    <td>${duration}</td>
                    <td>${type}</td>
                    <td><strong>${m.registrants_count ?? 0}</strong></td>
                    <td>
                        <button class="btn-primary btn-small inspect-btn" data-id="${m.id}">Inspect Details</button>
                    </td>
                `;
                liveMeetingsBody.appendChild(tr);
            });

            // Inspect Detail button handler
            document.querySelectorAll('.inspect-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const meetingId = e.target.dataset.id;
                    await showZoomMeetingDetails(meetingId);
                });
            });
        };

        const showZoomMeetingDetails = async (meetingId) => {
            zoomInspectTitle.textContent = `Syncing details for Meeting ${meetingId}...`;
            zoomInspectBodyContent.innerHTML = '<div style="text-align:center; padding:2rem;"><div class="loader" style="margin:0 auto 1rem auto; width:30px; height:30px;"></div>Loading real-time registrant and participant data...</div>';
            zoomInspectModal.classList.remove('hidden');

            try {
                const res = await fetch(`${API_BASE}/zoom/meetings/${meetingId}`, { headers: authHeaders });
                const data = await res.json();
                
                if (data.success) {
                    const info = data.data;
                    const d = info.details;
                    
                    zoomInspectTitle.textContent = `Inspect: ${d.topic}`;

                    // Merge and reconcile Zoom Portal Registrants and Local App database registrants
                    let registrantsRows = '';
                    const allRegs = [];

                    // 1. Add Local App database registrants
                    if (info.localRegistrants && info.localRegistrants.length > 0) {
                        info.localRegistrants.forEach(r => {
                            allRegs.push({
                                name: `${r.first_name} ${r.last_name}`.trim(),
                                email: r.email,
                                status: r.status,
                                source: 'Local App',
                                create_time: r.create_time
                            });
                        });
                    }

                    // 2. Reconcile / Merge Zoom Portal API registrants
                    if (info.registrants && info.registrants.length > 0) {
                        info.registrants.forEach(r => {
                            const existing = allRegs.find(e => e.email.toLowerCase() === r.email.toLowerCase());
                            if (existing) {
                                existing.source = 'Synced (Both)';
                                existing.status = `${existing.status} / ${r.status}`;
                            } else {
                                allRegs.push({
                                    name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
                                    email: r.email,
                                    status: r.status,
                                    source: 'Zoom Portal',
                                    create_time: r.create_time
                                });
                            }
                        });
                    }

                    if (allRegs.length > 0) {
                        allRegs.forEach(r => {
                            const createTime = r.create_time ? new Date(r.create_time).toLocaleString() : 'N/A';
                            let sourceBadge = '';
                            if (r.source === 'Local App') {
                                sourceBadge = '<span class="badge badge-info">Local App</span>';
                            } else if (r.source === 'Zoom Portal') {
                                sourceBadge = '<span class="badge badge-warning" style="background:#e0f2fe; color:#0369a1;">Zoom Portal</span>';
                            } else {
                                sourceBadge = '<span class="badge badge-success">Synced (Both)</span>';
                            }
                            
                            registrantsRows += `
                                <tr>
                                    <td><strong>${r.name}</strong></td>
                                    <td>${r.email}</td>
                                    <td style="text-transform: capitalize;">${r.status}</td>
                                    <td>${sourceBadge}</td>
                                    <td>${createTime}</td>
                                </tr>
                            `;
                        });
                    } else {
                        registrantsRows = '<tr><td colspan="5" style="text-align:center;">No registrants registered for this Zoom session.</td></tr>';
                    }

                    let participantsRows = '';
                    if (info.participants && info.participants.length > 0) {
                        info.participants.forEach(p => {
                            const joinTime = new Date(p.join_time).toLocaleString();
                            const leaveTime = p.leave_time ? new Date(p.leave_time).toLocaleString() : 'N/A';
                            const duration = p.duration ? `${Math.round(p.duration / 60)} mins` : 'N/A';
                            participantsRows += `
                                <tr>
                                    <td>${p.name}</td>
                                    <td>${p.user_email || 'N/A'}</td>
                                    <td>${joinTime}</td>
                                    <td>${leaveTime}</td>
                                    <td>${duration}</td>
                                </tr>
                            `;
                        });
                    } else {
                        participantsRows = '<tr><td colspan="5" style="text-align:center;">No attendee participation logs found yet.</td></tr>';
                    }

                    let warningBanner = '';
                    if (info.zoomError) {
                        warningBanner = `
                            <div class="zoom-warning-banner" style="background:#fffbeb; border:1px solid #fef3c7; color:#b45309; padding:0.75rem 1rem; border-radius:8px; font-size:0.8rem; margin-bottom:1rem; display:flex; align-items:center; gap:8px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                <span><strong>Zoom API Sync Notice:</strong> ${info.zoomError}. Showing local application registrations.</span>
                            </div>
                        `;
                    }

                    zoomInspectBodyContent.innerHTML = `
                        ${warningBanner}
                        <div class="inspect-details-section">
                            <div class="inspect-stats-grid">
                                <div class="inspect-stat-card">
                                    <h4>Zoom Meeting ID</h4>
                                    <div class="val">${d.id}</div>
                                </div>
                                <div class="inspect-stat-card">
                                    <h4>Total Registrants</h4>
                                    <div class="val">${allRegs.length}</div>
                                </div>
                                <div class="inspect-stat-card">
                                    <h4>Live/Past Attendees</h4>
                                    <div class="val">${info.participants.length}</div>
                                </div>
                                <div class="inspect-stat-card">
                                    <h4>Status</h4>
                                    <div class="val" style="text-transform: capitalize;">${d.status || 'Scheduled'}</div>
                                </div>
                            </div>
                            
                            <div>
                                <div class="inspect-sub-table-header">
                                    <h3>Registrants Details</h3>
                                    <span>Zoom Portal Sync</span>
                                </div>
                                <div class="table-responsive" style="max-height: 200px; border: 1px solid var(--surface-border); border-radius: 8px;">
                                    <table class="data-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Status</th>
                                                <th>Source</th>
                                                <th>Registered At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${registrantsRows}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <div>
                                <div class="inspect-sub-table-header">
                                    <h3>Realtime Participant & Live Logs</h3>
                                    <span>Live Attendance</span>
                                </div>
                                <div class="table-responsive" style="max-height: 200px; border: 1px solid var(--surface-border); border-radius: 8px;">
                                    <table class="data-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Join Time</th>
                                                <th>Leave Time</th>
                                                <th>Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${participantsRows}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    `;

                } else {
                    zoomInspectBodyContent.innerHTML = `<div style="color:var(--danger-color); text-align:center; padding:2rem;">Error: ${data.message}</div>`;
                }
            } catch (err) {
                zoomInspectBodyContent.innerHTML = '<div style="color:var(--danger-color); text-align:center; padding:2rem;">Connection failed to retrieve Zoom API data.</div>';
            }
        };

        // Hook Zoom Sync button
        refreshLiveMeetingsBtn.addEventListener('click', loadLiveZoomMeetings);

        // Modal Close triggers
        const hideZoomInspectModal = () => { zoomInspectModal.classList.add('hidden'); };
        closeZoomInspectModalBtn.addEventListener('click', hideZoomInspectModal);
        zoomInspectCloseBtn.addEventListener('click', hideZoomInspectModal);

        // Initialize Zoom Section
        const initZoomSection = () => {
            loadZoomSettings();
            loadConfigMeetings();
            loadLiveZoomMeetings();
        };

        // Hook into sidebar tab load
        const zoomTab = document.querySelector('[data-target="zoom-section"]');
        if (zoomTab) {
            zoomTab.addEventListener('click', initZoomSection);
        }

        // Realtime Clock
        const updateClock = () => {
            const clockEl = document.getElementById('realtimeClock');
            if (!clockEl) return;
            const now = new Date();
            const options = { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true 
            };
            clockEl.textContent = now.toLocaleDateString('en-US', options);
        };
        updateClock();
        setInterval(updateClock, 1000);

        // Initialize
        loadDashboard();

        // --- Attendance Scanner Logic ---
        let html5QrCode = null;
        let selectedCameraId = null;

        const loadAttendanceLogs = async () => {
            const tbody = document.getElementById('attendanceLogsBody');
            if (!tbody) return;
            try {
                const res = await fetch(`${API_BASE}/attendance/logs`, { headers: authHeaders });
                const resData = await res.json();
                if (resData.success && resData.data.length > 0) {
                    tbody.innerHTML = resData.data.map(l => {
                        const time = new Date(l.scanned_at).toLocaleTimeString();
                        return `
                            <tr>
                                <td>${escapeHTML(time)}</td>
                                <td style="font-weight: 600; color: var(--primary-color);">${escapeHTML(l.full_name)}</td>
                                <td>${escapeHTML(l.email)}</td>
                                <td><span class="badge ${l.attendance_mode === 'in-person' ? 'badge-success' : 'badge-info'}">${escapeHTML(l.attendance_mode)}</span></td>
                                <td style="font-size:0.8rem; color:var(--text-muted);">${escapeHTML(l.scanned_by)}</td>
                            </tr>
                        `;
                    }).join('');
                } else {
                    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No scan logs recorded today.</td></tr>`;
                }
            } catch (err) {
                console.error('Error loading attendance logs:', err);
            }
        };

        const showFeedback = (title, message, type) => {
            const feedbackEl = document.getElementById('scanFeedback');
            const titleEl = document.getElementById('feedbackTitle');
            const msgEl = document.getElementById('feedbackMessage');
            if (!feedbackEl) return;
            
            feedbackEl.classList.remove('hidden');
            titleEl.textContent = title;
            msgEl.textContent = message;
            
            feedbackEl.style.backgroundColor = '#FFF6DB';
            feedbackEl.style.borderColor = '#FFE082';
            feedbackEl.style.color = '#5D4037';
            
            if (type === 'success') {
                feedbackEl.style.backgroundColor = '#E8F5E9';
                feedbackEl.style.borderColor = '#A5D6A7';
                feedbackEl.style.color = '#1B5E20';
            } else if (type === 'error') {
                feedbackEl.style.backgroundColor = '#FDEFEF';
                feedbackEl.style.borderColor = '#F8D7DA';
                feedbackEl.style.color = '#A94A4A';
            } else if (type === 'info') {
                feedbackEl.style.backgroundColor = '#E3F2FD';
                feedbackEl.style.borderColor = '#90CAF9';
                feedbackEl.style.color = '#0D47A1';
            }
        };

        const validateCheckin = async (attendanceKey) => {
            if (window.isProcessingScan) return;
            window.isProcessingScan = true;
            
            showFeedback('Validating...', 'Checking ticket/code details in database...', 'info');
            
            try {
                const response = await fetch(`${API_BASE}/attendance/scan`, {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify({ attendance_key: attendanceKey })
                });
                const resData = await response.json();
                if (resData.success) {
                    showFeedback(
                        'Access Granted!', 
                        `Welcome, ${resData.data.participant.full_name} (${resData.data.participant.company || 'Participant'}). Checked in successfully.`,
                        'success'
                    );
                    loadAttendanceLogs();
                } else {
                    showFeedback('Access Denied', resData.message || 'Verification failed.', 'error');
                }
            } catch (err) {
                console.error('Scan validation error:', err);
                showFeedback('Server Error', 'Failed to communicate with database server.', 'error');
            } finally {
                setTimeout(() => {
                    window.isProcessingScan = false;
                }, 3000);
            }
        };

        const startScanner = (cameraId) => {
            if (!html5QrCode) {
                html5QrCode = new Html5Qrcode("qr-reader");
            }
            html5QrCode.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                async (decodedText) => {
                    await validateCheckin(decodedText);
                },
                (errorMessage) => {
                    // Non-critical scan noise
                }
            ).then(() => {
                document.getElementById('startScanBtn').classList.add('hidden');
                document.getElementById('stopScanBtn').classList.remove('hidden');
                document.getElementById('cameraSelect').style.display = 'block';
            }).catch(err => {
                console.error('Camera start error:', err);
                showFeedback('Camera Start Failed', 'Unable to start camera feed. Please check permissions.', 'error');
            });
        };

        const stopScanner = () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                    document.getElementById('startScanBtn').classList.remove('hidden');
                    document.getElementById('stopScanBtn').classList.add('hidden');
                    document.getElementById('cameraSelect').style.display = 'none';
                    document.getElementById('scanFeedback').classList.add('hidden');
                }).catch(err => {
                    console.error('Camera stop error:', err);
                });
            }
        };

        const initCameraScanner = async () => {
            try {
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length > 0) {
                    const select = document.getElementById('cameraSelect');
                    select.innerHTML = devices.map(d => `<option value="${d.id}">${escapeHTML(d.label || `Camera ${d.id}`)}</option>`).join('');
                    selectedCameraId = devices[0].id;
                    select.addEventListener('change', (e) => {
                        selectedCameraId = e.target.value;
                        if (html5QrCode && html5QrCode.isScanning) {
                            html5QrCode.stop().then(() => startScanner(selectedCameraId));
                        }
                    });
                    startScanner(selectedCameraId);
                } else {
                    showFeedback('No Cameras Found', 'Please connect a webcam/camera device.', 'error');
                }
            } catch (err) {
                console.error('Camera access error:', err);
                showFeedback('Camera Access Denied', 'Please grant camera permissions to this page.', 'error');
            }
        };

        document.getElementById('startScanBtn')?.addEventListener('click', initCameraScanner);
        document.getElementById('stopScanBtn')?.addEventListener('click', stopScanner);

        // Load logs initially
        loadAttendanceLogs();

        // Stop scanner if switching to other tabs
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (link.dataset.target !== 'scanner-section') {
                    stopScanner();
                }
            });
        });

        // --- Realtime Event Stream via SSE ---
        const setupSSE = () => {
            const token = getToken();
            if (!token) return;
            const es = new EventSource(`/v1/admin/stream?token=${token}`);
            
            es.addEventListener('new_registration', (e) => {
                try {
                    const data = JSON.parse(e.data);
                    // Add to allRegistrations
                    allRegistrations.unshift(data);
                    // Rerender table and charts
                    renderTable();
                    renderCharts();
                    // Increment stats
                    const totalEl = document.getElementById('statTotal');
                    if (totalEl) totalEl.textContent = parseInt(totalEl.textContent || 0, 10) + 1;
                    const pendingEl = document.getElementById('statPending');
                    if (pendingEl) pendingEl.textContent = parseInt(pendingEl.textContent || 0, 10) + 1;
                    if (data.attendance_mode === 'in-person') {
                        const inPersonEl = document.getElementById('statInPerson');
                        if (inPersonEl) inPersonEl.textContent = parseInt(inPersonEl.textContent || 0, 10) + 1;
                    } else if (data.attendance_mode === 'online') {
                        const virtualEl = document.getElementById('statVirtual');
                        if (virtualEl) virtualEl.textContent = parseInt(virtualEl.textContent || 0, 10) + 1;
                    }
                } catch (err) {
                    console.error('SSE new_registration error:', err);
                }
            });

            es.addEventListener('status_update', (e) => {
                try {
                    const { id, approval_status } = JSON.parse(e.data);
                    const idx = allRegistrations.findIndex(r => r.id === id);
                    if (idx > -1) {
                        allRegistrations[idx].approval_status = approval_status;
                        renderTable();
                        renderCharts();
                        // Re-fetch stats to update stats cards
                        fetch(`${API_BASE}/stats`, { headers: authHeaders })
                            .then(res => res.json())
                            .then(statsData => {
                                if (statsData.success) {
                                    document.getElementById('statTotal').textContent = statsData.data.total;
                                    document.getElementById('statApproved').textContent = statsData.data.approved;
                                    document.getElementById('statPending').textContent = statsData.data.pending;
                                    document.getElementById('statInPerson').textContent = statsData.data.inPerson;
                                    document.getElementById('statVirtual').textContent = statsData.data.virtual;
                                }
                            });
                    }
                } catch (err) {
                    console.error('SSE status_update error:', err);
                }
            });

            es.addEventListener('registration_deleted', (e) => {
                try {
                    const { id } = JSON.parse(e.data);
                    allRegistrations = allRegistrations.filter(r => r.id !== id);
                    renderTable();
                    renderCharts();
                    // Re-fetch stats
                    fetch(`${API_BASE}/stats`, { headers: authHeaders })
                        .then(res => res.json())
                        .then(statsData => {
                            if (statsData.success) {
                                document.getElementById('statTotal').textContent = statsData.data.total;
                                document.getElementById('statApproved').textContent = statsData.data.approved;
                                document.getElementById('statPending').textContent = statsData.data.pending;
                                document.getElementById('statInPerson').textContent = statsData.data.inPerson;
                                document.getElementById('statVirtual').textContent = statsData.data.virtual;
                            }
                        });
                } catch (err) {
                    console.error('SSE registration_deleted error:', err);
                }
            });

            es.addEventListener('attendance_checkin', (e) => {
                try {
                    loadAttendanceLogs();
                } catch (err) {
                    console.error('SSE attendance_checkin error:', err);
                }
            });

            es.onerror = () => {
                console.warn('SSE connection lost. Reconnecting in 5s...');
                es.close();
                setTimeout(setupSSE, 5000);
            };
        };
        // --- Theme Toggle Logic ---
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        const themeIconSun = document.getElementById('themeIconSun');
        const themeIconMoon = document.getElementById('themeIconMoon');

        if (themeToggleBtn) {
            const currentTheme = localStorage.getItem('admin_theme') || 'light';
            if (currentTheme === 'dark') {
                document.body.classList.add('dark-theme');
                themeIconSun.classList.remove('hidden');
                themeIconMoon.classList.add('hidden');
            }

            themeToggleBtn.addEventListener('click', () => {
                const isDark = document.body.classList.toggle('dark-theme');
                localStorage.setItem('admin_theme', isDark ? 'dark' : 'light');
                if (isDark) {
                    themeIconSun.classList.remove('hidden');
                    themeIconMoon.classList.add('hidden');
                } else {
                    themeIconSun.classList.add('hidden');
                    themeIconMoon.classList.remove('hidden');
                }
            });
        }

        setupSSE();
    }
});
