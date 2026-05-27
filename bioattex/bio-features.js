'use strict';

/* ==========================================================
   BioAttex — bio-features.js
   Admin, Records, Charts, Calendar & Install modules
   with XSS-safe DOM manipulation (no innerHTML with user data)
   ========================================================== */


// ======================== ADMIN ========================
var admin = {
    isLoggedIn: false,
    isRegistering: false,
    tempDescriptors: [],
    tempName: '',
    tempId: '',
    tempPhoto: null,

    login: function() {
        var pinInput = document.getElementById('pin-input');

        // PIN brute-force lockout check
        var lockStatus = pinLockout.check();
        if (lockStatus.locked) {
            utils.showToast('Too many attempts. Try again in ' + lockStatus.remaining + 's', null, 'error');
            utils.haptic && utils.haptic('error');
            soundManager.play('error');
            pinInput.value = '';
            pinInput.focus();
            return;
        }

        if (pinInput.value === db.data.pin) {
            pinInput.value = '';
            pinLockout.reset();
            this.isLoggedIn = true;
            document.getElementById('nav-records').classList.remove('hidden');
            document.getElementById('nav-calendar').classList.remove('hidden');
            app.nav('dashboard');
            utils.showToast('Admin access granted', null, 'success');
            utils.haptic && utils.haptic('success');
            // Warn if default PIN is still in use
            if (db.data.pin === '1234') {
                setTimeout(function() {
                    utils.showToast('Security Warning: Your password is the default (1234). Change it in Settings.', 6000, 'warning');
                }, 1500);
            }
        } else {
            var isLocked = pinLockout.recordFail();
            if (isLocked) {
                utils.showToast('Too many wrong attempts! Locked for 30 seconds.', null, 'error');
            } else {
                var remaining = pinLockout.MAX_ATTEMPTS - pinLockout._attempts;
                utils.showToast('Incorrect password. ' + remaining + ' attempt(s) left.', null, 'error');
            }
            utils.haptic && utils.haptic('error');
            soundManager.play('error');
            pinInput.value = '';
            pinInput.focus();
        }
    },

    logout: function() {
        this.isLoggedIn = false;
        this.cancelRegistration();
        document.getElementById('nav-records').classList.add('hidden');
        document.getElementById('nav-calendar').classList.add('hidden');
        app.nav('home');
        utils.showToast('Logged out');
    },

    cancelRegistration: function() {
        this.isRegistering = false;
        this.tempDescriptors = [];
        this.tempName = '';
        this.tempId = '';
        this.tempPhoto = null;
        // Release the map visible flag — back to 2.5s auto-hide behaviour
        neuralEngine._keepMapVisible = false;
        var banner = document.getElementById('registration-banner');
        if (banner) banner.classList.remove('show');
        var warningBox = document.getElementById('warning-box');
        if (warningBox) warningBox.style.display = 'flex';
        var statusMsg = document.getElementById('status-msg');
        if (statusMsg) statusMsg.textContent = '';
        var regStatus = document.getElementById('reg-status');
        if (regStatus) regStatus.textContent = '';
        var saveBtn = document.getElementById('btn-reg-save');
        if (saveBtn) saveBtn.disabled = true;
        var checkinBtn = document.getElementById('btn-checkin');
        var checkoutBtn = document.getElementById('btn-checkout');
        if (checkinBtn && camera.stream) checkinBtn.disabled = false;
        if (checkoutBtn && camera.stream) checkoutBtn.disabled = false;
    },

    toggleStationMode: function() {
        document.body.classList.toggle('station-mode');
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(function() {});
        } else {
            document.exitFullscreen();
        }
    },

    saveSettings: function() {
        var pinInput = document.getElementById('new-pin');
        var lateInput = document.getElementById('late-threshold');
        var endInput = document.getElementById('work-end-time');
        var overtimeInput = document.getElementById('overtime-threshold');
        var soundToggle = document.getElementById('sound-toggle');

        if (pinInput.value && pinInput.value.length >= 4) {
            db.data.pin = pinInput.value;
            pinInput.value = '';
            utils.showToast('Password updated', null, 'success');
        } else if (pinInput.value && pinInput.value.length < 4) {
            utils.showToast('Password must be at least 4 characters', null, 'error');
            return;
        }

        if (lateInput.value) db.data.lateThreshold = lateInput.value;
        if (endInput.value) db.data.workEndTime = endInput.value;
        if (overtimeInput.value) db.data.overtimeThreshold = parseInt(overtimeInput.value) || 8;

        soundManager.toggle(soundToggle.checked);

        db.save();
        utils.showToast('Settings saved', null, 'success');
    },

    downloadBackup: function() {
        var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db.data));
        var dl = document.createElement('a');
        dl.setAttribute('href', dataStr);
        dl.setAttribute('download', 'bioattex_backup_' + utils.formatDate(new Date()) + '.json');
        document.body.appendChild(dl);
        dl.click();
        document.body.removeChild(dl);
        localStorage.setItem(BACKUP_DATE_KEY, Date.now().toString());
        this.checkBackupReminder();
        utils.showToast('Backup downloaded', null, 'success');
    },

    importBackup: function(input) {
        var file = input.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var json = JSON.parse(e.target.result);
                if (json.employees && json.logs !== undefined) {
                    db.data = json;
                    db.save();
                    utils.showToast('Data restored', null, 'success');
                    setTimeout(function() { location.reload(); }, 1000);
                } else {
                    utils.showToast('Invalid backup file', null, 'error');
                }
            } catch (err) {
                utils.showToast('Error reading file', null, 'error');
            }
        };
        reader.readAsText(file);
        input.value = '';
    },

    startFaceRegistration: function() {
        var nameInput = document.getElementById('reg-name');
        var idInput = document.getElementById('reg-id');
        var name = nameInput.value.trim();
        var id = idInput.value.trim();

        if (!name || !id) {
            utils.showToast('Name and ID are required', null, 'error');
            return;
        }
        if (db.data.employees.find(function(e) { return e.id === id; })) {
            utils.showToast('Employee ID already exists', null, 'error');
            return;
        }

        this.isRegistering = true;
        this.tempName = name;
        this.tempId = id;
        this.tempDescriptors = [];

        // Keep face map visible during registration so user sees the mapping
        neuralEngine._keepMapVisible = true;

        var banner = document.getElementById('registration-banner');
        if (banner) banner.classList.add('show');
        var warningBox = document.getElementById('warning-box');
        if (warningBox) warningBox.style.display = 'none';
        var checkinBtn = document.getElementById('btn-checkin');
        var checkoutBtn = document.getElementById('btn-checkout');
        if (checkinBtn) checkinBtn.disabled = true;
        if (checkoutBtn) checkoutBtn.disabled = true;

        app.nav('home');

        if (!camera.stream) {
            var self = this;
            camera.start().then(function() {
                setTimeout(function() {
                    if (self.isRegistering) self.captureLoop();
                }, 100);
            });
        } else {
            this.captureLoop();
        }

        var statusMsg = document.getElementById('status-msg');
        statusMsg.textContent = 'Position face for capture...';
        statusMsg.style.color = 'var(--accent)';
    },

    captureLoop: function() {
        if (!this.isRegistering) return;
        var statusMsg = document.getElementById('status-msg');
        var self = this;

        if (neuralEngine.lastDetection) {
            this.tempDescriptors.push(neuralEngine.lastDetection.descriptor);
            if (this.tempDescriptors.length < 3) {
                statusMsg.textContent = 'Capturing... ' + this.tempDescriptors.length + '/3';
                setTimeout(function() { self.captureLoop(); }, 800);
            } else {
                this.isRegistering = false;
                // Release the map visible flag after registration completes
                neuralEngine._keepMapVisible = false;
                
                // Capture profile photo from current video frame
                var video = document.getElementById('video-feed');
                if (video && video.videoWidth > 0) {
                    var tempCanvas = document.createElement('canvas');
                    tempCanvas.width = video.videoWidth;
                    tempCanvas.height = video.videoHeight;
                    var ctx = tempCanvas.getContext('2d');
                    ctx.translate(tempCanvas.width, 0);
                    ctx.scale(-1, 1);
                    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
                    this.tempPhoto = tempCanvas.toDataURL('image/jpeg', 0.7);
                } else {
                    this.tempPhoto = null;
                }
                
                var banner = document.getElementById('registration-banner');
                if (banner) banner.classList.remove('show');
                var warningBox = document.getElementById('warning-box');
                if (warningBox) warningBox.style.display = 'flex';
                camera.stop();
                app.nav('dashboard');
                document.getElementById('reg-status').textContent = '3 face samples captured! Ready to save.';
                document.getElementById('reg-status').style.color = 'var(--success)';
                document.getElementById('btn-reg-save').disabled = false;
                statusMsg.textContent = '';
                utils.showToast('Face data captured - click Save Employee', null, 'success');
                soundManager.play('success');
            }
        } else {
            statusMsg.textContent = 'Position your face in the frame...';
            setTimeout(function() { self.captureLoop(); }, 500);
        }
    },

    completeRegistration: function() {
        if (this.tempDescriptors.length === 0) {
            utils.showToast('No face data captured', null, 'error');
            return;
        }
        db.data.employees.push({
            id: this.tempId,
            name: this.tempName,
            descriptor: this.tempDescriptors.map(function(d) { return Array.from(d); }),
            photo: this.tempPhoto || null
        });
        db.save();
        document.getElementById('reg-name').value = '';
        document.getElementById('reg-id').value = '';
        document.getElementById('btn-reg-save').disabled = true;
        document.getElementById('reg-status').textContent = '';
        this.tempDescriptors = [];
        this.tempName = '';
        this.tempId = '';
        this.tempPhoto = null;
        this.renderEmpList();
        this.updateStats();
        this.renderGallery();
        utils.showToast('Employee registered successfully', null, 'success');
        soundManager.play('success');
    },

    /* ---- XSS-safe: all user data (emp.id, emp.name) rendered via textContent ---- */
    renderEmpList: function() {
        var tbody = document.querySelector('#emp-table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (db.data.employees.length === 0) {
            var emptyRow = document.createElement('tr');
            var emptyCell = document.createElement('td');
            emptyCell.colSpan = 4;
            emptyCell.style.textAlign = 'center';
            emptyCell.style.padding = '1.5rem';
            emptyCell.style.color = 'var(--text-muted)';
            emptyCell.textContent = 'No employees registered';
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
            return;
        }
        db.data.employees.forEach(function(emp) {
            var hasBio = emp.descriptor && emp.descriptor.length > 0;
            var row = document.createElement('tr');

            var tdId = document.createElement('td');
            tdId.textContent = emp.id;
            row.appendChild(tdId);

            var tdName = document.createElement('td');
            tdName.textContent = emp.name;
            row.appendChild(tdName);

            var tdBio = document.createElement('td');
            if (hasBio) {
                var bioSpan = document.createElement('span');
                bioSpan.style.color = 'var(--success)';
                bioSpan.textContent = 'Yes (' + emp.descriptor.length + ')';
                tdBio.appendChild(bioSpan);
            } else {
                var noBioSpan = document.createElement('span');
                noBioSpan.style.color = 'var(--text-muted)';
                noBioSpan.textContent = 'No';
                tdBio.appendChild(noBioSpan);
            }
            row.appendChild(tdBio);

            var tdAction = document.createElement('td');
            var delBtn = document.createElement('button');
            delBtn.className = 'btn btn-danger';
            delBtn.style.cssText = 'padding:4px 10px; font-size:0.75rem;';
            delBtn.dataset.empId = emp.id;
            delBtn.textContent = 'Remove';
            tdAction.appendChild(delBtn);
            row.appendChild(tdAction);

            tbody.appendChild(row);
        });
    },

    deleteEmployee: function(id) {
        if (confirm('Remove this employee?')) {
            db.removeEmployee(id);
            this.renderEmpList();
            this.updateStats();
            this.renderGallery();
            utils.showToast('Employee removed');
        }
    },

    updateStats: function() {
        var today = utils.formatDate(new Date());
        var todaysLogs = db.data.logs[today] || [];

        document.getElementById('stat-total-emp').textContent = db.data.employees.length;
        document.getElementById('stat-today').textContent = todaysLogs.filter(function(l) { return l.type === 'check-in'; }).length;
        document.getElementById('stat-late').textContent = todaysLogs.filter(function(l) { return l.status === 'Late'; }).length;
        document.getElementById('stat-overtime').textContent = todaysLogs.filter(function(l) { return l.overtime; }).length;
        
        // Check backup reminder
        if (typeof admin.checkBackupReminder === 'function') admin.checkBackupReminder();
    },

    /* ---- XSS-safe: emp.name / emp.id rendered via textContent ---- */
    renderGallery: function() {
        var gallery = document.getElementById('employee-gallery');
        if (!gallery) return;
        gallery.innerHTML = '';

        if (db.data.employees.length === 0) {
            var p = document.createElement('p');
            p.style.textAlign = 'center';
            p.style.color = 'var(--text-muted)';
            p.style.gridColumn = '1/-1';
            p.textContent = 'No employees registered';
            gallery.appendChild(p);
            return;
        }

        db.data.employees.forEach(function(emp) {
            var card = document.createElement('div');
            card.className = 'gallery-card';

            var avatar = document.createElement('div');
            avatar.className = 'gallery-avatar';
            if (emp.photo) {
                var img = document.createElement('img');
                img.src = emp.photo;
                img.alt = emp.name;
                avatar.appendChild(img);
            } else {
                avatar.textContent = utils.getInitials(emp.name);
            }

            var nameEl = document.createElement('div');
            nameEl.className = 'gallery-name';
            nameEl.textContent = emp.name;

            var idEl = document.createElement('div');
            idEl.className = 'gallery-id';
            idEl.textContent = emp.id;

            card.appendChild(avatar);
            card.appendChild(nameEl);
            card.appendChild(idEl);
            gallery.appendChild(card);
        });
    },

    /* ---- XSS-safe: empName rendered via textContent ---- */
    updateLatecomers: function() {
        var section = document.getElementById('latecomers-section');
        var list = document.getElementById('latecomers-list');
        if (!section || !list) return;

        var lateCount = {};
        Object.values(db.data.logs).forEach(function(dayLogs) {
            dayLogs.forEach(function(log) {
                if (log.status === 'Late') {
                    if (!lateCount[log.empId]) {
                        lateCount[log.empId] = { name: log.empName, count: 0 };
                    }
                    lateCount[log.empId].count++;
                }
            });
        });

        var chronic = Object.entries(lateCount)
            .filter(function(entry) { return entry[1].count >= 3; })
            .sort(function(a, b) { return b[1].count - a[1].count; });

        if (chronic.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        list.innerHTML = '';

        chronic.forEach(function(entry) {
            var empId = entry[0];
            var data = entry[1];
            var item = document.createElement('div');
            item.className = 'latecomer-item';

            var avatarDiv = document.createElement('div');
            avatarDiv.className = 'latecomer-avatar';
            avatarDiv.textContent = utils.getInitials(data.name);

            var infoDiv = document.createElement('div');
            infoDiv.className = 'latecomer-info';

            var nameDiv = document.createElement('div');
            nameDiv.className = 'latecomer-name';
            nameDiv.textContent = data.name;

            var countDiv = document.createElement('div');
            countDiv.className = 'latecomer-count';
            countDiv.textContent = data.count + ' late arrivals';

            infoDiv.appendChild(nameDiv);
            infoDiv.appendChild(countDiv);
            item.appendChild(avatarDiv);
            item.appendChild(infoDiv);
            list.appendChild(item);
        });
    },

    checkBackupReminder: function() {
        var banner = document.getElementById('backup-reminder-banner');
        var textEl = document.getElementById('backup-reminder-text');
        if (!banner) return;
        
        var lastBackup = localStorage.getItem(BACKUP_DATE_KEY);
        var daysSince = lastBackup ? Math.floor((Date.now() - parseInt(lastBackup)) / (1000 * 60 * 60 * 24)) : 999;
        
        if (daysSince >= 14) {
            textEl.textContent = "It's been " + (daysSince >= 999 ? 'a while' : daysSince + ' days') + " since your last backup. Export now to keep your records safe.";
            banner.style.display = 'flex';
        } else {
            banner.style.display = 'none';
        }
    },

    dismissBackupReminder: function() {
        var banner = document.getElementById('backup-reminder-banner');
        if (banner) banner.style.display = 'none';
    },

    checkNewReportNotification: function() {
        var banner = document.getElementById('new-report-banner');
        if (!banner) return;
        
        var now = new Date();
        var currentYM = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        var lastViewed = localStorage.getItem(LAST_REPORT_VIEW_KEY);
        
        if (lastViewed !== currentYM) {
            var monthRecords = archive.getMonthRecords(currentYM);
            var hasCurrentData = monthRecords.length > 0;
            
            if (!hasCurrentData) {
                Object.keys(db.data.logs).forEach(function(date) {
                    if (date.substring(0, 7) === currentYM && db.data.logs[date].length > 0) {
                        hasCurrentData = true;
                    }
                });
            }
            
            if (hasCurrentData) {
                var textEl = document.getElementById('new-report-text');
                if (textEl) {
                    var parts = currentYM.split('-');
                    var monthLabel = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    textEl.textContent = 'New monthly report available for ' + monthLabel + '!';
                }
                banner.style.display = 'flex';
            }
        }
    },

    dismissReportNotification: function() {
        var banner = document.getElementById('new-report-banner');
        if (banner) banner.style.display = 'none';
    }
};


