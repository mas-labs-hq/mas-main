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
    _lastDetectTime: 0,
    _mapStartTime: 0,
    _keepMapVisible: false,
    _MAP_DURATION: 2800,
    _lastPreviewMatchId: null,
    _lastPreviewMatchEmp: null,
    _hadDrawing: false,

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

    // Pre-warm the neural engine to prevent first-scan freeze
    // Runs a dummy detection during loading screen to compile WebGL shaders
    warmUp: async function() {
        if (!this.modelsLoaded) return;
        try {
            var c = document.createElement('canvas');
            c.width = 128; c.height = 128;
            var ctx = c.getContext('2d');
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, 128, 128);
            // Draw a crude face-like pattern to trigger full pipeline
            ctx.fillStyle = '#333';
            ctx.fillRect(40, 40, 12, 12);  // left eye
            ctx.fillRect(76, 40, 12, 12);  // right eye
            ctx.fillRect(48, 70, 32, 10);  // mouth
            ctx.beginPath(); ctx.arc(64, 56, 30, 0, Math.PI * 2); ctx.stroke(); // face outline
            await faceapi.detectAllFaces(c, new faceapi.TinyFaceDetectorOptions({ inputSize: 128, scoreThreshold: 0.1 })).withFaceLandmarks(true).withFaceDescriptors();
            console.log('Neural engine warmed up successfully');
        } catch (e) {
            console.log('Warm-up skipped (non-critical):', e.message);
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
        this._lastDetectTime = 0;
        this._mapStartTime = Date.now();
        this._lastPreviewMatchId = null;
        this.resizeCanvas();
        this.detectionLoop();
        this.renderLoop();
    },

    stopDetection: function() {
        this.isRunning = false;
        this.lastDetection = null;
        this._lastDetectTime = 0;
        this._mapStartTime = 0;
        this._lastPreviewMatchId = null;
        this._lastPreviewMatchEmp = null;
        this._hadDrawing = false;
        if (this.ctx && this.canvas) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateHUDDisplay(null);
    },

    resizeCanvas: function() {
        if (!this.video || !this.canvas) return;
        if (this.video.videoWidth > 0 && this.video.videoHeight > 0) {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            // Adjust scanner wrapper aspect ratio to match video — prevents landmark misalignment
            var wrapper = document.querySelector('.scanner-wrapper');
            if (wrapper) {
                wrapper.style.aspectRatio = this.video.videoWidth + '/' + this.video.videoHeight;
            }
        }
    },

    detectionLoop: async function() {
        if (!this.isRunning) return;

        // Throttle: only run detection every 250ms — prevents UI freeze on mobile
        var now = Date.now();
        if (now - this._lastDetectTime >= 250) {
            this._lastDetectTime = now;
            try {
                if (this.video && this.video.readyState === 4) {
                    var detections = await faceapi.detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })).withFaceLandmarks(true).withFaceDescriptors();
                    this.lastDetection = detections.length > 0 ? detections[0] : null;
                    this.updateHUDDisplay(this.lastDetection);
                    // Background match preview — show toast when face is recognised
                    if (this.lastDetection && !admin.isRegistering) {
                        this._runMatchPreview();
                    } else if (!this.lastDetection) {
                        this._lastPreviewMatchId = null;
                    }
                }
            } catch (e) {}
        }

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
        var elapsed = Date.now() - this._mapStartTime;
        var shouldDraw = this.lastDetection && (elapsed < this._MAP_DURATION || this._keepMapVisible);
        // Only clear and redraw when there is something to draw, or when clearing old drawings
        if (shouldDraw || this._hadDrawing) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (shouldDraw) {
                this.drawHUD(this.ctx, this.lastDetection);
                this._hadDrawing = true;
            } else {
                this._hadDrawing = false;
            }
        }
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
    },

    // Background match preview — runs continuously during detection
    // Shows a one-time toast when a registered face is recognised
    _runMatchPreview: function() {
        if (!db || !db.data || !db.data.employees || !this.lastDetection || !this.lastDetection.descriptor) return;
        var descriptor = this.lastDetection.descriptor;
        var bestMatch = null;
        var minDist = 0.6;
        db.data.employees.forEach(function(emp) {
            if (emp.descriptor && emp.descriptor.length > 0) {
                emp.descriptor.forEach(function(savedDesc) {
                    var dist = faceapi.euclideanDistance(savedDesc, descriptor);
                    if (dist < minDist) { minDist = dist; bestMatch = emp; }
                });
            }
        });
        if (bestMatch) {
            this._lastPreviewMatchEmp = bestMatch;
            if (this._lastPreviewMatchId !== bestMatch.id) {
                this._lastPreviewMatchId = bestMatch.id;
                utils.showToast(bestMatch.name + ' matched', null, 'success');
            }
        } else {
            this._lastPreviewMatchId = null;
            this._lastPreviewMatchEmp = null;
        }
    }
};


