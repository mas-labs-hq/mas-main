// ================== DATABASE ==================
const db = {
    data: {
        pin: '1234',
        employees: [],
        logs: {},
        lateThreshold: '09:00',
        workEndTime: '17:00',
        overtimeThreshold: 8
    },

    init: function() {
        try {
            const stored = localStorage.getItem(DB_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.data = { ...this.data, ...parsed };
                
                if (Array.isArray(this.data.logs)) {
                    const newLogs = {};
                    this.data.logs.forEach(log => {
                        if (!newLogs[log.date]) newLogs[log.date] = [];
                        newLogs[log.date].push(log);
                    });
                    this.data.logs = newLogs;
                    this.save();
                }
                
                this.data.employees.forEach(emp => {
                    if (emp.descriptor) {
                        if (Array.isArray(emp.descriptor[0])) {
                            emp.descriptor = emp.descriptor.map(d => new Float32Array(d));
                        } else if (!(emp.descriptor[0] instanceof Float32Array)) {
                            emp.descriptor = [new Float32Array(emp.descriptor)];
                        }
                    }
                });
            }
            
            document.getElementById('late-threshold').value = this.data.lateThreshold || '09:00';
            document.getElementById('work-end-time').value = this.data.workEndTime || '17:00';
            document.getElementById('overtime-threshold').value = this.data.overtimeThreshold || 8;
        } catch (e) {
            console.error('Database init error:', e);
        }
    },

    save: function() {
        try {
            const saveData = JSON.parse(JSON.stringify(this.data, (key, value) => {
                if (value instanceof Float32Array) return Array.from(value);
                return value;
            }));
            localStorage.setItem(DB_KEY, JSON.stringify(saveData));
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
                console.error('Storage quota exceeded:', e);
                // Alert admin that storage is full
                if (typeof utils !== 'undefined' && utils.showToast) {
                    utils.showToast('Storage full! Export a backup and clear old records.', 8000, 'warning');
                } else {
                    alert('BioAtteX Storage Warning:\n\nStorage is almost full. Please export a backup and clear old attendance records to free up space.\n\nGo to Admin > Data Management > Export, then Clear All Data.');
                }
            } else {
                console.error('Database save error:', e);
            }
        }
    },

    addLog: function(log) {
        const today = log.date;
        if (!this.data.logs[today]) this.data.logs[today] = [];
        
        // Check for existing check-in and add checkout time
        const existingLog = this.data.logs[today].find(l => l.empId === log.empId && l.type === 'check-in');
        if (existingLog && log.type === 'check-out') {
            existingLog.checkOutTime = log.time;
            existingLog.duration = this.calculateDuration(existingLog.time, log.time);
            existingLog.overtime = this.isOvertime(existingLog.duration);
        } else {
            this.data.logs[today].push(log);
        }
        
        this.save();
        
        // Archive lightweight record (no photos, survives Clear All)
        if (typeof archive !== 'undefined' && archive.addRecord) {
            archive.addRecord(log);
        }
    },

    calculateDuration: function(checkIn, checkOut) {
        const [inH, inM] = checkIn.split(':').map(Number);
        const [outH, outM] = checkOut.split(':').map(Number);
        return (outH * 60 + outM) - (inH * 60 + inM);
    },

    isOvertime: function(durationMinutes) {
        const thresholdMinutes = (this.data.overtimeThreshold || 8) * 60;
        return durationMinutes > thresholdMinutes;
    },

    removeEmployee: function(id) {
        this.data.employees = this.data.employees.filter(e => e.id !== id);
        this.save();
    },
    
    clearAll: function() {
        var savedEmployees = this.data.employees;
        var savedPin = this.data.pin;
        var savedSettings = {
            lateThreshold: this.data.lateThreshold,
            workEndTime: this.data.workEndTime,
            overtimeThreshold: this.data.overtimeThreshold
        };
        this.data = {
            pin: savedPin,
            employees: savedEmployees,
            logs: {},
            lateThreshold: savedSettings.lateThreshold,
            workEndTime: savedSettings.workEndTime,
            overtimeThreshold: savedSettings.overtimeThreshold
        };
        this.save();
    },

    nuke: function() {
        this.data = {
            pin: '1234',
            employees: [],
            logs: {},
            lateThreshold: '09:00',
            workEndTime: '17:00',
            overtimeThreshold: 8
        };
        this.save();
        if (typeof archive !== 'undefined') archive.clearAll();
    }
};

// ================== ARCHIVE ==================
const archive = {
    data: [],

    init: function() {
        try {
            const stored = localStorage.getItem(ARCHIVE_KEY);
            if (stored) {
                this.data = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Archive init error:', e);
        }
    },

    save: function() {
        try {
            localStorage.setItem(ARCHIVE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.error('Archive save error:', e);
        }
    },

    addRecord: function(log) {
        this.data.push({
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
        this.save();
    },

    getMonthRecords: function(yearMonth) {
        return this.data.filter(function(r) {
            return r.date && r.date.substring(0, 7) === yearMonth;
        });
    },

    getAvailableMonths: function() {
        var months = {};
        this.data.forEach(function(r) {
            if (r.date) {
                var ym = r.date.substring(0, 7);
                months[ym] = true;
            }
        });
        return Object.keys(months).sort().reverse();
    },

    clearMonth: function(yearMonth) {
        this.data = this.data.filter(function(r) {
            return !r.date || r.date.substring(0, 7) !== yearMonth;
        });
        this.save();
    },

    clearAll: function() {
        this.data = [];
        this.save();
    }
};