// ======================== RECORDS ========================
var records = {

    /* ---- XSS-safe: all log fields rendered via textContent / setAttribute ---- */
    load: function() {
        var tbody = document.querySelector('#records-table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        var allLogs = [];
        Object.keys(db.data.logs).forEach(function(date) {
            allLogs = allLogs.concat(db.data.logs[date].map(function(l) {
                return Object.assign({}, l, { date: date });
            }));
        });
        allLogs.sort(function(a, b) { return b.id - a.id; });

        if (allLogs.length === 0) {
            var emptyRow = document.createElement('tr');
            var emptyCell = document.createElement('td');
            emptyCell.colSpan = 8;
            emptyCell.style.textAlign = 'center';
            emptyCell.style.padding = '1.5rem';
            emptyCell.style.color = 'var(--text-muted)';
            emptyCell.textContent = 'No attendance records';
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
            document.getElementById('best-emp').textContent = '--';
            document.getElementById('worst-emp').textContent = '--';
            return;
        }

        var stats = {};
        allLogs.forEach(function(log) {
            if (!stats[log.empId]) {
                stats[log.empId] = { name: log.empName, totalMins: 0, count: 0, lateCount: 0 };
            }
            if (log.type === 'check-in') {
                if (log.duration && log.duration > 0) {
                    stats[log.empId].totalMins += log.duration;
                }
                stats[log.empId].count++;
            }
            if (log.status === 'Late') stats[log.empId].lateCount++;

            var row = document.createElement('tr');

            // Thumbnail
            var tdPhoto = document.createElement('td');
            var img = document.createElement('img');
            img.className = 'thumb';
            img.src = log.photo;
            img.alt = log.empName;
            tdPhoto.appendChild(img);
            row.appendChild(tdPhoto);

            // Name
            var tdName = document.createElement('td');
            tdName.textContent = log.empName;
            row.appendChild(tdName);

            // ID
            var tdId = document.createElement('td');
            tdId.textContent = log.empId;
            row.appendChild(tdId);

            // Date
            var tdDate = document.createElement('td');
            tdDate.textContent = log.date;
            row.appendChild(tdDate);

            // Time
            var tdTime = document.createElement('td');
            tdTime.textContent = log.time;
            row.appendChild(tdTime);

            // Type badge
            var tdType = document.createElement('td');
            var typeBadge = document.createElement('span');
            if (log.type === 'check-in') {
                typeBadge.className = 'badge badge-ontime';
                typeBadge.textContent = 'In';
            } else {
                typeBadge.className = 'badge badge-checkout';
                typeBadge.textContent = 'Out';
            }
            tdType.appendChild(typeBadge);
            row.appendChild(tdType);

            // Duration + OT
            var tdDuration = document.createElement('td');
            var durationStr = log.duration ? utils.formatDuration(log.duration) : '--';
            tdDuration.textContent = durationStr + (log.overtime ? ' ' : '');
            if (log.overtime) {
                var otBadge = document.createElement('span');
                otBadge.className = 'badge badge-overtime';
                otBadge.textContent = 'OT';
                tdDuration.appendChild(otBadge);
            }
            row.appendChild(tdDuration);

            // Status badge
            var tdStatus = document.createElement('td');
            var statusBadge = document.createElement('span');
            statusBadge.className = 'badge ' + (log.status === 'Late' ? 'badge-late' : 'badge-ontime');
            statusBadge.textContent = log.status;
            tdStatus.appendChild(statusBadge);
            row.appendChild(tdStatus);

            tbody.appendChild(row);
        });

        this.calcStats(stats);
    },

    calcStats: function(stats) {
        var ids = Object.keys(stats);
        if (ids.length === 0) return;
        var best = ids[0], worst = ids[0];
        var allLate = true;

        ids.forEach(function(id) {
            if (stats[id].lateCount === 0) allLate = false;
            if (stats[id].lateCount < stats[best].lateCount) best = id;
            if (stats[id].lateCount > stats[worst].lateCount) worst = id;
        });

        if (allLate) {
            document.getElementById('best-emp').textContent = 'None \u2014 All Late';
        } else {
            var bestName = stats[best].name;
            if (stats[best].lateCount === 0 && stats[best].count > 0) {
                bestName += ' (Perfect)';
            }
            document.getElementById('best-emp').textContent = bestName;
        }
        document.getElementById('worst-emp').textContent = stats[worst] ? stats[worst].name : '--';
    },

    search: function(query) {
        var tbody = document.querySelector('#records-table tbody');
        var rows = tbody.querySelectorAll('tr');
        var q = query.toLowerCase();

        rows.forEach(function(row) {
            var name = row.cells[1].textContent.toLowerCase();
            var id = row.cells[2].textContent.toLowerCase();
            row.style.display = (name.includes(q) || id.includes(q)) ? '' : 'none';
        });
    },

    confirmDelete: function() {
        document.getElementById('modal-delete').style.display = 'flex';
    },

    closeDeleteModal: function() {
        document.getElementById('modal-delete').style.display = 'none';
    },

    executeDelete: function() {
        db.data.logs = {};
        db.save();
        this.closeDeleteModal();
        this.load();
        admin.updateStats();
        chartsManager.update();
        utils.showToast('Records cleared', null, 'success');
    },

    downloadPDF: function() {
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF();
        var pageHeight = doc.internal.pageSize.getHeight();
        var pageWidth = doc.internal.pageSize.getWidth();

        /* ========== FETCH ALL LOGS ========== */
        var allLogs = [];
        Object.keys(db.data.logs).forEach(function(date) {
            allLogs = allLogs.concat(db.data.logs[date].map(function(l) {
                return Object.assign({}, l, { date: date });
            }));
        });
        allLogs.sort(function(a, b) { return b.id - a.id; });

        /* ========== HEADER ========== */
        // Title
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42);
        doc.text('BioAtteX', 14, 18);
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text('Attendance Report', 14, 25);

        // Report date — right aligned
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('Generated: ' + new Date().toLocaleString(), pageWidth - 14, 18, { align: 'right' });
        doc.text('Powered by MortApps Studios', pageWidth - 14, 24, { align: 'right' });

        // Accent line
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(0.8);
        doc.line(14, 29, pageWidth - 14, 29);

        /* ========== RECORDS TABLE ========== */
        var tableBody = allLogs.map(function(l) {
            return [
                l.date,
                l.time,
                l.empName,
                l.empId,
                l.type === 'check-in' ? 'In' : 'Out',
                l.duration ? utils.formatDuration(l.duration) : '--',
                l.status || '--'
            ];
        });

        doc.autoTable({
            head: [['Date', 'Time', 'Name', 'ID', 'Type', 'Duration', 'Status']],
            body: tableBody,
            startY: 34,
            theme: 'plain',
            headStyles: {
                fillColor: [15, 23, 42],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9,
                cellPadding: { top: 4, bottom: 4, left: 3, right: 3 }
            },
            bodyStyles: {
                fontSize: 8.5,
                cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
                textColor: [30, 41, 59],
                lineColor: [226, 232, 240],
                lineWidth: 0.1
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            columnStyles: {
                0: { cellWidth: 28 },
                1: { cellWidth: 20 },
                2: { cellWidth: 40 },
                3: { cellWidth: 28 },
                4: { cellWidth: 18 },
                5: { cellWidth: 28 },
                6: { cellWidth: 24 }
            },
            didParseCell: function(data) {
                // Color the Status column
                if (data.section === 'body' && data.column.index === 6) {
                    if (data.cell.raw === 'Late') {
                        data.cell.styles.textColor = [220, 38, 38];
                        data.cell.styles.fontStyle = 'bold';
                    } else if (data.cell.raw === 'On Time') {
                        data.cell.styles.textColor = [5, 150, 105];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
                // Color the Type column
                if (data.section === 'body' && data.column.index === 4) {
                    if (data.cell.raw === 'In') {
                        data.cell.styles.textColor = [59, 130, 246];
                        data.cell.styles.fontStyle = 'bold';
                    } else if (data.cell.raw === 'Out') {
                        data.cell.styles.textColor = [124, 58, 237];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            }
        });

        /* ========== EMPLOYEE SUMMARY ========== */
        var empSummary = {};
        allLogs.forEach(function(log) {
            if (log.type === 'check-in') {
                if (!empSummary[log.empId]) {
                    empSummary[log.empId] = {
                        name: log.empName,
                        id: log.empId,
                        totalDuration: 0,
                        checkins: 0,
                        lates: 0
                    };
                }
                if (log.duration && log.duration > 0) {
                    empSummary[log.empId].totalDuration += log.duration;
                }
                empSummary[log.empId].checkins++;
                if (log.status === 'Late') empSummary[log.empId].lates++;
            }
        });

        var summaryEntries = Object.values(empSummary);
        if (summaryEntries.length > 0) {
            var finalY = doc.lastAutoTable.finalY + 12;

            // Check if we need a new page
            if (finalY + 60 > pageHeight) {
                doc.addPage();
                finalY = 20;
            }

            // Section header
            doc.setFontSize(13);
            doc.setTextColor(15, 23, 42);
            doc.text('Employee Summary', 14, finalY);

            // Thin accent line under section header
            doc.setDrawColor(59, 130, 246);
            doc.setLineWidth(0.4);
            doc.line(14, finalY + 2, 60, finalY + 2);

            doc.autoTable({
                head: [['Name', 'ID', 'Shifts', 'Total Hours', 'Late Days', 'Punctuality']],
                body: summaryEntries.map(function(emp) {
                    var punctuality = emp.checkins > 0
                        ? Math.round(((emp.checkins - emp.lates) / emp.checkins) * 100)
                        : 0;
                    return [
                        emp.name,
                        emp.id,
                        emp.checkins,
                        utils.formatDuration(emp.totalDuration),
                        emp.lates,
                        punctuality + '%'
                    ];
                }),
                startY: finalY + 6,
                theme: 'plain',
                headStyles: {
                    fillColor: [30, 41, 59],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 9,
                    cellPadding: { top: 4, bottom: 4, left: 3, right: 3 }
                },
                bodyStyles: {
                    fontSize: 8.5,
                    cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
                    textColor: [30, 41, 59],
                    lineColor: [226, 232, 240],
                    lineWidth: 0.1
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252]
                },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 28 },
                    2: { cellWidth: 20 },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 24 },
                    5: { cellWidth: 28 }
                },
                didParseCell: function(data) {
                    // Color punctuality
                    if (data.section === 'body' && data.column.index === 5) {
                        var val = parseInt(data.cell.raw);
                        if (val >= 80) {
                            data.cell.styles.textColor = [5, 150, 105];
                            data.cell.styles.fontStyle = 'bold';
                        } else if (val < 50) {
                            data.cell.styles.textColor = [220, 38, 38];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            });
        }

        /* ========== FOOTER — BRAND + PAGE NUMBERS ========== */
        var totalPages = doc.internal.getNumberOfPages();
        for (var i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            var ph = doc.internal.pageSize.getHeight();
            var pw = doc.internal.pageSize.getWidth();

            // Thin line above footer
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.3);
            doc.line(14, ph - 18, pw - 14, ph - 18);

            // Bottom left: BioAtteX branding
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text('BioAtteX', 14, ph - 12);

            // Bottom right: Powered by
            doc.setFontSize(7);
            doc.setTextColor(186, 199, 213);
            doc.text('Powered by MortApps Studios', pw - 14, ph - 12, { align: 'right' });

            // Bottom center: page number
            doc.setFontSize(7);
            doc.setTextColor(186, 199, 213);
            doc.text('Page ' + i + ' of ' + totalPages, pw / 2, ph - 12, { align: 'center' });
        }

        doc.save('BioAtteX_Report_' + utils.formatDate(new Date()) + '.pdf');
        utils.showToast('PDF downloaded', null, 'success');
    }
};


// ======================== CHARTS MANAGER ========================
var chartsManager = {
    weeklyChart: null,
    punctualityChart: null,

    init: function() {
        this.createWeeklyChart();
        this.createPunctualityChart();
    },

    createWeeklyChart: function() {
        var ctx = document.getElementById('weekly-chart');
        if (!ctx) return;

        var data = this.getWeeklyData();

        this.weeklyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Check-ins',
                    data: data.checkins,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }, {
                    label: 'Late Arrivals',
                    data: data.lates,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 12, padding: 10, font: { size: 10 } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, font: { size: 10 } },
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    x: {
                        ticks: { font: { size: 9 } },
                        grid: { display: false }
                    }
                }
            }
        });
    },

    createPunctualityChart: function() {
        var ctx = document.getElementById('punctuality-chart');
        if (!ctx) return;

        var data = this.getPunctualityData();

        this.punctualityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'On Time %',
                    data: data.percentages,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgba(16, 185, 129, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 12, padding: 10, font: { size: 10 } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) { return value + '%'; },
                            font: { size: 10 }
                        },
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    x: {
                        ticks: { font: { size: 9 } },
                        grid: { display: false }
                    }
                }
            }
        });
    },

    getWeeklyData: function() {
        var labels = [];
        var checkins = [];
        var lates = [];
        var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (var i = 6; i >= 0; i--) {
            var date = new Date();
            date.setDate(date.getDate() - i);
            var dateStr = utils.formatDate(date);
            var dayLogs = db.data.logs[dateStr] || [];

            labels.push(days[date.getDay()]);
            checkins.push(dayLogs.filter(function(l) { return l.type === 'check-in'; }).length);
            lates.push(dayLogs.filter(function(l) { return l.status === 'Late'; }).length);
        }

        return { labels: labels, checkins: checkins, lates: lates };
    },

    getPunctualityData: function() {
        var labels = [];
        var percentages = [];

        for (var i = 6; i >= 0; i--) {
            var date = new Date();
            date.setDate(date.getDate() - i);
            var dateStr = utils.formatDate(date);
            var dayLogs = db.data.logs[dateStr] || [];

            var total = dayLogs.filter(function(l) { return l.type === 'check-in'; }).length;
            var onTime = dayLogs.filter(function(l) { return l.type === 'check-in' && l.status === 'On Time'; }).length;

            labels.push(date.getDate() + '/' + (date.getMonth() + 1));
            percentages.push(total > 0 ? Math.round((onTime / total) * 100) : 0);
        }

        return { labels: labels, percentages: percentages };
    },

    update: function() {
        if (this.weeklyChart) {
            var data = this.getWeeklyData();
            this.weeklyChart.data.labels = data.labels;
            this.weeklyChart.data.datasets[0].data = data.checkins;
            this.weeklyChart.data.datasets[1].data = data.lates;
            this.weeklyChart.update();
        }

        if (this.punctualityChart) {
            var data2 = this.getPunctualityData();
            this.punctualityChart.data.labels = data2.labels;
            this.punctualityChart.data.datasets[0].data = data2.percentages;
            this.punctualityChart.update();
        }
    }
};


