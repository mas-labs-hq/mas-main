'use strict';

// ================== NEURAL ENGINE (ENHANCED SCI-FI HUD) ==================
var neuralEngine = {
    modelsLoaded: false,
    canvas: null,
    video: null,
    ctx: null,
    isRunning: false,
    lastDetection: null,
    frameCount: 0,

    loadModels: async function() {
        var MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
            await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
            this.modelsLoaded = true;
            console.log('Neural models loaded');
        } catch (e) {
            console.error('Model load failed:', e);
            throw e;
        }
    },

    initElements: function() {
        this.canvas = document.getElementById('hud-canvas');
        this.video = document.getElementById('video-feed');
        if (this.canvas) this.ctx = this.canvas.getContext('2d');
    },

    startDetection: function() {
        if (!this.modelsLoaded || !camera.stream) return;
        if (!this.canvas) this.initElements();
        if (!this.canvas) return;
        this.isRunning = true;
        this.resizeCanvas();
        this.detectionLoop();
        this.renderLoop();
    },

    stopDetection: function() {
        this.isRunning = false;
        this.lastDetection = null;
        if (this.ctx && this.canvas) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateHUDDisplay(null);
    },

    resizeCanvas: function() {
        if (!this.video || !this.canvas) return;
        if (this.video.videoWidth > 0 && this.video.videoHeight > 0) {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
        }
    },

    detectionLoop: async function() {
        if (!this.isRunning) return;
        try {
            if (this.video && this.video.readyState === 4) {
                var detections = await faceapi.detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })).withFaceLandmarks(true).withFaceDescriptors();
                this.lastDetection = detections.length > 0 ? detections[0] : null;
                this.updateHUDDisplay(this.lastDetection);
            }
        } catch (e) {}
        requestAnimationFrame(function() { neuralEngine.detectionLoop(); });
    },

    updateHUDDisplay: function(detection) {
        var statusBar = document.getElementById('hud-status-bar');
        var dataLeft = document.getElementById('hud-data-left');
        var dataRight = document.getElementById('hud-data-right');
        if (!statusBar || !dataLeft || !dataRight) return;

        function setStreamData(el, lines) {
            el.innerHTML = '';
            for (var i = 0; i < lines.length; i++) {
                var div = document.createElement('div');
                div.textContent = lines[i];
                el.appendChild(div);
            }
        }

        if (detection) {
            var confidence = Math.round(detection.detection.score * 100);
            statusBar.textContent = 'SUBJECT DETECTED';
            statusBar.style.color = 'var(--hud-primary)';
            statusBar.style.borderColor = 'var(--hud-primary)';
            setStreamData(dataLeft, ['FACE ID: ACQUIRED', 'CONFIDENCE: ' + confidence + '%', 'LANDMARKS: 68']);
            setStreamData(dataRight, ['NEURAL NET: ACTIVE', 'DESCRIPTOR: 128-D', 'STATUS: READY']);
            document.querySelectorAll('.hud-corner').forEach(function(c) { c.style.borderColor = 'var(--hud-primary)'; });
            document.querySelectorAll('.target-circle').forEach(function(c) { c.style.borderColor = 'var(--hud-secondary)'; });
        } else {
            statusBar.textContent = 'SCANNING...';
            statusBar.style.color = 'var(--hud-secondary)';
            statusBar.style.borderColor = 'var(--hud-secondary)';
            this.frameCount++;
            var scanPct = Math.round((Math.sin(this.frameCount * 0.05) * 0.5 + 0.5) * 100);
            setStreamData(dataLeft, ['FACE ID: SCANNING', 'CONFIDENCE: --', 'LANDMARKS: --']);
            setStreamData(dataRight, ['NEURAL NET: ACTIVE', 'DESCRIPTOR: --', 'STATUS: ' + scanPct + '%']);
            document.querySelectorAll('.hud-corner').forEach(function(c) { c.style.borderColor = 'var(--hud-secondary)'; });
            document.querySelectorAll('.target-circle').forEach(function(c) { c.style.borderColor = 'rgba(0, 212, 255, 0.3)'; });
        }
    },

    renderLoop: function() {
        if (!this.isRunning) return;
        if (!this.ctx || !this.canvas) { requestAnimationFrame(function() { neuralEngine.renderLoop(); }); return; }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.lastDetection) this.drawHUD(this.ctx, this.lastDetection);
        requestAnimationFrame(function() { neuralEngine.renderLoop(); });
    },

    drawHUD: function(ctx, detection) {
        var landmarks = detection.landmarks;
        var box = detection.detection.box;
        var now = Date.now();
        var i, p;
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
        ctx.lineWidth = 1;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        for (i = 0; i <= 16; i++) { p = landmarks.positions[i]; if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
        ctx.stroke();

        ctx.beginPath();
        for (i = 17; i <= 21; i++) { p = landmarks.positions[i]; if (i === 17) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
        ctx.stroke();

        ctx.beginPath();
        for (i = 22; i <= 26; i++) { p = landmarks.positions[i]; if (i === 22) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
        ctx.stroke();

        ctx.beginPath();
        for (i = 27; i <= 35; i++) { p = landmarks.positions[i]; if (i === 27) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
        ctx.stroke();

        ctx.beginPath();
        for (i = 36; i <= 41; i++) { p = landmarks.positions[i]; if (i === 36) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
        ctx.closePath(); ctx.stroke();

        ctx.beginPath();
        for (i = 42; i <= 47; i++) { p = landmarks.positions[i]; if (i === 42) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
        ctx.closePath(); ctx.stroke();

        ctx.beginPath();
        for (i = 48; i <= 59; i++) { p = landmarks.positions[i]; if (i === 48) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
        ctx.closePath(); ctx.stroke();

        ctx.beginPath();
        for (i = 60; i <= 67; i++) { p = landmarks.positions[i]; if (i === 60) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
        ctx.closePath(); ctx.stroke();

        ctx.shadowBlur = 0;
        var pulseSize = 2 + Math.sin(now * 0.01) * 1;
        ctx.fillStyle = '#00ffff';
        var leftEyeCenter = landmarks.getLeftEye();
        var rightEyeCenter = landmarks.getRightEye();
        [leftEyeCenter, rightEyeCenter].forEach(function(eye) {
            var centerX = eye.reduce(function(sum, pt) { return sum + pt.x; }, 0) / eye.length;
            var centerY = eye.reduce(function(sum, pt) { return sum + pt.y; }, 0) / eye.length;
            ctx.beginPath(); ctx.arc(centerX, centerY, pulseSize + 2, 0, Math.PI * 2); ctx.fill();
        });
        var noseTip = landmarks.getNose()[3];
        ctx.beginPath(); ctx.arc(noseTip.x, noseTip.y, pulseSize, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
};


// ================== CAMERA ==================
var camera = {
    stream: null,

    start: async function() {
        var video = document.getElementById('video-feed');
        var btnCam = document.getElementById('btn-cam-toggle');
        var btnCheckin = document.getElementById('btn-checkin');
        var btnCheckout = document.getElementById('btn-checkout');
        var camOffMsg = document.getElementById('cam-off-msg');
        var hudOverlay = document.getElementById('hud-overlay');
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false
            });
            video.srcObject = this.stream;
            await video.play();
            neuralEngine.initElements();
            neuralEngine.resizeCanvas();
            neuralEngine.startDetection();
            camOffMsg.style.display = 'none';
            if (hudOverlay) hudOverlay.style.display = 'block';
            btnCam.textContent = 'Camera Active';
            btnCam.style.backgroundColor = 'var(--danger)';
            if (!admin.isRegistering) { btnCheckin.disabled = false; btnCheckout.disabled = false; }
            soundManager.play('click');
        } catch (e) {
            console.error('Camera error:', e);
            utils.showToast('Camera access denied');
            this.stop();
        }
    },

    stop: function() {
        var video = document.getElementById('video-feed');
        var btnCam = document.getElementById('btn-cam-toggle');
        var btnCheckin = document.getElementById('btn-checkin');
        var btnCheckout = document.getElementById('btn-checkout');
        var camOffMsg = document.getElementById('cam-off-msg');
        var hudOverlay = document.getElementById('hud-overlay');
        if (this.stream) { this.stream.getTracks().forEach(function(track) { track.stop(); }); this.stream = null; }
        neuralEngine.stopDetection();
        if (video) { video.pause(); video.srcObject = null; }
        if (camOffMsg) camOffMsg.style.display = 'flex';
        if (hudOverlay) hudOverlay.style.display = 'none';
        if (btnCam) { btnCam.textContent = 'Turn Camera On'; btnCam.style.backgroundColor = ''; }
        if (btnCheckin) btnCheckin.disabled = true;
        if (btnCheckout) btnCheckout.disabled = true;
    },

    toggle: function() {
        if (this.stream) this.stop();
        else this.start();
    }
};


// ================== SCANNER ==================
var scanner = {
    isScanning: false,
    scanType: 'check-in',

    initiateScan: async function(type) {
        if (admin.isRegistering) return;
        if (!camera.stream) { utils.showToast('Please turn on camera first'); return; }
        if (this.isScanning) return;
        this.scanType = type || 'check-in';
        var btn = type === 'check-out' ? document.getElementById('btn-checkout') : document.getElementById('btn-checkin');
        var statusMsg = document.getElementById('status-msg');
        if (!neuralEngine.lastDetection) {
            statusMsg.textContent = 'Position your face in the frame...';
            statusMsg.style.color = 'var(--accent)';
            btn.textContent = 'Detecting...';
            setTimeout(function() { btn.textContent = type === 'check-out' ? 'Check Out' : 'Check In'; scanner.initiateScan(type); }, 1500);
            return;
        }
        this.isScanning = true;
        btn.textContent = 'Matching...';
        btn.disabled = true;
        statusMsg.textContent = '';
        var currentDescriptor = neuralEngine.lastDetection.descriptor;
        var bestMatch = null;
        var minDistance = 0.6;
        db.data.employees.forEach(function(emp) {
            if (emp.descriptor && emp.descriptor.length > 0) {
                emp.descriptor.forEach(function(savedDesc) {
                    var distance = faceapi.euclideanDistance(savedDesc, currentDescriptor);
                    if (distance < minDistance) { minDistance = distance; bestMatch = emp; }
                });
            }
        });
        var video = document.getElementById('video-feed');
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        var ctx = tempCanvas.getContext('2d');
        ctx.translate(tempCanvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        this.showVerificationModal(tempCanvas.toDataURL('image/jpeg', 0.8), bestMatch, type);
        this.isScanning = false;
        btn.textContent = type === 'check-out' ? 'Check Out' : 'Check In';
        btn.disabled = false;
    },

    showVerificationModal: function(imgData, matchedEmp, type) {
        var modal = document.getElementById('modal-verify');
        var img = document.getElementById('verify-img');
        var select = document.getElementById('verify-select');
        var confirmBtn = document.getElementById('btn-confirm-identity');
        img.src = imgData;
        select.innerHTML = '';
        var defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = '-- Select Employee --';
        select.appendChild(defaultOpt);
        db.data.employees.forEach(function(emp) {
            var opt = document.createElement('option');
            opt.value = emp.id;
            opt.textContent = emp.name + ' (' + emp.id + ')';
            if (matchedEmp && emp.id === matchedEmp.id) { opt.selected = true; opt.textContent += ' Matched'; }
            select.appendChild(opt);
        });
        confirmBtn.textContent = type === 'check-out' ? 'Check Out' : 'Check In';
        confirmBtn.dataset.type = type;
        if (matchedEmp) utils.showToast('Match: ' + matchedEmp.name);
        else utils.showToast('No match - select manually');
        modal.style.display = 'flex';
    },

    cancelVerify: function() {
        document.getElementById('modal-verify').style.display = 'none';
    },

    confirmIdentity: function() {
        var select = document.getElementById('verify-select');
        var confirmBtn = document.getElementById('btn-confirm-identity');
        var type = confirmBtn.dataset.type || 'check-in';
        if (!select.value) { utils.showToast('Please select an employee'); return; }
        var emp = db.data.employees.find(function(e) { return e.id === select.value; });
        if (!emp) { utils.showToast('Employee not found'); return; }
        var now = new Date();
        var dateStr = utils.formatDate(now);
        var todaysLogs = db.data.logs[dateStr] || [];
        if (type === 'check-in') {
            var existingCheckIn = todaysLogs.find(function(l) { return l.empId === emp.id && l.type === 'check-in'; });
            if (existingCheckIn) { utils.showToast(emp.name + ' already checked in today!', null, 'warning'); this.cancelVerify(); return; }
            var thresholdParts = db.data.lateThreshold.split(':').map(Number);
            var th = thresholdParts[0]; var tm = thresholdParts[1];
            var status = (now.getHours() > th || (now.getHours() === th && now.getMinutes() >= tm)) ? 'Late' : 'On Time';
            db.addLog({ id: Date.now(), empId: emp.id, empName: emp.name, photo: document.getElementById('verify-img').src, date: dateStr, time: utils.formatTime(now), type: 'check-in', status: status, minutes: (now.getHours() * 60) + now.getMinutes() });
            this.cancelVerify();
            utils.showToast('Welcome, ' + emp.name + '! (' + status + ')', null, 'success');
            soundManager.play('success');
            confettiManager.trigger();
            document.querySelector('.scanner-wrapper').classList.add('success-pulse');
            setTimeout(function() { document.querySelector('.scanner-wrapper').classList.remove('success-pulse'); }, 500);
        } else {
            var existingCheckIn = todaysLogs.find(function(l) { return l.empId === emp.id && l.type === 'check-in'; });
            if (!existingCheckIn) { utils.showToast(emp.name + ' has not checked in today!', null, 'warning'); this.cancelVerify(); return; }
            if (existingCheckIn.checkOutTime) { utils.showToast(emp.name + ' already checked out today!', null, 'warning'); this.cancelVerify(); return; }
            existingCheckIn.checkOutTime = utils.formatTime(now);
            existingCheckIn.duration = db.calculateDuration(existingCheckIn.time, existingCheckIn.checkOutTime);
            existingCheckIn.overtime = db.isOvertime(existingCheckIn.duration);
            db.save();
            this.cancelVerify();
            var durationStr = utils.formatDuration(existingCheckIn.duration);
            var overtimeStr = existingCheckIn.overtime ? ' (Overtime!)' : '';
            utils.showToast('Goodbye, ' + emp.name + '! Worked: ' + durationStr + overtimeStr, null, 'success');
            soundManager.play('success');
        }
        admin.updateStats();
        chartsManager.update();
        setTimeout(function() { camera.stop(); }, 500);
    }
};