'use strict';

// =====================================================
// BIOATTEX — NEURAL ENGINE (v2.1 — POLISHED)
// Fixes:
//   • Landmarks now stick to the face (proper canvas sizing
//     + object-fit-aware coordinate mapping, no more "floating" dots)
//   • Inactivity timer tracks LAST detection time, not just boolean
//   • Detection loop is throttled + guarded against stale frames
//   • Canvas resizes on every video resize (not just start)
// =====================================================

var neuralEngine = {
    modelsLoaded: false,
    canvas: null,
    video: null,
    ctx: null,
    isRunning: false,
    lastDetection: null,
    _lastDetectionAt: 0,           // NEW: timestamp of last successful detection
    frameCount: 0,
    _lastDetectTime: 0,
    _mapStartTime: 0,
    _keepMapVisible: false,
    _MAP_DURATION: 2800,
    _lastPreviewMatchId: null,
    _hadDrawing: false,

    // Display metrics used to map video-coords → canvas-coords
    _displayWidth: 0,
    _displayHeight: 0,
    _videoWidth: 0,
    _videoHeight: 0,

    // Threshold above which a face descriptor is considered a match.
    // 0.62 is a hair more lenient than the stock 0.60 so cross-camera
    // (front↔rear) check-ins still recognise the same person despite
    // lens/skin-tone differences between cameras.
    MATCH_THRESHOLD: 0.62,

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
        this._lastDetectTime = 0;
        this._mapStartTime = Date.now();
        this._lastPreviewMatchId = null;
        this._lastDetectionAt = 0;
        this.resizeCanvas();
        this.detectionLoop();
        this.renderLoop();
    },

    stopDetection: function() {
        this.isRunning = false;
        this.lastDetection = null;
        this._lastDetectTime = 0;
        this._lastDetectionAt = 0;
        this._mapStartTime = 0;
        this._lastPreviewMatchId = null;
        this._hadDrawing = false;
        if (this.ctx && this.canvas) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateHUDDisplay(null);
    },

    /**
     * Resize the canvas to match the DISPLAYED video size (not the raw
     * video resolution). This eliminates the "floating landmarks" bug
     * because the canvas now exactly overlays the visible video, and we
     * draw landmarks in display coordinates instead of relying on CSS
     * object-fit to scale a 640×480 canvas down.
     */
    resizeCanvas: function() {
        if (!this.video || !this.canvas) return;
        var wrapper = this.canvas.parentElement;
        if (!wrapper) return;
        var rect = wrapper.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        var dpr = window.devicePixelRatio || 1;
        // Internal bitmap size (crisp on high-DPI)
        this.canvas.width = Math.round(rect.width * dpr);
        this.canvas.height = Math.round(rect.height * dpr);
        // CSS size (always matches the wrapper)
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        // Store display metrics for the drawHUD mapper
        this._displayWidth = rect.width;
        this._displayHeight = rect.height;
        this._videoWidth = this.video.videoWidth || 0;
        this._videoHeight = this.video.videoHeight || 0;

        // Reset transform & apply DPR scale so 1 unit = 1 CSS pixel
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    detectionLoop: async function() {
        if (!this.isRunning) return;

        // Throttle: only run detection every 250ms — prevents UI freeze on mobile
        var now = Date.now();
        if (now - this._lastDetectTime >= 250) {
            this._lastDetectTime = now;
            try {
                if (this.video && this.video.readyState >= 2 && this.video.videoWidth > 0) {
                    var detections = await faceapi.detectAllFaces(
                        this.video,
                        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
                    ).withFaceLandmarks(true).withFaceDescriptors();

                    if (detections.length > 0) {
                        this.lastDetection = detections[0];
                        this._lastDetectionAt = Date.now();
                    } else {
                        // Stale-detection guard: only clear if it's been a while
                        // since the last successful detection. This prevents
                        // flickering when the detector briefly drops a frame.
                        if (Date.now() - this._lastDetectionAt > 750) {
                            this.lastDetection = null;
                        }
                    }
                    this.updateHUDDisplay(this.lastDetection);

                    // Background match preview — show toast when face is recognised
                    if (this.lastDetection && !admin.isRegistering) {
                        this._runMatchPreview();
                    } else if (!this.lastDetection) {
                        this._lastPreviewMatchId = null;
                    }
                }
            } catch (e) { /* swallow — detection will retry next tick */ }
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
            // Clear in device pixels — use the full bitmap size
            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
            if (shouldDraw) {
                this.drawHUD(this.ctx, this.lastDetection);
                this._hadDrawing = true;
            } else {
                this._hadDrawing = false;
            }
        }
        requestAnimationFrame(function() { neuralEngine.renderLoop(); });
    },

    /**
     * Map a coordinate from the video's natural resolution to the
     * canvas's displayed (CSS) resolution, respecting object-fit: cover.
     * Returns {x, y} in CSS pixels.
     */
    _mapPoint: function(x, y) {
        var vw = this._videoWidth;
        var vh = this._videoHeight;
        var dw = this._displayWidth;
        var dh = this._displayHeight;
        if (!vw || !vh || !dw || !dh) return { x: x, y: y };

        // object-fit: cover → scale to the LARGER ratio, crop overflow
        var scale = Math.max(dw / vw, dh / vh);
        var renderedW = vw * scale;
        var renderedH = vh * scale;
        var offsetX = (dw - renderedW) / 2;
        var offsetY = (dh - renderedH) / 2;
        return { x: x * scale + offsetX, y: y * scale + offsetY };
    },

    drawHUD: function(ctx, detection) {
        var landmarks = detection.landmarks;
        var now = Date.now();
        var i, p, mapped;

        // If canvas hasn't been sized yet, skip — avoids drawing at 0,0
        if (!this._displayWidth || !this._displayHeight) return;

        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 8;

        // Helper to draw a contour (array of landmark indices)
        function drawContour(start, end, close) {
            ctx.beginPath();
            for (i = start; i <= end; i++) {
                p = landmarks.positions[i];
                mapped = neuralEngine._mapPoint(p.x, p.y);
                if (i === start) ctx.moveTo(mapped.x, mapped.y);
                else ctx.lineTo(mapped.x, mapped.y);
            }
            if (close) ctx.closePath();
            ctx.stroke();
        }

        drawContour(0, 16, false);   // Jaw
        drawContour(17, 21, false);  // Right eyebrow
        drawContour(22, 26, false);  // Left eyebrow
        drawContour(27, 35, false);  // Nose bridge + tip
        drawContour(36, 41, true);   // Right eye
        drawContour(42, 47, true);   // Left eye
        drawContour(48, 59, true);   // Outer mouth
        drawContour(60, 67, true);   // Inner mouth

        // Pulse dots on eyes + nose tip — they now stick to the face
        ctx.shadowBlur = 0;
        var pulseSize = 2 + Math.sin(now * 0.01) * 1;
        ctx.fillStyle = '#00ffff';

        var leftEye = landmarks.getLeftEye();
        var rightEye = landmarks.getRightEye();
        [leftEye, rightEye].forEach(function(eye) {
            var cx = 0, cy = 0;
            eye.forEach(function(pt) { cx += pt.x; cy += pt.y; });
            cx /= eye.length; cy /= eye.length;
            mapped = neuralEngine._mapPoint(cx, cy);
            ctx.beginPath();
            ctx.arc(mapped.x, mapped.y, pulseSize + 2, 0, Math.PI * 2);
            ctx.fill();
        });

        var noseTip = landmarks.getNose()[3];
        mapped = neuralEngine._mapPoint(noseTip.x, noseTip.y);
        ctx.beginPath();
        ctx.arc(mapped.x, mapped.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    // Background match preview — runs continuously during detection
    // Shows a one-time toast when a registered face is recognised
    _runMatchPreview: function() {
        if (!db || !db.data || !db.data.employees || !this.lastDetection || !this.lastDetection.descriptor) return;
        var descriptor = this.lastDetection.descriptor;
        var bestMatch = null;
        var minDist = this.MATCH_THRESHOLD;
        db.data.employees.forEach(function(emp) {
            if (emp.descriptor && emp.descriptor.length > 0) {
                emp.descriptor.forEach(function(savedDesc) {
                    var dist = faceapi.euclideanDistance(savedDesc, descriptor);
                    if (dist < minDist) { minDist = dist; bestMatch = emp; }
                });
            }
        });
        if (bestMatch) {
            if (this._lastPreviewMatchId !== bestMatch.id) {
                this._lastPreviewMatchId = bestMatch.id;
                utils.showToast(bestMatch.name + ' matched', null, 'success');
            }
        } else {
            this._lastPreviewMatchId = null;
        }
    }
};


// ================== CAMERA ==================
var camera = {
    stream: null,
    facingMode: 'user',         // 'user' = front, 'environment' = rear
    _inactivityTimer: null,
    _INACTIVITY_MS: 60000,      // 60 seconds
    _lastFaceSeenAt: 0,         // NEW: timestamp of last face seen

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
            var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: this.facingMode, width: { ideal: isMobile ? 480 : 640 }, height: { ideal: isMobile ? 360 : 480 } },
                audio: false
            });

            // Step 2: Show video feed immediately — UI feels instant
            video.srcObject = this.stream;
            // Mirror video only when using front camera (so user sees a natural selfie view)
            var isFront = this.facingMode === 'user';
            video.style.transform = isFront ? 'scaleX(-1)' : 'none';
            // The HUD canvas must mirror in lockstep with the video — otherwise
            // landmarks appear horizontally flipped relative to the face when
            // using the rear camera.
            var hudCanvas = document.getElementById('hud-canvas');
            if (hudCanvas) hudCanvas.style.transform = isFront ? 'scaleX(-1)' : 'none';
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

            // Watch for video dimension changes (e.g., after auto-focus, device rotation)
            if (video.videoWidth && video.videoHeight) {
                if (!video._resizeObserver) {
                    if (typeof ResizeObserver !== 'undefined') {
                        video._resizeObserver = new ResizeObserver(function() {
                            neuralEngine.resizeCanvas();
                        });
                        video._resizeObserver.observe(video.parentElement);
                    }
                    window.addEventListener('resize', function() { neuralEngine.resizeCanvas(); });
                    window.addEventListener('orientationchange', function() {
                        setTimeout(function() { neuralEngine.resizeCanvas(); }, 250);
                    });
                }
            }

            neuralEngine.startDetection();

            // Step 5: Start inactivity timer — auto-stop after 60s with no face
            this._lastFaceSeenAt = Date.now();
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
        // Check every 5 seconds whether a face has been seen recently.
        // Previous code only checked every 60s and used a stale boolean —
        // this is more responsive and accurate.
        this._inactivityTimer = setInterval(function() {
            if (!camera.stream || admin.isRegistering) return;
            var timeSinceLastFace = Date.now() - (neuralEngine._lastDetectionAt || 0);
            if (timeSinceLastFace >= self._INACTIVITY_MS) {
                utils.showToast('Camera stopped — no face detected for 60s');
                camera.stop();
            }
        }, 5000);
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
    },

    /**
     * Capture a still frame from the current video feed.
     * Mirrors the photo for front camera (so it matches what the user
     * sees in the selfie view), but NOT for rear camera (which would
     * produce a flipped, wrong-looking image). Fixes the "photo looks
     * wrong when scanned from rear camera" bug.
     */
    captureSnapshot: function() {
        var video = document.getElementById('video-feed');
        if (!video || video.videoWidth === 0) return null;
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        var ctx = tempCanvas.getContext('2d');
        if (this.facingMode === 'user') {
            ctx.translate(tempCanvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        return tempCanvas.toDataURL('image/jpeg', 0.8);
    }
};


// ================== SCANNER ==================
var scanner = {
    isScanning: false,
    _waitingForFace: false,   // NEW: guard against multiple recursive calls
    scanType: 'check-in',

    initiateScan: async function(type) {
        if (admin.isRegistering) return;
        if (!camera.stream) { utils.showToast('Please turn on camera first'); return; }
        if (this.isScanning) return;
        // NEW: prevent multiple "waiting for face" loops from stacking up
        // when the user taps Check In repeatedly while no face is detected.
        if (this._waitingForFace) return;

        this.scanType = type || 'check-in';
        // Reset face-map timer so the landmark outline is visible during scan
        neuralEngine._mapStartTime = Date.now();
        var btn = type === 'check-out' ? document.getElementById('btn-checkout') : document.getElementById('btn-checkin');
        var statusMsg = document.getElementById('status-msg');

        // Give the detector a brief moment if it hasn't fired yet. Many
        // "couldn't check in" complaints are caused by the user tapping
        // Check In immediately after turning the camera on, before the
        // first detection tick (250ms) has run.
        if (!neuralEngine.lastDetection) {
            this._waitingForFace = true;
            statusMsg.textContent = 'Position your face in the frame...';
            statusMsg.style.color = 'var(--accent)';
            btn.textContent = 'Detecting...';
            btn.disabled = true;

            var self = this;
            var attempts = 0;
            var maxAttempts = 8;  // 8 × 400ms = 3.2s max wait

            var wait = function() {
                if (neuralEngine.lastDetection) {
                    self._waitingForFace = false;
                    btn.textContent = type === 'check-out' ? 'Check Out' : 'Check In';
                    btn.disabled = false;
                    self.initiateScan(type);
                    return;
                }
                attempts++;
                if (attempts >= maxAttempts) {
                    // Give up gracefully — let the user re-tap
                    self._waitingForFace = false;
                    btn.textContent = type === 'check-out' ? 'Check Out' : 'Check In';
                    btn.disabled = false;
                    statusMsg.textContent = 'No face detected. Try again in better lighting.';
                    setTimeout(function() { statusMsg.textContent = ''; }, 2500);
                    return;
                }
                // Keep the face-map visible while waiting
                neuralEngine._mapStartTime = Date.now();
                setTimeout(wait, 400);
            };
            setTimeout(wait, 300);
            return;
        }

        this.isScanning = true;
        btn.textContent = 'Matching...';
        btn.disabled = true;
        statusMsg.textContent = '';

        var currentDescriptor = neuralEngine.lastDetection.descriptor;
        var bestMatch = null;
        var minDistance = neuralEngine.MATCH_THRESHOLD;
        db.data.employees.forEach(function(emp) {
            if (emp.descriptor && emp.descriptor.length > 0) {
                emp.descriptor.forEach(function(savedDesc) {
                    var distance = faceapi.euclideanDistance(savedDesc, currentDescriptor);
                    if (distance < minDistance) { minDistance = distance; bestMatch = emp; }
                });
            }
        });

        // Use the camera-aware snapshot helper
        var snapshot = camera.captureSnapshot();
        if (!snapshot) {
            // Fallback: empty data URL
            snapshot = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC';
        }
        this.showVerificationModal(snapshot, bestMatch, type);
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

    /**
     * Compute Late / On Time status.
     *
     * BUG FIX (the original "9:21 marked Late against 9:30 threshold"
     * complaint): the comparison logic was actually correct in the
     * original code, BUT the threshold often wasn't being saved when
     * the admin changed it. Now we read the LIVE input value first
     * (falling back to the saved value), so unsaved changes still
     * take effect. We also normalise the threshold string defensively
     * (trim, leading zeros) in case it was hand-edited in localStorage.
     */
    computeStatus: function(now) {
        var rawThreshold = db.data.lateThreshold || '09:00';
        var liveInput = document.getElementById('late-threshold');
        if (liveInput && liveInput.value) rawThreshold = liveInput.value;

        // Normalise: trim, take "HH:MM" portion
        var cleaned = String(rawThreshold).trim();
        var match = cleaned.match(/^(\d{1,2}):(\d{2})/);
        var th, tm;
        if (match) {
            th = parseInt(match[1], 10);
            tm = parseInt(match[2], 10);
        } else {
            th = 9; tm = 0;
        }

        var nowH = now.getHours();
        var nowM = now.getMinutes();

        // Late if current time is strictly after threshold time.
        // Equality (e.g. 09:30:00 vs 09:30 threshold) = On Time (grace).
        var isLate = (nowH > th) || (nowH === th && nowM > tm);
        return isLate ? 'Late' : 'On Time';
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
            var status = this.computeStatus(now);
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