// ======================== CALENDAR MANAGER ========================
var calendarManager = {
    currentDate: new Date(),

    init: function() {
        this.render();
    },

    /* ---- XSS-safe: calendar grid built with DOM methods, no innerHTML ---- */
    render: function() {
        var grid = document.getElementById('calendar-grid');
        var title = document.getElementById('calendar-month-year');
        if (!grid || !title) return;

        var year = this.currentDate.getFullYear();
        var month = this.currentDate.getMonth();

        title.textContent = this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        var firstDay = new Date(year, month, 1).getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var daysInPrevMonth = new Date(year, month, 0).getDate();
        var today = new Date();
        var self = this;

        grid.innerHTML = '';

        // Day headers
        var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(function(day) {
            var header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = day;
            grid.appendChild(header);
        });

        // Previous month days
        for (var pi = firstDay - 1; pi >= 0; pi--) {
            var prevDiv = document.createElement('div');
            prevDiv.className = 'calendar-day other-month';
            var prevSpan = document.createElement('span');
            prevSpan.className = 'day-num';
            prevSpan.textContent = daysInPrevMonth - pi;
            prevDiv.appendChild(prevSpan);
            grid.appendChild(prevDiv);
        }

        // Current month days
        for (var day = 1; day <= daysInMonth; day++) {
            (function(dayNum) {
                var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(dayNum).padStart(2, '0');
                var dayLogs = db.data.logs[dateStr] || [];
                var isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === dayNum;

                var statusClass = '';
                if (dayLogs.length > 0) {
                    var hasLate = dayLogs.some(function(l) { return l.status === 'Late'; });
                    var allOnTime = dayLogs.every(function(l) { return l.status !== 'Late'; });
                    if (hasLate && !allOnTime) statusClass = 'mixed';
                    else if (hasLate) statusClass = 'late';
                    else statusClass = 'present';
                }

                var dayDiv = document.createElement('div');
                dayDiv.className = 'calendar-day' + (isToday ? ' today' : '') + ' ' + statusClass;
                dayDiv.dataset.date = dateStr;

                var numSpan = document.createElement('span');
                numSpan.className = 'day-num';
                numSpan.textContent = dayNum;
                dayDiv.appendChild(numSpan);

                var indicator = document.createElement('span');
                indicator.className = 'day-indicator';
                dayDiv.appendChild(indicator);

                dayDiv.addEventListener('click', function() {
                    self.showDayDetail(dateStr);
                });

                grid.appendChild(dayDiv);
            })(day);
        }

        // Next month days
        var totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        var nextDays = totalCells - firstDay - daysInMonth;
        for (var ni = 1; ni <= nextDays; ni++) {
            var nextDiv = document.createElement('div');
            nextDiv.className = 'calendar-day other-month';
            var nextSpan = document.createElement('span');
            nextSpan.className = 'day-num';
            nextSpan.textContent = ni;
            nextDiv.appendChild(nextSpan);
            grid.appendChild(nextDiv);
        }
    },

    prevMonth: function() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
    },

    nextMonth: function() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
    },

    goToToday: function() {
        this.currentDate = new Date();
        this.render();
    },

    /* ---- XSS-safe: log fields rendered via textContent / setAttribute ---- */
    showDayDetail: function(dateStr) {
        var dayLogs = db.data.logs[dateStr] || [];
        var modal = document.getElementById('modal-day-detail');
        var titleEl = document.getElementById('day-detail-title');
        var list = document.getElementById('day-detail-list');

        var date = new Date(dateStr + 'T00:00:00');
        titleEl.textContent = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

        list.innerHTML = '';

        if (dayLogs.length === 0) {
            var noRecord = document.createElement('p');
            noRecord.style.textAlign = 'center';
            noRecord.style.color = 'var(--text-muted)';
            noRecord.style.padding = '2rem';
            noRecord.textContent = 'No attendance records for this day';
            list.appendChild(noRecord);
        } else {
            dayLogs.forEach(function(log) {
                var durationStr = log.duration ? utils.formatDuration(log.duration) : '--';
                var checkoutStr = log.checkOutTime ? ' - ' + log.checkOutTime : '';

                var item = document.createElement('div');
                item.className = 'day-detail-item';

                var photo = document.createElement('img');
                photo.src = log.photo;
                photo.alt = log.empName;
                item.appendChild(photo);

                var info = document.createElement('div');
                info.className = 'day-detail-info';

                var nameEl = document.createElement('div');
                nameEl.className = 'day-detail-name';
                nameEl.textContent = log.empName;

                var timeEl = document.createElement('div');
                timeEl.className = 'day-detail-time';
                timeEl.textContent = log.time + checkoutStr + ' (' + durationStr + ')';

                if (log.overtime) {
                    var otBadge = document.createElement('span');
                    otBadge.className = 'badge badge-overtime';
                    otBadge.textContent = 'OT';
                    timeEl.appendChild(document.createTextNode(' '));
                    timeEl.appendChild(otBadge);
                }

                info.appendChild(nameEl);
                info.appendChild(timeEl);
                item.appendChild(info);

                var statusBadge = document.createElement('span');
                statusBadge.className = 'badge ' + (log.status === 'Late' ? 'badge-late' : 'badge-ontime');
                statusBadge.textContent = log.status;
                item.appendChild(statusBadge);

                list.appendChild(item);
            });
        }

        modal.style.display = 'flex';
    }
};


