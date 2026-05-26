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
            console.error('Database save error:', e);
        }
    },

    addLog: function(log) {
        const today = log.date;
        if (!this.data.logs[today]) this.data.logs[today] = [];
        
        const existingLog = this.data.logs[today].find(l => l.empId === log.empId && l.type === 'check-in');
        if (existingLog && log.type === 'check-out') {
            existingLog.checkOutTime = log.time;
            existingLog.duration = this.calculateDuration(existingLog.time, log.time);
            existingLog.overtime = this.isOvertime(existingLog.duration);
        } else {
            this.data.logs[today].push(log);
        }
        
        this.save();
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
        this.data = { 
            pin: '1234', 
            employees: [], 
            logs: {}, 
            lateThreshold: '09:00',
            workEndTime: '17:00',
            overtimeThreshold: 8
        };
        this.save();
    }
};