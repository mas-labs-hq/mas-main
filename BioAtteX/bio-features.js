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

    login: function() {
        var pinInput = document.getElementById('pin-input');
        if (pinInput.value === db.data.pin) {
            pinInput.value = '';
            this.isLoggedIn = true;
            document.getElementById('nav-records').classList.remove('hidden');
            document.getElementById('nav-calendar').classList.remove('hidden');
            app.nav('dashboard');
            utils.showToast('Admin access granted', null, 'success');
            soundManager.play('click');
        } else {
            utils.showToast('Incorrect password', null, 'error');
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
        soundManager.play('click');
    },

    downloadBackup: function() {
        var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db.data));
        var dl = document.createElement('a');
        dl.setAttribute('href', dataStr);
        dl.setAttribute('download', 'bioattex_backup_' + utils.formatDate(new Date()) + '.json');
        document.body.appendChild(dl);
        dl.click();
        document.body.removeChild(dl);
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
                soundManager.play('click');
                setTimeout(function() { self.captureLoop(); }, 800);
            } else {
                this.isRegistering = false;
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
            descriptor: this.tempDescriptors.map(function(d) { return Array.from(d); })
        });
        db.save();
        document.getElementById('reg-name').value = '';
        document.getElementById('reg-id').value = '';
        document.getElementById('btn-reg-save').disabled = true;
        document.getElementById('reg-status').textContent = '';
        this.tempDescriptors = [];
        this.tempName = '';
        this.tempId = '';
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
            avatar.textContent = utils.getInitials(emp.name);

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
                stats[log.empId].totalMins += log.minutes;
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
            if (log.type === 'check-out') {
                var typeBadge = document.createElement('span');
                typeBadge.className = 'badge badge-checkout';
                typeBadge.textContent = 'Out';
                tdType.appendChild(typeBadge);
            }
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
        ids.forEach(function(id) {
            if (!stats[best] || stats[id].lateCount < stats[best].lateCount) best = id;
            if (!stats[worst] || stats[id].lateCount > stats[worst].lateCount) worst = id;
        });
        document.getElementById('best-emp').textContent = stats[best] ? stats[best].name : '--';
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
        doc.setFontSize(18);
        doc.text('Bioattex Attendance Report', 14, 20);
        doc.setFontSize(10);
        doc.text('Generated: ' + new Date().toLocaleString(), 14, 28);

        var allLogs = [];
        Object.keys(db.data.logs).forEach(function(date) {
            allLogs = allLogs.concat(db.data.logs[date].map(function(l) {
                return Object.assign({}, l, { date: date });
            }));
        });
        allLogs.sort(function(a, b) { return b.id - a.id; });

        doc.autoTable({
            head: [['Date', 'Time', 'Name', 'ID', 'Type', 'Duration', 'Status']],
            body: allLogs.map(function(l) {
                return [
                    l.date,
                    l.time,
                    l.empName,
                    l.empId,
                    l.type || 'check-in',
                    l.duration ? utils.formatDuration(l.duration) : '--',
                    l.status
                ];
            }),
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] },
            styles: { fontSize: 9 }
        });
        doc.save('Bioattex_Report_' + utils.formatDate(new Date()) + '.pdf');
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


// ======================== INSTALL MANAGER ========================
var installManager = {
    deferredPrompt: null,

    init: function() {
        window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            this.deferredPrompt = e;
        }.bind(this));
    },

    canInstall: function() {
        return this.deferredPrompt !== null;
    },

    install: function() {
        if (!this.deferredPrompt) return Promise.resolve(false);
        this.deferredPrompt.prompt();
        var self = this;
        return this.deferredPrompt.userChoice.then(function(result) {
            self.deferredPrompt = null;
            return result.outcome === 'accepted';
        });
    },

    showPopup: function() {
        if (utils.isStandalone()) return false;
        if (localStorage.getItem(INSTALL_DISMISSED_KEY) === 'never') return false;
        document.getElementById('ios-instructions').style.display = 'none';
        document.getElementById('desktop-instructions').style.display = 'none';
        document.getElementById('install-popup-overlay').style.display = 'flex';
        return true;
    },

    hidePopup: function(neverRemind) {
        document.getElementById('install-popup-overlay').style.display = 'none';
        if (neverRemind) localStorage.setItem(INSTALL_DISMISSED_KEY, 'never');
    },

    showDesktopInstructions: function() {
        document.getElementById('ios-instructions').style.display = 'none';
        document.getElementById('desktop-instructions').style.display = 'block';
        if (this.canInstall()) this.install();
    },

    showMobileInstructions: function() {
        if (utils.isIOS()) {
            document.getElementById('ios-instructions').style.display = 'block';
            document.getElementById('desktop-instructions').style.display = 'none';
        } else {
            document.getElementById('ios-instructions').style.display = 'none';
            document.getElementById('desktop-instructions').style.display = 'none';
            if (this.canInstall()) this.install();
            else utils.showToast('Use browser menu: "Add to Home Screen"');
        }
    }
};