// ======================== MONTHLY REPORT ========================
var monthlyReport = {
    currentMonth: null,
    _isReportVisible: false,
    
    init: function() {
        this.populateMonthSelect();
    },
    
    populateMonthSelect: function() {
        var select = document.getElementById('report-month-select');
        if (!select) return;
        select.innerHTML = '';
        
        var months = archive.getAvailableMonths();
        var now = new Date();
        var currentYM = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        
        if (months.indexOf(currentYM) === -1) {
            months.unshift(currentYM);
        }
        
        if (months.length === 0) {
            var opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'No data available';
            select.appendChild(opt);
            return;
        }
        
        months.forEach(function(ym) {
            var opt = document.createElement('option');
            opt.value = ym;
            var parts = ym.split('-');
            var date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
            opt.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            select.appendChild(opt);
        });
    },
    
    generate: function() {
        var select = document.getElementById('report-month-select');
        var yearMonth = select ? select.value : '';
        if (!yearMonth) {
            utils.showToast('Select a month first', null, 'warning');
            return;
        }
        
        // Toggle: if report is already visible for the same month, retract it
        var content = document.getElementById('report-content');
        var btn = document.getElementById('btn-get-report');
        if (this._isReportVisible && this.currentMonth === yearMonth && content && content.style.display !== 'none') {
            content.style.display = 'none';
            document.getElementById('report-actions').style.display = 'none';
            this._isReportVisible = false;
            if (btn) btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V4"/><path d="M6 20v-6"/><path d="M18 20V10"/></svg> Get Report';
            return;
        }
        
        this.currentMonth = yearMonth;
        var recs = archive.getMonthRecords(yearMonth);
        
        var dbRecords = [];
        Object.keys(db.data.logs).forEach(function(date) {
            if (date.substring(0, 7) === yearMonth) {
                db.data.logs[date].forEach(function(log) {
                    dbRecords.push(log);
                });
            }
        });
        
        var allRecords = recs.slice();
        var archiveIds = new Set(recs.map(function(r) { return r.empId + '_' + r.date + '_' + r.time; }));
        dbRecords.forEach(function(log) {
            var key = log.empId + '_' + log.date + '_' + log.time;
            if (!archiveIds.has(key)) {
                allRecords.push({
                    empId: log.empId,
                    empName: log.empName,
                    date: log.date,
                    time: log.time,
                    type: log.type,
                    status: log.status,
                    minutes: log.minutes || 0,
                    duration: log.duration || null,
                    overtime: log.overtime || false
                });
            }
        });
        
        if (allRecords.length === 0) {
            utils.showToast('No attendance data for this month', null, 'warning');
            return;
        }
        
        var report = this.analyzeData(allRecords, yearMonth);
        this.render(report);
        
        document.getElementById('monthly-report-panel').style.display = 'block';
        document.getElementById('report-actions').style.display = 'flex';
        this._isReportVisible = true;
        if (btn) btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg> Hide Report';
        
        localStorage.setItem(LAST_REPORT_VIEW_KEY, yearMonth);
        
        // Scroll to the report content so user sees it
        setTimeout(function() {
            var contentEl = document.getElementById('report-content');
            if (contentEl) contentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    },
    
    analyzeData: function(records, yearMonth) {
        var employees = {};
        var dayOfWeekLate = {0:0,1:0,2:0,3:0,4:0,5:0,6:0};
        var dayOfWeekTotal = {0:0,1:0,2:0,3:0,4:0,5:0,6:0};
        
        var parts = yearMonth.split('-');
        var year = parseInt(parts[0]);
        var month = parseInt(parts[1]) - 1;
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var workDays = 0;
        for (var d = 1; d <= daysInMonth; d++) {
            var day = new Date(year, month, d).getDay();
            if (day !== 0 && day !== 6) workDays++;
        }
        
        records.forEach(function(r) {
            if (r.type === 'check-in') {
                if (!employees[r.empId]) {
                    employees[r.empId] = {
                        name: r.empName,
                        id: r.empId,
                        checkIns: 0,
                        lateCount: 0,
                        onTimeCount: 0,
                        totalMinutes: 0,
                        totalDuration: 0,
                        overtimeCount: 0,
                        durations: []
                    };
                }
                employees[r.empId].checkIns++;
                if (r.status === 'Late') {
                    employees[r.empId].lateCount++;
                } else if (r.status === 'On Time') {
                    employees[r.empId].onTimeCount++;
                }
                if (r.duration && r.duration > 0) {
                    employees[r.empId].totalDuration += r.duration;
                    employees[r.empId].durations.push(r.duration);
                }
                if (r.overtime) employees[r.empId].overtimeCount++;
                employees[r.empId].totalMinutes += r.minutes || 0;
                
                if (r.date) {
                    var dateParts = r.date.split('-');
                    var recDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
                    var dow = recDate.getDay();
                    dayOfWeekTotal[dow]++;
                    if (r.status === 'Late') dayOfWeekLate[dow]++;
                }
            }
        });
        
        var empList = Object.values(employees);
        
        empList.forEach(function(e) {
            e.punctualityRate = e.checkIns > 0 ? Math.round(((e.checkIns - e.lateCount) / e.checkIns) * 100) : 0;
            e.avgArrivalMinutes = e.durations.length > 0 ? Math.round(e.totalMinutes / e.checkIns) : 0;
        });
        
        var sortedPunctual = empList.slice().sort(function(a, b) { return b.punctualityRate - a.punctualityRate || a.lateCount - b.lateCount; });
        var sortedLate = empList.slice().sort(function(a, b) { return b.lateCount - a.lateCount; });
        var sortedOvertime = empList.slice().sort(function(a, b) { return b.overtimeCount - a.overtimeCount; });
        
        var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var worstDay = '', worstDayRate = 0;
        var bestDay = '', bestDayRate = 100;
        for (var i = 0; i < 7; i++) {
            if (dayOfWeekTotal[i] > 0) {
                var rate = Math.round((dayOfWeekLate[i] / dayOfWeekTotal[i]) * 100);
                if (rate > worstDayRate) { worstDayRate = rate; worstDay = dayNames[i]; }
                if (rate < bestDayRate) { bestDayRate = rate; bestDay = dayNames[i]; }
            }
        }
        
        var totalCheckIns = empList.reduce(function(s, e) { return s + e.checkIns; }, 0);
        var totalLate = empList.reduce(function(s, e) { return s + e.lateCount; }, 0);
        var overallPunctuality = totalCheckIns > 0 ? Math.round(((totalCheckIns - totalLate) / totalCheckIns) * 100) : 0;
        
        var activeDays = 0;
        var dailyStats = {};
        records.forEach(function(r) {
            if (r.type === 'check-in') {
                if (!dailyStats[r.date]) { dailyStats[r.date] = 0; activeDays++; }
                dailyStats[r.date]++;
            }
        });
        
        var prevMonth = this.getPreviousMonth(yearMonth);
        var prevRecords = archive.getMonthRecords(prevMonth);
        var prevLate = prevRecords.filter(function(r) { return r.type === 'check-in' && r.status === 'Late'; }).length;
        var prevCheckIns = prevRecords.filter(function(r) { return r.type === 'check-in'; }).length;
        var prevPunctuality = prevCheckIns > 0 ? Math.round(((prevCheckIns - prevLate) / prevCheckIns) * 100) : null;
        var punctualityTrend = prevPunctuality !== null ? overallPunctuality - prevPunctuality : null;
        
        var insights = this.generateInsights(empList, {
            totalCheckIns: totalCheckIns,
            totalLate: totalLate,
            overallPunctuality: overallPunctuality,
            workDays: workDays,
            activeDays: activeDays,
            worstDay: worstDay,
            worstDayRate: worstDayRate,
            bestDay: bestDay,
            bestDayRate: bestDayRate,
            punctualityTrend: punctualityTrend,
            sortedLate: sortedLate,
            sortedOvertime: sortedOvertime,
            dayOfWeekLate: dayOfWeekLate,
            dayOfWeekTotal: dayOfWeekTotal,
            dayNames: dayNames,
            employeeCount: db.data.employees.length
        });
        
        return {
            yearMonth: yearMonth,
            workDays: workDays,
            activeDays: activeDays,
            totalCheckIns: totalCheckIns,
            totalLate: totalLate,
            overallPunctuality: overallPunctuality,
            employeeCount: empList.length,
            totalEmployees: db.data.employees.length,
            mostPunctual: (sortedPunctual[0] && sortedPunctual[0].onTimeCount > 0) ? sortedPunctual[0] : null,
            lateEmployeeCount: empList.filter(function(e) { return e.lateCount > 0; }).length,
            onTimeEmployeeCount: empList.filter(function(e) { return e.onTimeCount > 0; }).length,
            mostLate: sortedLate[0] || null,
            mostOvertime: sortedOvertime[0] || null,
            employees: empList,
            insights: insights,
            punctualityTrend: punctualityTrend,
            worstDay: worstDay,
            worstDayRate: worstDayRate,
            bestDay: bestDay,
            bestDayRate: bestDayRate
        };
    },
    
    getPreviousMonth: function(yearMonth) {
        var parts = yearMonth.split('-');
        var year = parseInt(parts[0]);
        var month = parseInt(parts[1]) - 1;
        if (month === 0) { year--; month = 11; }
        return year + '-' + String(month + 1).padStart(2, '0');
    },
    
    generateInsights: function(empList, ctx) {
        var insights = [];
        
        if (ctx.punctualityTrend !== null) {
            if (ctx.punctualityTrend > 0) {
                insights.push({ type: 'positive', text: 'Overall punctuality improved by ' + ctx.punctualityTrend + '% compared to last month \u2014 a positive trend. The team is showing better time management.' });
            } else if (ctx.punctualityTrend < 0) {
                insights.push({ type: 'negative', text: 'Overall punctuality declined by ' + Math.abs(ctx.punctualityTrend) + '% compared to last month. This warrants attention \u2014 consider addressing underlying causes.' });
            } else {
                if (ctx.overallPunctuality < 50) {
                insights.push({ type: 'negative', text: 'Overall punctuality remained critically low at ' + ctx.overallPunctuality + '% compared to last month. This is not stability — it is a persistent problem requiring immediate intervention.' });
            } else {
                insights.push({ type: 'info', text: 'Overall punctuality remained the same as last month (' + ctx.overallPunctuality + '%). Stable, but there may be room for improvement.' });
            }
            }
        }
        
        var chronicLate = ctx.sortedLate.filter(function(e) { return e.lateCount >= 3; });
        if (chronicLate.length > 0) {
            var names = chronicLate.map(function(e) { return e.name; }).join(', ');
            insights.push({ type: 'warning', text: chronicLate.length + ' employee(s) were late 3 or more times: ' + names + '. Consider scheduling a one-on-one discussion to understand and resolve the pattern.' });
        }
        
        if (ctx.worstDay && ctx.worstDayRate > 0) {
            insights.push({ type: 'warning', text: ctx.worstDay + 's had the highest late arrival rate at ' + ctx.worstDayRate + '%. If this is consistent, consider reviewing Monday meeting schedules or shift start times on this day.' });
        }
        if (ctx.bestDay && ctx.bestDayRate < ctx.worstDayRate) {
            insights.push({ type: 'positive', text: ctx.bestDay + 's had the best on-time rate at ' + (100 - ctx.bestDayRate) + '%. This could indicate employees are more refreshed or the schedule works better mid-week.' });
        }
        
        if (ctx.sortedOvertime.length > 0 && ctx.sortedOvertime[0].overtimeCount > 3) {
            var otEmp = ctx.sortedOvertime[0];
            insights.push({ type: 'warning', text: otEmp.name + ' worked overtime on ' + otEmp.overtimeCount + ' out of ' + otEmp.checkIns + ' work days this month. Excessive overtime can lead to burnout. Review workload distribution.' });
        }
        
        var absentees = empList.filter(function(e) { return e.checkIns < ctx.workDays * 0.7; });
        if (absentees.length > 0 && ctx.workDays > 5) {
            var absNames = absentees.map(function(e) { return e.name + ' (' + e.checkIns + '/' + ctx.workDays + ' days)'; }).join(', ');
            insights.push({ type: 'negative', text: 'The following employees checked in less than 70% of work days: ' + absNames + '. Frequent absences may indicate disengagement or personal issues requiring HR attention.' });
        }
        
        if (ctx.overallPunctuality >= 90) {
            insights.push({ type: 'positive', text: 'The team achieved ' + ctx.overallPunctuality + '% overall punctuality this month \u2014 an excellent result. Recognise and appreciate this level of discipline.' });
        } else if (ctx.overallPunctuality < 70) {
            insights.push({ type: 'negative', text: 'Team punctuality is at ' + ctx.overallPunctuality + '% \u2014 below the 70% threshold. This is a systemic issue that needs structural solutions, not just individual conversations.' });
        }
        
        if (ctx.sortedLate.length > 0 && ctx.totalLate > 0) {
            var topLateShare = Math.round((ctx.sortedLate[0].lateCount / ctx.totalLate) * 100);
            if (topLateShare >= 40 && ctx.sortedLate.length > 1) {
                insights.push({ type: 'warning', text: ctx.sortedLate[0].name + ' accounts for ' + topLateShare + '% of all late check-ins this month. While others are generally on time, this individual may need targeted intervention.' });
            }
        }
        
        return insights;
    },
    
    render: function(report) {
        var content = document.getElementById('report-content');
        if (!content) return;
        
        var parts = report.yearMonth.split('-');
        var monthLabel = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        var html = '';
        
        html += '<div class="report-summary-grid">';
        html += '<div class="report-summary-card"><span class="report-summary-value" style="color: var(--accent);">' + report.activeDays + '</span><span class="report-summary-label">Active Work Days</span></div>';
        html += '<div class="report-summary-card"><span class="report-summary-value" style="color: var(--primary);">' + report.employeeCount + '</span><span class="report-summary-label">Employees Tracked</span></div>';
        html += '<div class="report-summary-card"><span class="report-summary-value" style="color: ' + (report.overallPunctuality >= 80 ? 'var(--success)' : report.overallPunctuality >= 60 ? 'var(--warning)' : 'var(--danger)') + ';">' + report.overallPunctuality + '%</span><span class="report-summary-label">On-Time Rate</span></div>';
        html += '<div class="report-summary-card"><span class="report-summary-value" style="color: var(--danger);">' + report.totalLate + '</span><span class="report-summary-label">Late Check-ins (' + report.lateEmployeeCount + ' employee' + (report.lateEmployeeCount !== 1 ? 's' : '') + ')</span></div>';
        html += '</div>';
        
        html += '<div class="report-ranking">';
        
        if (report.mostPunctual) {
            html += '<div class="report-ranking-item">';
            html += '<div class="report-ranking-badge" style="background: var(--success);">&#10003;</div>';
            html += '<div class="report-ranking-info"><div class="report-ranking-name">' + report.mostPunctual.name + '</div>';
            html += '<div class="report-ranking-stat">Most Punctual \u2014 ' + report.mostPunctual.punctualityRate + '% on-time (' + report.mostPunctual.onTimeCount + '/' + report.mostPunctual.checkIns + ')</div></div></div>';
        } else {
            html += '<div class="report-ranking-item">';
            html += '<div class="report-ranking-badge" style="background: var(--text-muted);">&#10003;</div>';
            html += '<div class="report-ranking-info"><div class="report-ranking-name" style="color: var(--text-muted);">None</div>';
            html += '<div class="report-ranking-stat">No one was on time this month</div></div></div>';
        }
        
        if (report.mostLate && report.mostLate.lateCount > 0) {
            html += '<div class="report-ranking-item">';
            html += '<div class="report-ranking-badge" style="background: var(--danger);">&#9888;</div>';
            html += '<div class="report-ranking-info"><div class="report-ranking-name">' + report.mostLate.name + '</div>';
            html += '<div class="report-ranking-stat">Most Late \u2014 ' + report.mostLate.lateCount + ' late check-in' + (report.mostLate.lateCount > 1 ? 's' : '') + '</div></div></div>';
        }
        
        if (report.mostOvertime && report.mostOvertime.overtimeCount > 0) {
            html += '<div class="report-ranking-item">';
            html += '<div class="report-ranking-badge" style="background: var(--warning);">&#9201;</div>';
            html += '<div class="report-ranking-info"><div class="report-ranking-name">' + report.mostOvertime.name + '</div>';
            html += '<div class="report-ranking-stat">Most Overtime \u2014 ' + report.mostOvertime.overtimeCount + ' day' + (report.mostOvertime.overtimeCount > 1 ? 's' : '') + '</div></div></div>';
        }
        
        html += '</div>';
        
        if (report.employees.length > 0) {
            html += '<h4 style="font-size: 0.9rem; margin: 1rem 0 0.5rem; color: var(--text-main);">Employee Breakdown</h4>';
            html += '<div style="overflow-x: auto;"><table class="report-employee-table"><thead><tr><th>Name</th><th>Days</th><th>Late</th><th>On-Time %</th><th>OT Days</th></tr></thead><tbody>';
            report.employees.sort(function(a, b) { return b.punctualityRate - a.punctualityRate; }).forEach(function(emp) {
                html += '<tr><td style="font-weight:600;">' + emp.name + '</td><td>' + emp.checkIns + '</td>';
                html += '<td style="color:' + (emp.lateCount > 0 ? 'var(--danger)' : 'var(--success)') + ';font-weight:600;">' + emp.lateCount + '</td>';
                html += '<td style="color:' + (emp.punctualityRate >= 80 ? 'var(--success)' : emp.punctualityRate >= 60 ? 'var(--warning)' : 'var(--danger)') + ';font-weight:700;">' + emp.punctualityRate + '%</td>';
                html += '<td>' + (emp.overtimeCount || 0) + '</td></tr>';
            });
            html += '</tbody></table></div>';
        }
        
        if (report.insights.length > 0) {
            html += '<div class="report-insights">';
            html += '<h4 style="font-size: 0.9rem; margin: 0 0 0.75rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">';
            html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M20.66 8A10 10 0 0 0 14 2.05V8h6.66z"/><path d="M12 22c5.52 0 10-4.48 10-10h-10v10z"/></svg>';
            html += 'HR Insights &amp; Recommendations</h4>';
            
            report.insights.forEach(function(insight) {
                var icon = insight.type === 'positive' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' :
                           insight.type === 'warning' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' :
                           insight.type === 'negative' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' :
                           '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
                html += '<div class="report-insight-item report-insight-' + insight.type + '">' + icon + '<span>' + insight.text + '</span></div>';
            });
            html += '</div>';
        }
        
        content.innerHTML = html;
        content.style.display = 'block';
    },
    
    hide: function() {
        var content = document.getElementById('report-content');
        var actions = document.getElementById('report-actions');
        if (content) content.style.display = 'none';
        if (actions) actions.style.display = 'none';
        this._isReportVisible = false;
        var btn = document.getElementById('btn-get-report');
        if (btn) btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V4"/><path d="M6 20v-6"/><path d="M18 20V10"/></svg> Get Report';
    },
    
    clearMonth: function() {
        if (!this.currentMonth) return;
        archive.clearMonth(this.currentMonth);
        this.populateMonthSelect();
        this.hide();
        utils.showToast('Monthly report data cleared', null, 'success');
    },
    
    downloadPDF: function() {
        if (!this.currentMonth) return;
        
        var recs = archive.getMonthRecords(this.currentMonth);
        var dbRecords = [];
        Object.keys(db.data.logs).forEach(function(date) {
            if (date.substring(0, 7) === monthlyReport.currentMonth) {
                db.data.logs[date].forEach(function(log) {
                    dbRecords.push(log);
                });
            }
        });
        var allRecords = recs.slice();
        var archiveIds = new Set(recs.map(function(r) { return r.empId + '_' + r.date + '_' + r.time; }));
        dbRecords.forEach(function(log) {
            var key = log.empId + '_' + log.date + '_' + log.time;
            if (!archiveIds.has(key)) {
                allRecords.push({ empId: log.empId, empName: log.empName, date: log.date, time: log.time, type: log.type, status: log.status, minutes: log.minutes || 0, duration: log.duration || null, overtime: log.overtime || false });
            }
        });
        
        if (allRecords.length === 0) { utils.showToast('No data to export', null, 'warning'); return; }
        
        var report = this.analyzeData(allRecords, this.currentMonth);
        
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF();
        var pw = doc.internal.pageSize.getWidth();
        var ph = doc.internal.pageSize.getHeight();
        
        var parts = this.currentMonth.split('-');
        var monthLabel = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        // Header
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pw, 32, 'F');
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text('BioAtteX', 14, 14);
        doc.setFontSize(11);
        doc.setTextColor(148, 163, 184);
        doc.text('Monthly Attendance Report', 14, 22);
        doc.setFontSize(9);
        doc.text(monthLabel, pw - 14, 14, { align: 'right' });
        doc.text('Generated: ' + new Date().toLocaleDateString(), pw - 14, 20, { align: 'right' });
        
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(0.8);
        doc.line(14, 36, pw - 14, 36);
        
        // Summary
        var y = 44;
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text('Summary', 14, y);
        y += 2;
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(0.4);
        doc.line(14, y, 50, y);
        y += 8;
        
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text('Active Work Days: ' + report.activeDays, 14, y);
        doc.text('Employees Tracked: ' + report.employeeCount, pw / 2, y);
        y += 6;
        doc.text('Total Check-ins: ' + report.totalCheckIns, 14, y);
        doc.text('Late Check-ins: ' + report.totalLate + ' (' + report.lateEmployeeCount + ' employee' + (report.lateEmployeeCount !== 1 ? 's' : '') + ')', pw / 2, y);
        y += 6;
        var punctColor = report.overallPunctuality >= 80 ? [5, 150, 105] : report.overallPunctuality >= 60 ? [217, 119, 6] : [220, 38, 38];
        doc.setTextColor(punctColor[0], punctColor[1], punctColor[2]);
        doc.text('Overall Punctuality: ' + report.overallPunctuality + '%', 14, y);
        doc.setTextColor(30, 41, 59);
        if (report.punctualityTrend !== null) {
            var trendText = report.punctualityTrend > 0 ? '+' + report.punctualityTrend + '% vs last month' : report.punctualityTrend < 0 ? report.punctualityTrend + '% vs last month' : 'No change vs last month';
            doc.text('Trend: ' + trendText, pw / 2, y);
        }
        y += 10;
        
        // Rankings
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text('Rankings', 14, y);
        y += 2;
        doc.setDrawColor(59, 130, 246);
        doc.line(14, y, 50, y);
        y += 8;
        
        doc.setFontSize(10);
        if (report.mostPunctual) {
            doc.setTextColor(5, 150, 105);
            doc.text('Most Punctual: ', 14, y);
            doc.setTextColor(30, 41, 59);
            doc.text(report.mostPunctual.name + ' (' + report.mostPunctual.punctualityRate + '% on-time)', 50, y);
            y += 6;
        } else {
            doc.setTextColor(148, 163, 184);
            doc.text('Most Punctual: None - No one was on time this month', 14, y);
            y += 6;
        }
        if (report.mostLate && report.mostLate.lateCount > 0) {
            doc.setTextColor(220, 38, 38);
            doc.text('Most Late: ', 14, y);
            doc.setTextColor(30, 41, 59);
            doc.text(report.mostLate.name + ' (' + report.mostLate.lateCount + ' late check-in' + (report.mostLate.lateCount > 1 ? 's' : '') + ')', 50, y);
            y += 6;
        }
        if (report.mostOvertime && report.mostOvertime.overtimeCount > 0) {
            doc.setTextColor(217, 119, 6);
            doc.text('Most Overtime: ', 14, y);
            doc.setTextColor(30, 41, 59);
            doc.text(report.mostOvertime.name + ' (' + report.mostOvertime.overtimeCount + ' days)', 58, y);
            y += 6;
        }
        y += 6;
        
        // Employee table
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text('Employee Breakdown', 14, y);
        y += 2;
        doc.setDrawColor(59, 130, 246);
        doc.line(14, y, 65, y);
        y += 4;
        
        var tableBody = report.employees.sort(function(a, b) { return b.punctualityRate - a.punctualityRate; }).map(function(emp) {
            return [emp.name, emp.checkIns, emp.lateCount, emp.punctualityRate + '%', emp.overtimeCount || 0, emp.totalDuration ? utils.formatDuration(emp.totalDuration) : '--'];
        });
        
        doc.autoTable({
            head: [['Name', 'Days', 'Late', 'On-Time', 'OT', 'Total Hours']],
            body: tableBody,
            startY: y,
            theme: 'plain',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            didParseCell: function(data) {
                if (data.section === 'body' && data.column.index === 3) {
                    var val = parseInt(data.cell.raw);
                    if (val >= 80) data.cell.styles.textColor = [5, 150, 105];
                    else if (val < 60) data.cell.styles.textColor = [220, 38, 38];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });
        
        // Insights section
        var finalY = doc.lastAutoTable.finalY + 12;
        if (finalY + 60 > ph) { doc.addPage(); finalY = 20; }
        
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text('HR Insights & Recommendations', 14, finalY);
        finalY += 2;
        doc.setDrawColor(59, 130, 246);
        doc.line(14, finalY, 90, finalY);
        finalY += 8;
        
        report.insights.forEach(function(insight) {
            if (finalY + 12 > ph) { doc.addPage(); finalY = 20; }
            var bullet = insight.type === 'positive' ? '[+] ' : insight.type === 'warning' ? '[!] ' : insight.type === 'negative' ? '[-] ' : '[i] ';
            var color = insight.type === 'positive' ? [5, 150, 105] : insight.type === 'warning' ? [217, 119, 6] : insight.type === 'negative' ? [220, 38, 38] : [59, 130, 246];
            doc.setFontSize(9);
            doc.setTextColor(color[0], color[1], color[2]);
            doc.text(bullet, 14, finalY);
            doc.setTextColor(30, 41, 59);
            var lines = doc.splitTextToSize(insight.text, pw - 28);
            doc.text(lines, 22, finalY);
            finalY += lines.length * 4 + 4;
        });
        
        // Footer
        var totalPages = doc.internal.getNumberOfPages();
        for (var i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            var pHeight = doc.internal.pageSize.getHeight();
            var pWidth = doc.internal.pageSize.getWidth();
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.3);
            doc.line(14, pHeight - 18, pWidth - 14, pHeight - 18);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text('BioAtteX Monthly Report', 14, pHeight - 12);
            doc.setFontSize(7);
            doc.setTextColor(186, 199, 213);
            doc.text('Powered by MortApps Studios', pWidth - 14, pHeight - 12, { align: 'right' });
            doc.text('Page ' + i + ' of ' + totalPages, pWidth / 2, pHeight - 12, { align: 'center' });
        }
        
        doc.save('BioAtteX_Monthly_Report_' + this.currentMonth + '.pdf');
        utils.showToast('Monthly report PDF downloaded', null, 'success');
    }
};


// ======================== INSTALL MANAGER ========================
var installManager = {
    deferredPrompt: null,

    init: function() {
        var self = this;
        window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            self.deferredPrompt = e;
            console.log('Install prompt captured and deferred');
        });
    },

    canInstall: function() {
        return this.deferredPrompt !== null;
    },

    install: function() {
        if (!this.deferredPrompt) return Promise.resolve(false);
        var self = this;
        this.deferredPrompt.prompt();
        return this.deferredPrompt.userChoice.then(function(result) {
            self.deferredPrompt = null;
            if (result.outcome === 'accepted') {
                console.log('User accepted install');
                utils.showToast('Bioattex installed successfully!', null, 'success');
            }
            return result.outcome === 'accepted';
        });
    },

    showPopup: function() {
        // Never show if already running as installed software
        if (utils.isStandalone()) return false;
        // Respect "never remind" preference
        if (localStorage.getItem(INSTALL_DISMISSED_KEY) === 'never') return false;

        var installBtn = document.getElementById('btn-install-now');
        var iosInstructions = document.getElementById('ios-install-instructions');
        var desktopInstructions = document.getElementById('desktop-install-instructions');

        // Reset visibility
        if (iosInstructions) iosInstructions.style.display = 'none';
        if (desktopInstructions) desktopInstructions.style.display = 'none';

        // Determine what to show based on platform and prompt availability
        if (this.canInstall()) {
            // Chrome/Edge/Samsung: native install prompt available
            if (installBtn) installBtn.style.display = 'flex';
        } else if (utils.isIOS()) {
            // iOS Safari: no native prompt, show step-by-step instructions
            if (installBtn) installBtn.style.display = 'none';
            if (iosInstructions) iosInstructions.style.display = 'block';
        } else if (utils.isMobile()) {
            // Other mobile browsers (Firefox etc.)
            if (installBtn) installBtn.style.display = 'none';
            if (desktopInstructions) desktopInstructions.style.display = 'block';
        } else {
            // Desktop browsers without native prompt (Firefox etc.)
            if (installBtn) installBtn.style.display = 'none';
            if (desktopInstructions) desktopInstructions.style.display = 'block';
        }

        document.getElementById('install-popup-overlay').style.display = 'flex';
        return true;
    },

    hidePopup: function(neverRemind) {
        document.getElementById('install-popup-overlay').style.display = 'none';
        if (neverRemind) localStorage.setItem(INSTALL_DISMISSED_KEY, 'never');
    },

    handleInstallClick: function() {
        var self = this;
        if (this.canInstall()) {
            this.install().then(function(accepted) {
                self.hidePopup(false);
            });
        } else {
            // Fallback: shouldn't reach here since button is hidden when canInstall is false
            utils.showToast('Use your browser menu to install this software');
            this.hidePopup(false);
        }
    },

    handleLaterClick: function() {
        var neverRemind = document.getElementById('chk-never-remind').checked;
        this.hidePopup(neverRemind);
    }
};