// ================== CAMERA ==================
var camera = {
    stream: null,
    facingMode: 'user',         // 'user' = front, 'environment' = rear
    _inactivityTimer: null,
    _INACTIVITY_MS: 60000,      // 60 seconds

    start: async function() {
        var video = document.getElementById('video-feed');
        var btnCam = document.getElementById('btn-cam-toggle');
        var btnCheckin = document.getElementById('btn-checkin');
        var btnCheckout = document.getElementById('btn-checkout');
        var camOffMsg = document.getElementById('cam-off-msg');
        var hudOverlay = document.getElementById('hud-overlay');
        var btnFlip = document.getElementById('btn-cam-flip');
        try {
            // Step 1: Get camera stream (respect current facing mode)
            // Use lower resolution on mobile for smoother performance
            var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: this.facingMode, width: { ideal: isMobile ? 480 : 640 }, height: { ideal: isMobile ? 360 : 480 } },
                audio: false
            });

            // Step 2: Show video feed immediately — UI feels instant
            video.srcObject = this.stream;
            // Mirror video and canvas only when using front camera
            video.style.transform = this.facingMode === 'user' ? 'scaleX(-1)' : 'none';
            var hudCanvas = document.getElementById('hud-canvas');
            if (hudCanvas) {
                hudCanvas.style.transform = this.facingMode === 'user' ? 'scaleX(-1)' : 'none';
            }
            camOffMsg.style.display = 'none';
            if (hudOverlay) hudOverlay.style.display = 'block';
            btnCam.textContent = 'Camera Active';
            btnCam.style.backgroundColor = 'var(--danger)';
            if (!admin.isRegistering) { btnCheckin.disabled = false; btnCheckout.disabled = false; }

            // Show camera flip button (hide on desktop or devices with only one camera)
            if (btnFlip) btnFlip.style.display = '';

            // Step 3: Wait for video to actually start playing
            await new Promise(function(resolve) {
                if (video.readyState >= 2) { resolve(); return; }
                video.onloadeddata = resolve;
            });
            await video.play();

            // Step 4: NOW start heavy detection — video is already visible
            neuralEngine.initElements();
            neuralEngine.resizeCanvas();
            neuralEngine.startDetection();

            // Step 5: Start inactivity timer — auto-stop after 60s with no face
            this._startInactivityTimer();

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
        var btnFlip = document.getElementById('btn-cam-flip');
        if (this.stream) { this.stream.getTracks().forEach(function(track) { track.stop(); }); this.stream = null; }
        neuralEngine.stopDetection();
        if (video) { video.pause(); video.srcObject = null; }
        // Reset scanner wrapper aspect ratio to default
        var wrapper = document.querySelector('.scanner-wrapper');
        if (wrapper) wrapper.style.aspectRatio = '';
        if (camOffMsg) camOffMsg.style.display = 'flex';
        if (hudOverlay) hudOverlay.style.display = 'none';
        if (btnCam) { btnCam.textContent = 'Turn Camera On'; btnCam.style.backgroundColor = ''; }
        if (btnCheckin) btnCheckin.disabled = true;
        if (btnCheckout) btnCheckout.disabled = true;
        if (btnFlip) btnFlip.style.display = 'none';
        this._stopInactivityTimer();
    },

    flipCamera: async function() {
        if (!this.stream) return;
        // Toggle facing mode
        this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
        // Stop current stream and restart with new facing mode
        this._stopInactivityTimer();
        if (this.stream) { this.stream.getTracks().forEach(function(track) { track.stop(); }); this.stream = null; }
        neuralEngine.stopDetection();
        utils.haptic && utils.haptic('light');
        await this.start();
        utils.showToast(this.facingMode === 'user' ? 'Front camera' : 'Rear camera');
    },

    _startInactivityTimer: function() {
        var self = this;
        this._stopInactivityTimer();
        this._inactivityTimer = setInterval(function() {
            // If no face detected for 60 seconds, auto-stop camera
            if (!neuralEngine.lastDetection && camera.stream && !admin.isRegistering) {
                utils.showToast('Camera stopped — no face detected for 60s');
                camera.stop();
            }
        }, this._INACTIVITY_MS);
    },

    _stopInactivityTimer: function() {
        if (this._inactivityTimer) {
            clearInterval(this._inactivityTimer);
            this._inactivityTimer = null;
        }
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
        // Reset face-map timer so the landmark outline is visible for 2.8s during scan
        neuralEngine._mapStartTime = Date.now();
        var btn = type === 'check-out' ? document.getElementById('btn-checkout') : document.getElementById('btn-checkin');
        var statusMsg = document.getElementById('status-msg');
        if (!neuralEngine.lastDetection) {
            statusMsg.textContent = 'Position your face in the frame...';
            statusMsg.style.color = 'var(--accent)';
            btn.textContent = 'Detecting...';
            // Keep resetting map timer while waiting for face detection
            neuralEngine._mapStartTime = Date.now();
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
        // Fallback: if no match found, try cached preview match with relaxed threshold
        // This handles cross-camera scenarios where descriptors differ slightly
        if (!bestMatch && neuralEngine._lastPreviewMatchEmp && neuralEngine._lastPreviewMatchEmp.descriptor) {
            var cachedEmp = neuralEngine._lastPreviewMatchEmp;
            var relaxedThreshold = 0.7;
            cachedEmp.descriptor.forEach(function(savedDesc) {
                var distance = faceapi.euclideanDistance(savedDesc, currentDescriptor);
                if (distance < relaxedThreshold) { bestMatch = cachedEmp; }
            });
        }
        var video = document.getElementById('video-feed');
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        var ctx = tempCanvas.getContext('2d');
        // Only mirror photo when using front camera — back camera already shows correct orientation
        if (camera.facingMode === 'user') {
            ctx.translate(tempCanvas.width, 0);
            ctx.scale(-1, 1);
        }
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
        var checkinInfo = document.getElementById('verify-checkin-info');
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

        // Show today's check-in time when checking out
        if (checkinInfo) {
            checkinInfo.textContent = '';
            checkinInfo.style.display = 'none';
            if (type === 'check-out' && matchedEmp) {
                var today = utils.formatDate(new Date());
                var todaysLogs = db.data.logs[today] || [];
                var existing = todaysLogs.find(function(l) { return l.empId === matchedEmp.id && l.type === 'check-in'; });
                if (existing) {
                    checkinInfo.textContent = 'Checked in at ' + existing.time;
                    checkinInfo.style.display = 'block';
                }
            }
        }

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
        var photoSrc = document.getElementById('verify-img').src;

        if (type === 'check-in') {
            var existingCheckIn = todaysLogs.find(function(l) { return l.empId === emp.id && l.type === 'check-in'; });
            if (existingCheckIn) { utils.showToast(emp.name + ' already checked in today!', null, 'warning'); this.cancelVerify(); return; }
            // Update employee profile photo if they don't have one yet
            if (!emp.photo && photoSrc) {
                emp.photo = photoSrc;
            }
            var thresholdParts = db.data.lateThreshold.split(':').map(Number);
            var th = thresholdParts[0]; var tm = thresholdParts[1];
            var status = (now.getHours() > th || (now.getHours() === th && now.getMinutes() >= tm)) ? 'Late' : 'On Time';
            db.addLog({ id: Date.now(), empId: emp.id, empName: emp.name, photo: photoSrc, date: dateStr, time: utils.formatTime(now), type: 'check-in', status: status, minutes: (now.getHours() * 60) + now.getMinutes() });
            this.cancelVerify();
            utils.showToast('Welcome, ' + emp.name + '! (' + status + ')', null, 'success');
            soundManager.play('success');
            utils.haptic && utils.haptic('success');
            confettiManager.trigger();
            document.querySelector('.scanner-wrapper').classList.add('success-pulse');
            setTimeout(function() { document.querySelector('.scanner-wrapper').classList.remove('success-pulse'); }, 500);
            // Hex celebration animation
            var hexShine = document.getElementById('hex-shine');
            var hexPulse = document.getElementById('hex-pulse');
            if (hexShine) { hexShine.classList.remove('active'); void hexShine.offsetWidth; hexShine.classList.add('active'); setTimeout(function() { hexShine.classList.remove('active'); }, 3000); }
            if (hexPulse) { hexPulse.style.top = '50%'; hexPulse.style.left = '50%'; hexPulse.classList.remove('active'); void hexPulse.offsetWidth; hexPulse.classList.add('active'); setTimeout(function() { hexPulse.classList.remove('active'); }, 3000); }
        } else {
            var existingCheckIn = todaysLogs.find(function(l) { return l.empId === emp.id && l.type === 'check-in'; });
            if (!existingCheckIn) { utils.showToast(emp.name + ' has not checked in today!', null, 'warning'); this.cancelVerify(); return; }
            if (existingCheckIn.checkOutTime) { utils.showToast(emp.name + ' already checked out today!', null, 'warning'); this.cancelVerify(); return; }
            // Update employee profile photo if they don't have one yet
            if (!emp.photo && photoSrc) {
                emp.photo = photoSrc;
            }

            // Update check-in record with checkout data
            existingCheckIn.checkOutTime = utils.formatTime(now);
            existingCheckIn.duration = db.calculateDuration(existingCheckIn.time, existingCheckIn.checkOutTime);
            existingCheckIn.overtime = db.isOvertime(existingCheckIn.duration);

            // Create a SEPARATE check-out log entry so it appears in records
            if (!db.data.logs[dateStr]) db.data.logs[dateStr] = [];
            db.data.logs[dateStr].push({
                id: Date.now(),
                empId: emp.id,
                empName: emp.name,
                photo: photoSrc,
                date: dateStr,
                time: utils.formatTime(now),
                type: 'check-out',
                status: 'Out',
                minutes: (now.getHours() * 60) + now.getMinutes(),
                duration: existingCheckIn.duration,
                overtime: existingCheckIn.overtime
            });

            db.save();
            this.cancelVerify();
            var durationStr = utils.formatDuration(existingCheckIn.duration);
            var overtimeStr = existingCheckIn.overtime ? ' (Overtime!)' : '';
            utils.showToast('Goodbye, ' + emp.name + '! Worked: ' + durationStr + overtimeStr, null, 'success');
            soundManager.play('success');
            utils.haptic && utils.haptic('success');
            // Hex celebration animation on checkout
            var hexShine = document.getElementById('hex-shine');
            var hexPulse = document.getElementById('hex-pulse');
            if (hexShine) { hexShine.classList.remove('active'); void hexShine.offsetWidth; hexShine.classList.add('active'); setTimeout(function() { hexShine.classList.remove('active'); }, 3000); }
            if (hexPulse) { hexPulse.style.top = '50%'; hexPulse.style.left = '50%'; hexPulse.classList.remove('active'); void hexPulse.offsetWidth; hexPulse.classList.add('active'); setTimeout(function() { hexPulse.classList.remove('active'); }, 3000); }
        }
        admin.updateStats();
        admin.renderGallery();
        chartsManager.update();
        setTimeout(function() { camera.stop(); }, 500);
    }
};