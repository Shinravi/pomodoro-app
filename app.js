/* ========================================
   Brainscape Study Timer
   ======================================== */

// ---- Audio Context & Sound Engine ----
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.activeSources = [];
        this.activeSound = null;
        this.volume = 0.5;
        this.isPlaying = false;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.ctx.destination);
    }

    setVolume(val) {
        this.volume = val;
        if (this.masterGain) this.masterGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.05);
    }

    stopAll() {
        this.activeSources.forEach(src => { try { src.stop(); } catch(e){} });
        this.activeSources = [];
        this.isPlaying = false;
        this.activeSound = null;
    }

    createNoiseBuffer(type = 'white', duration = 4) {
        const sr = this.ctx.sampleRate;
        const buf = this.ctx.createBuffer(2, sr * duration, sr);
        for (let ch = 0; ch < 2; ch++) {
            const d = buf.getChannelData(ch);
            let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
            for (let i = 0; i < d.length; i++) {
                const w = Math.random() * 2 - 1;
                if (type === 'white') { d[i] = w * 0.3; }
                else if (type === 'pink') {
                    b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
                    b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
                    b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
                    d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.06; b6=w*0.115926;
                } else if (type === 'brown') { b0=(b0+(0.02*w))/1.02; d[i]=b0*3.5; }
            }
        }
        return buf;
    }

    _src(buf, loop=true) {
        const s = this.ctx.createBufferSource();
        s.buffer = buf; s.loop = loop;
        this.activeSources.push(s);
        return s;
    }

    playLofi() {
        this.init(); this.stopAll(); this.activeSound='lofi'; this.isPlaying=true;
        const n=this._src(this.createNoiseBuffer('pink',4));
        const f=this.ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=400;
        n.connect(f); f.connect(this.masterGain); n.start();
        const bass=this.ctx.createOscillator(); const bg=this.ctx.createGain();
        bass.type='sine'; bass.frequency.value=55; bg.gain.value=0.12;
        bass.connect(bg); bg.connect(this.masterGain); bass.start(); this.activeSources.push(bass);
        [261.63,329.63,392.00].forEach(freq=>{
            const o=this.ctx.createOscillator(),og=this.ctx.createGain(),of=this.ctx.createBiquadFilter();
            o.type='sine'; o.frequency.value=freq; og.gain.value=0.03;
            of.type='lowpass'; of.frequency.value=800;
            o.connect(of); of.connect(og); og.connect(this.masterGain); o.start(); this.activeSources.push(o);
        });
    }

    playRain() {
        this.init(); this.stopAll(); this.activeSound='rain'; this.isPlaying=true;
        const n=this._src(this.createNoiseBuffer('white',4));
        const hi=this.ctx.createBiquadFilter(); hi.type='highpass'; hi.frequency.value=1000;
        const lo=this.ctx.createBiquadFilter(); lo.type='lowpass'; lo.frequency.value=8000;
        const g=this.ctx.createGain(); g.gain.value=0.5;
        n.connect(hi); hi.connect(lo); lo.connect(g); g.connect(this.masterGain); n.start();
        const r=this._src(this.createNoiseBuffer('brown',4));
        const rf=this.ctx.createBiquadFilter(); rf.type='lowpass'; rf.frequency.value=200;
        const rg=this.ctx.createGain(); rg.gain.value=0.3;
        r.connect(rf); rf.connect(rg); rg.connect(this.masterGain); r.start();
    }

    playBinaural() {
        this.init(); this.stopAll(); this.activeSound='binaural'; this.isPlaying=true;
        const oL=this.ctx.createOscillator(),oR=this.ctx.createOscillator();
        const gL=this.ctx.createGain(),gR=this.ctx.createGain();
        const m=this.ctx.createChannelMerger(2);
        oL.type=oR.type='sine'; oL.frequency.value=200; oR.frequency.value=210;
        gL.gain.value=gR.gain.value=0.4;
        oL.connect(gL); oR.connect(gR); gL.connect(m,0,0); gR.connect(m,0,1);
        m.connect(this.masterGain); oL.start(); oR.start();
        this.activeSources.push(oL,oR);
        const pad=this.ctx.createOscillator(),pg=this.ctx.createGain(),pf=this.ctx.createBiquadFilter();
        pad.type='sine'; pad.frequency.value=100; pg.gain.value=0.06; pf.type='lowpass'; pf.frequency.value=300;
        pad.connect(pf); pf.connect(pg); pg.connect(this.masterGain); pad.start(); this.activeSources.push(pad);
    }

    playCafe() {
        this.init(); this.stopAll(); this.activeSound='cafe'; this.isPlaying=true;
        const n=this._src(this.createNoiseBuffer('pink',4));
        const bp=this.ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=1500; bp.Q.value=0.5;
        const g=this.ctx.createGain(); g.gain.value=0.25;
        n.connect(bp); bp.connect(g); g.connect(this.masterGain); n.start();
        const h=this.ctx.createOscillator(),hg=this.ctx.createGain(),hf=this.ctx.createBiquadFilter();
        h.type='sawtooth'; h.frequency.value=60; hg.gain.value=0.02; hf.type='lowpass'; hf.frequency.value=120;
        h.connect(hf); hf.connect(hg); hg.connect(this.masterGain); h.start(); this.activeSources.push(h);
    }

    playOcean() {
        this.init(); this.stopAll(); this.activeSound='ocean'; this.isPlaying=true;
        const n=this._src(this.createNoiseBuffer('brown',4));
        const lp=this.ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=500;
        const lfo=this.ctx.createOscillator(),lfog=this.ctx.createGain();
        lfo.type='sine'; lfo.frequency.value=0.1; lfog.gain.value=200;
        lfo.connect(lfog); lfog.connect(lp.frequency); lfo.start(); this.activeSources.push(lfo);
        const og=this.ctx.createGain(); og.gain.value=0.7;
        n.connect(lp); lp.connect(og); og.connect(this.masterGain); n.start();
        const h=this._src(this.createNoiseBuffer('white',4));
        const hf=this.ctx.createBiquadFilter(); hf.type='highpass'; hf.frequency.value=3000;
        const hg=this.ctx.createGain(); hg.gain.value=0.08;
        const l2=this.ctx.createOscillator(),l2g=this.ctx.createGain();
        l2.type='sine'; l2.frequency.value=0.08; l2g.gain.value=0.06;
        l2.connect(l2g); l2g.connect(hg.gain); l2.start(); this.activeSources.push(l2);
        h.connect(hf); hf.connect(hg); hg.connect(this.masterGain); h.start();
    }

    playNoise(type) {
        this.init(); this.stopAll(); this.activeSound=type; this.isPlaying=true;
        const s=this._src(this.createNoiseBuffer(type));
        s.connect(this.masterGain); s.start();
    }

    playTone(freq, dur, type='sine') {
        this.init();
        const o=this.ctx.createOscillator(), g=this.ctx.createGain();
        o.type=type; o.frequency.value=freq;
        g.gain.setValueAtTime(0.3,this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+dur);
        o.connect(g); g.connect(this.ctx.destination);
        o.start(); o.stop(this.ctx.currentTime+dur);
    }

    playSessionComplete() { this.init(); [523.25,659.25,783.99].forEach((f,i)=>setTimeout(()=>this.playTone(f,0.6),i*200)); }
    playWarning()  { this.init(); this.playTone(440,0.15); setTimeout(()=>this.playTone(440,0.15),200); }
    playTick()     { this.init(); this.playTone(800,0.02); }
    playStart()    { this.init(); this.playTone(600,0.08,'sine'); }
    playClick()    { this.init(); this.playTone(900,0.04,'sine'); }
    playPause()    { this.init(); this.playTone(400,0.1,'sine'); }

    play(id) {
        const map = { lofi:()=>this.playLofi(), rain:()=>this.playRain(),
            binaural:()=>this.playBinaural(), cafe:()=>this.playCafe(), ocean:()=>this.playOcean(),
            'white-noise':()=>this.playNoise('white'), 'brown-noise':()=>this.playNoise('brown'),
            'pink-noise':()=>this.playNoise('pink'), silence:()=>this.stopAll() };
        (map[id] || (()=>this.stopAll()))();
    }

    toggle(id) {
        if (this.activeSound===id && this.isPlaying) { this.stopAll(); return false; }
        this.play(id); return true;
    }
}


// ---- Study Timer ----
class StudyTimer {
    constructor() {
        this.settings = this.loadSettings();
        this.streakData = this.loadStreakData();
        this.tasks = this.loadTasks();
        this.activeTaskId = null;

        this.mode = 'pomodoro'; // pomodoro | short-break | long-break
        this.status = 'idle';   // idle | running | paused
        this.pomodoroCount = 0; // completed pomodoro sessions
        this.timeRemaining = this.settings.pomodoro * 60;
        this.totalTime     = this.settings.pomodoro * 60;
        this.interval = null;
        this.warningPlayed = false;

        this.sound = new SoundEngine();

        this.dom = {
            time:           document.getElementById('timer-time'),
            label:          document.getElementById('timer-label'),
            progress:       document.getElementById('timer-progress'),
            btnStart:       document.getElementById('btn-start'),
            btnReset:       document.getElementById('btn-reset'),
            modeTabs:       document.querySelectorAll('.mode-tab'),
            sessionCount:   document.getElementById('session-count'),
            sessionStatus:  document.getElementById('session-status'),
            streakStats:    document.getElementById('streak-stats'),
            soundscapeGrid: document.getElementById('soundscape-grid'),
            volumeControl:  document.getElementById('volume-control'),
            volumeSlider:   document.getElementById('volume-slider'),
            taskInput:      document.getElementById('task-input'),
            btnAddTask:     document.getElementById('btn-add-task'),
            taskList:       document.getElementById('task-list'),
            taskFooter:     document.getElementById('task-footer'),
            btnClearFinished: document.getElementById('btn-clear-finished'),
            btnClearAll:    document.getElementById('btn-clear-all'),
            shareModal:     document.getElementById('share-modal'),
            shareCardPreview: document.getElementById('share-card-preview'),
            btnDownload:    document.getElementById('btn-download'),
            btnCopyLink:    document.getElementById('btn-copy-link'),
            shareClose:     document.getElementById('share-close'),
            settingsModal:  document.getElementById('settings-modal'),
            btnSettings:    document.getElementById('btn-settings'),
            btnSettingsClose: document.getElementById('settings-modal-close'),
            btnSettingsDone:  document.getElementById('btn-settings-done'),
            confettiContainer: document.getElementById('confetti-container'),
            floatingTip:    document.getElementById('floating-tip'),
            floatingTipTitle: document.getElementById('floating-tip-title'),
            floatingTipText:  document.getElementById('floating-tip-text'),
            floatingTipClose: document.getElementById('floating-tip-close'),
            bsTagline:      document.getElementById('bs-cta-tagline'),
            bsCtaBtn:       document.getElementById('bs-cta-btn'),
        };

        this.circumference = 2 * Math.PI * 145;
        this.dom.progress.style.strokeDasharray = this.circumference;

        this.init();
    }

    // ---- Settings ----
    loadSettings() {
        const defaults = { pomodoro:25, shortBreak:5, longBreak:15, longBreakInterval:4,
            autoStartBreaks:false, autoStartPomodoros:false };
        try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem('bs-settings') || '{}')); }
        catch(e) { return defaults; }
    }

    saveSettings() {
        localStorage.setItem('bs-settings', JSON.stringify(this.settings));
    }

    getDuration(mode) {
        return { pomodoro: this.settings.pomodoro,
            'short-break': this.settings.shortBreak,
            'long-break': this.settings.longBreak }[mode] || this.settings.pomodoro;
    }

    // ---- Streak ----
    loadStreakData() {
        const defaults = { days:0, totalSessions:0, totalMinutes:0, lastDate:null };
        try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem('bs-streak') || '{}')); }
        catch(e) { return defaults; }
    }

    saveStreakData() {
        localStorage.setItem('bs-streak', JSON.stringify(this.streakData));
    }

    recordSession(minutes) {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now()-86400000).toDateString();
        const last = this.streakData.lastDate;
        if (last !== today) {
            this.streakData.days = (last===yesterday) ? this.streakData.days+1 : 1;
            this.streakData.lastDate = today;
        }
        this.streakData.totalSessions++;
        this.streakData.totalMinutes += minutes;
        this.saveStreakData();
    }

    // ---- Tasks ----
    loadTasks() {
        try { return JSON.parse(localStorage.getItem('bs-tasks') || '[]'); }
        catch(e) { return []; }
    }

    saveTasks() {
        localStorage.setItem('bs-tasks', JSON.stringify(this.tasks));
    }

    addTask(text) {
        text = text.trim();
        if (!text) return;
        const task = { id: Date.now().toString(), text, done: false, pomodoroCount: 0 };
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
    }

    toggleDone(id) {
        const t = this.tasks.find(t=>t.id===id);
        if (t) { t.done = !t.done; this.saveTasks(); this.renderTasks(); }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t=>t.id!==id);
        if (this.activeTaskId===id) this.activeTaskId=null;
        this.saveTasks();
        this.renderTasks();
    }

    setActiveTask(id) {
        this.activeTaskId = (this.activeTaskId===id) ? null : id;
        this.renderTasks();
    }

    incrementTaskPomodoro(id) {
        const t = this.tasks.find(t=>t.id===id);
        if (t) { t.pomodoroCount++; this.saveTasks(); this.renderTasks(); }
    }

    clearFinished() {
        this.tasks = this.tasks.filter(t=>!t.done);
        this.saveTasks(); this.renderTasks();
    }

    clearAll() {
        if (!confirm('Clear all tasks?')) return;
        this.tasks = []; this.activeTaskId = null;
        this.saveTasks(); this.renderTasks();
    }

    // ---- Mode Colors ----
    setModeColors(mode) {
        const root = document.documentElement;
        const colors = {
            'pomodoro':    { accent:'#29a5dc', hover:'#3faee0', soft:'rgba(41,165,220,0.12)', glow:'rgba(41,165,220,0.35)' },
            'short-break': { accent:'#00cf69', hover:'#2edc82', soft:'rgba(0,207,105,0.12)', glow:'rgba(0,207,105,0.35)' },
            'long-break':  { accent:'#6c5ce7', hover:'#7d6ff0', soft:'rgba(108,92,231,0.12)', glow:'rgba(108,92,231,0.35)' },
        };
        const c = colors[mode] || colors.pomodoro;
        root.style.setProperty('--timer-accent', c.accent);
        root.style.setProperty('--timer-accent-hover', c.hover);
        root.style.setProperty('--timer-accent-soft', c.soft);
        root.style.setProperty('--timer-accent-glow', c.glow);
    }

    // ---- Timer core ----
    setMode(mode) {
        this.mode = mode;
        this.dom.modeTabs.forEach(t=>t.classList.toggle('active', t.dataset.mode===mode));
        this.timeRemaining = this.getDuration(mode) * 60;
        this.totalTime = this.timeRemaining;
        this.warningPlayed = false;
        this.dom.time.classList.remove('warning');
        this.setModeColors(mode);
        this.updateDisplay();
        this.updateSessionInfo();
    }

    start() {
        this.sound.init();
        this.status = 'running';
        this.dom.btnStart.textContent = 'PAUSE';
        this.dom.btnStart.classList.add('is-running');
        this.dom.label.textContent = this.mode==='pomodoro' ? 'Focusing...' :
            this.mode==='short-break' ? 'Short break' : 'Long break';
        this.interval = setInterval(()=>this.tick(), 1000);
    }

    pause() {
        this.status = 'paused';
        clearInterval(this.interval);
        this.dom.btnStart.textContent = 'RESUME';
        this.dom.btnStart.classList.remove('is-running');
        this.dom.label.textContent = 'Paused';
    }

    resume() {
        this.status = 'running';
        this.dom.btnStart.textContent = 'PAUSE';
        this.dom.btnStart.classList.add('is-running');
        this.dom.label.textContent = this.mode==='pomodoro' ? 'Focusing...' : 'On break';
        this.interval = setInterval(()=>this.tick(), 1000);
    }

    reset() {
        clearInterval(this.interval);
        this.status = 'idle';
        this.timeRemaining = this.getDuration(this.mode) * 60;
        this.totalTime = this.timeRemaining;
        this.warningPlayed = false;
        this.dom.btnStart.textContent = 'START';
        this.dom.btnStart.classList.remove('is-running');
        this.dom.time.classList.remove('warning');
        this.dom.label.textContent = this.idleLabel();
        this.updateDisplay();
        document.title = 'Study Timer – Free Focus Timer | Brainscape';
    }

    idleLabel() {
        return { pomodoro:'Ready to focus', 'short-break':'Time for a break', 'long-break':'Time for a long break' }[this.mode];
    }

    handleStartPause() {
        if (this.status==='idle')    { this.start();  this.sound.playStart();  this.track('timer_started',{mode:this.mode,minutes:this.getDuration(this.mode)}); }
        else if (this.status==='running') { this.pause();  this.sound.playPause();  }
        else if (this.status==='paused')  { this.resume(); this.sound.playStart(); }
    }

    tick() {
        this.timeRemaining--;
        if (this.timeRemaining<=0) {
            this.timeRemaining=0; this.updateDisplay();
            clearInterval(this.interval); this.status='idle';
            this.sessionComplete(); return;
        }
        if (this.timeRemaining===60 && !this.warningPlayed) {
            this.warningPlayed=true; this.sound.playWarning();
            this.dom.time.classList.add('warning');
        }
        if (this.timeRemaining<=10) this.sound.playTick();
        this.updateDisplay();
    }

    sessionComplete() {
        this.sound.playSessionComplete();
        this.dom.time.classList.remove('warning');
        this.dom.btnStart.textContent = 'START';
        this.dom.btnStart.classList.remove('is-running');
        document.title = '✅ Done! | Brainscape Study Timer';

        const wasPomodoro = (this.mode === 'pomodoro');

        if (wasPomodoro) {
            this.pomodoroCount++;
            this.recordSession(this.settings.pomodoro);
            if (this.activeTaskId) this.incrementTaskPomodoro(this.activeTaskId);
            this.renderStreakStats();
            this.updateSessionInfo();
            this.spawnConfetti();

            this.track('timer_completed', {
                mode: 'pomodoro',
                session_number: this.pomodoroCount,
                streak_days: this.streakData.days,
            });

            this.showShareModal();

            const isLong = (this.pomodoroCount % this.settings.longBreakInterval === 0);
            const next = isLong ? 'long-break' : 'short-break';

            setTimeout(() => {
                this.setMode(next);
                if (this.settings.autoStartBreaks) setTimeout(()=>this.start(), 100);
            }, 500);

        } else {
            setTimeout(() => {
                this.setMode('pomodoro');
                if (this.settings.autoStartPomodoros) setTimeout(()=>this.start(), 100);
            }, 500);
        }

        if (Notification.permission==='granted') {
            new Notification(wasPomodoro ? 'Session complete! ✅' : 'Break over!', {
                body: wasPomodoro
                    ? `${this.settings.pomodoro} min done. 🔥 ${this.streakData.days}-day streak!`
                    : 'Time to focus again.',
            });
        }
    }

    updateDisplay() {
        const m = Math.floor(this.timeRemaining/60);
        const s = this.timeRemaining%60;
        const str = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        this.dom.time.textContent = str;
        this.dom.progress.style.strokeDashoffset = this.circumference * (1 - this.timeRemaining/this.totalTime);
        if (this.status==='running') {
            document.title = `${str} – ${this.mode==='pomodoro'?'Focus':'Break'} | Brainscape`;
        }
    }

    updateSessionInfo() {
        this.dom.sessionCount.textContent = `#${this.pomodoroCount+1}`;
        const labels = { pomodoro:'Time to focus!', 'short-break':'Time for a break!', 'long-break':'Time for a long break!' };
        this.dom.sessionStatus.textContent = labels[this.mode];
    }

    // ---- Streak Stats ----
    renderStreakStats() {
        const d = this.streakData;
        this.dom.streakStats.innerHTML = `
            <div class="streak-stat${d.days>0?' has-streak':''}">
                <span class="streak-stat-value">${d.days>0?'🔥':'○'} ${d.days}</span>
                <span class="streak-stat-label">day streak</span>
            </div>
            <div class="streak-stat-divider"></div>
            <div class="streak-stat">
                <span class="streak-stat-value">${d.totalSessions}</span>
                <span class="streak-stat-label">sessions</span>
            </div>
            <div class="streak-stat-divider"></div>
            <div class="streak-stat">
                <span class="streak-stat-value">${d.totalMinutes}</span>
                <span class="streak-stat-label">minutes</span>
            </div>
        `;
    }

    // ---- Tasks ----
    renderTasks() {
        if (this.tasks.length===0) {
            this.dom.taskList.innerHTML = '<p class="task-empty">No tasks yet — add one above</p>';
            this.dom.taskFooter.style.display = 'none';
            return;
        }
        this.dom.taskList.innerHTML = this.tasks.map(t=>`
            <div class="task-item ${t.done?'is-done':''} ${t.id===this.activeTaskId?'is-active':''}" data-id="${t.id}">
                <button class="task-active-btn" data-action="active" title="Set as active session task">
                    <span class="task-active-dot"></span>
                </button>
                <span class="task-text">${this.escHtml(t.text)}</span>
                ${t.pomodoroCount>0?`<span class="task-pomodoro-count" title="${t.pomodoroCount} pomodoro(s)">🍅×${t.pomodoroCount}</span>`:''}
                <button class="task-done-btn" data-action="done" title="${t.done?'Mark undone':'Mark done'}">
                    ${t.done
                        ? `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`
                        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/></svg>`
                    }
                </button>
                <button class="task-delete-btn" data-action="delete" title="Delete task">✕</button>
            </div>
        `).join('');
        const hasDone = this.tasks.some(t=>t.done);
        this.dom.taskFooter.style.display = (this.tasks.length>0) ? 'flex' : 'none';
        this.dom.btnClearFinished.style.display = hasDone ? 'inline-flex' : 'none';
    }

    escHtml(str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ---- Soundscapes ----
    renderSoundscapes() {
        const list = [
            {id:'lofi',name:'Lo-Fi',emoji:'🎵'}, {id:'rain',name:'Rain',emoji:'🌧️'},
            {id:'white-noise',name:'White Noise',emoji:'📻'}, {id:'brown-noise',name:'Brown Noise',emoji:'🟤'},
            {id:'binaural',name:'Binaural',emoji:'🧠'}, {id:'cafe',name:'Cafe',emoji:'☕'},
            {id:'ocean',name:'Ocean',emoji:'🌊'}, {id:'pink-noise',name:'Pink Noise',emoji:'🩷'},
            {id:'silence',name:'Silence',emoji:'🔇'},
        ];
        this.dom.soundscapeGrid.innerHTML = list.map(s=>`
            <div class="soundscape-card" data-sound="${s.id}">
                <span class="soundscape-emoji">${s.emoji}</span>
                <span class="soundscape-name">${s.name}</span>
            </div>
        `).join('');
        this.dom.soundscapeGrid.querySelectorAll('.soundscape-card').forEach(card=>{
            card.addEventListener('click',()=>{
                const playing = this.sound.toggle(card.dataset.sound);
                this.dom.soundscapeGrid.querySelectorAll('.soundscape-card').forEach(c=>c.classList.remove('active'));
                if (playing) { card.classList.add('active'); this.dom.volumeControl.classList.add('visible'); }
                else this.dom.volumeControl.classList.remove('visible');
            });
        });
    }

    // ---- Settings panel ----
    openSettings() {
        const s = this.settings;
        document.getElementById('setting-pomodoro').textContent = s.pomodoro;
        document.getElementById('setting-shortBreak').textContent = s.shortBreak;
        document.getElementById('setting-longBreak').textContent = s.longBreak;
        document.getElementById('setting-longBreakInterval').textContent = s.longBreakInterval;
        document.getElementById('toggle-autobreaks').checked = s.autoStartBreaks;
        document.getElementById('toggle-autopomodoros').checked = s.autoStartPomodoros;
        this.dom.settingsModal.classList.add('open');
    }

    closeSettings() {
        this.dom.settingsModal.classList.remove('open');
        if (this.status==='idle') {
            this.timeRemaining = this.getDuration(this.mode)*60;
            this.totalTime = this.timeRemaining;
            this.updateDisplay();
        }
    }

    adjustSetting(target, dir) {
        const limits = {
            pomodoro:          { min:1, max:90, step:5 },
            shortBreak:        { min:1, max:30, step:1 },
            longBreak:         { min:1, max:60, step:5 },
            longBreakInterval: { min:1, max:10, step:1 },
        };
        const cfg = limits[target]; if (!cfg) return;
        let val = this.settings[target] + dir * cfg.step;
        val = Math.max(cfg.min, Math.min(cfg.max, val));
        this.settings[target] = val;
        document.getElementById(`setting-${target}`).textContent = val;
        this.saveSettings();
    }

    // ---- Share Modal ----
    showShareModal() {
        const canvas = this.buildShareCard();
        this._shareCanvas = canvas;
        this.dom.shareCardPreview.innerHTML = '';
        this.dom.shareCardPreview.appendChild(canvas);
        this.dom.shareModal.classList.add('open');
    }

    buildShareCard() {
        const DPR=2, W=560, H=300;
        const canvas=document.createElement('canvas');
        canvas.width=W*DPR; canvas.height=H*DPR;
        canvas.style.cssText='width:100%;border-radius:10px;display:block;';
        const ctx=canvas.getContext('2d'); ctx.scale(DPR,DPR);
        const d=this.streakData;

        // Background
        ctx.fillStyle='#1a2130'; ctx.fillRect(0,0,W,H);
        // Dot grid
        ctx.fillStyle='rgba(255,255,255,0.04)';
        for(let x=20;x<W;x+=28) for(let y=20;y<H;y+=28) { ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2); ctx.fill(); }
        // Top bar
        const bar=ctx.createLinearGradient(0,0,W,0); bar.addColorStop(0,'#29a5dc'); bar.addColorStop(1,'#1a7ab8');
        ctx.fillStyle=bar; ctx.fillRect(0,0,W,4);
        // Glow
        const cx=W/2,cy=108;
        const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,58);
        glow.addColorStop(0,'rgba(41,165,220,0.22)'); glow.addColorStop(1,'rgba(41,165,220,0)');
        ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(cx,cy,58,0,Math.PI*2); ctx.fill();
        // Emoji
        ctx.font='50px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('✅',cx,cy);
        // Text
        ctx.fillStyle='#fff'; ctx.font='bold 30px -apple-system,sans-serif'; ctx.textBaseline='alphabetic';
        ctx.fillText(`Studied ${this.settings.pomodoro} minutes`,cx,183);
        if (d.days>0) { ctx.font='20px -apple-system,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.65)'; ctx.fillText(`🔥 ${d.days}-day streak`,cx,215); }
        // Divider
        ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(60,238); ctx.lineTo(W-60,238); ctx.stroke();
        // Brand
        ctx.font='bold 12px -apple-system,sans-serif'; ctx.fillStyle='#29a5dc';
        ctx.fillText('⏱  POWERED BY BRAINSCAPE',cx,261);
        ctx.font='11px -apple-system,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.3)';
        ctx.fillText('brainscape.com/study-timer',cx,280);
        return canvas;
    }

    downloadCard() {
        if (!this._shareCanvas) return;
        const a=document.createElement('a');
        a.download=`brainscape-study-${this.settings.pomodoro}min.png`;
        a.href=this._shareCanvas.toDataURL('image/png'); a.click();
    }

    copyLink() {
        navigator.clipboard.writeText(window.location.href).then(()=>{
            const btn=this.dom.btnCopyLink, orig=btn.textContent;
            btn.textContent='✓ Copied!'; setTimeout(()=>btn.textContent=orig,2000);
        }).catch(()=>this.showToast('Copy failed — copy from the address bar.'));
    }

    // ---- Confetti ----
    spawnConfetti() {
        const container=this.dom.confettiContainer;
        container.innerHTML='';
        const colors=['#29a5dc','#ff8a47','#00cf69','#fdcb6e','#ff7675','#a29bfe','#fd79a8'];
        for (let i=0;i<90;i++) {
            const p=document.createElement('div');
            p.className='confetti-piece';
            p.style.left=`${Math.random()*100}%`;
            p.style.background=colors[Math.floor(Math.random()*colors.length)];
            p.style.width=`${6+Math.random()*8}px`;
            p.style.height=`${10+Math.random()*14}px`;
            p.style.borderRadius=Math.random()>0.5?'50%':'2px';
            p.style.animationDuration=`${1.5+Math.random()*2.5}s`;
            p.style.animationDelay=`${Math.random()*0.6}s`;
            p.style.setProperty('--drift',`${(Math.random()-0.5)*200}px`);
            container.appendChild(p);
        }
        setTimeout(()=>container.innerHTML='',4500);
    }

    // ---- Floating Tips ----
    initFloatingTips() {
        const tips = [
            { title:'One task at a time', text:'Write down the single task you\'ll focus on before starting. Clarity eliminates decision fatigue.' },
            { title:'Respect the break', text:'Step away from screens during breaks. Your brain consolidates learning during rest.' },
            { title:'Eliminate first', text:'Phone on silent, notifications off. Remove distractions before the timer starts, not during.' },
            { title:'Track your rhythm', text:'Notice when your focus peaks and dips. Schedule demanding work during high-energy windows.' },
            { title:'Review after each session', text:'Spend 2 minutes reviewing what you just learned. Retrieval practice doubles retention.' },
        ];
        let idx = 0;
        const show = () => {
            const tip = tips[idx % tips.length];
            this.dom.floatingTipTitle.textContent = tip.title;
            this.dom.floatingTipText.textContent = tip.text;
            this.dom.floatingTip.classList.add('visible');
            idx++;
        };
        setTimeout(show, 15000);
        setInterval(show, 180000); // every 3 min
        this.dom.floatingTipClose.addEventListener('click',()=>{
            this.dom.floatingTip.classList.remove('visible');
        });
    }

    // ---- Micro-copy rotation ----
    rotateMicroCopy() {
        const lines = [
            'Learn faster with spaced repetition',
            'Turn this focus session into real memory',
            'Focused now. Remember later.',
            'Study smarter with Brainscape flashcards',
            'Make every minute of studying count',
        ];
        let i=0;
        setInterval(()=>{
            i=(i+1)%lines.length;
            const el=this.dom.bsTagline;
            el.style.opacity='0';
            setTimeout(()=>{ el.textContent=lines[i]; el.style.opacity='1'; },350);
        },6000);
    }

    // ---- GA4 ----
    track(name,params={}) {
        if (typeof gtag==='function') gtag('event',name,params);
    }

    // ---- Event bindings ----
    bindEvents() {
        this.dom.btnStart.addEventListener('click',()=>this.handleStartPause());
        this.dom.btnReset.addEventListener('click',()=>this.reset());

        this.dom.modeTabs.forEach(tab=>{
            tab.addEventListener('click',()=>{
                if (this.status==='running' && !confirm('Timer is running. Switch mode?')) return;
                this.sound.playClick();
                this.reset();
                this.setMode(tab.dataset.mode);
            });
        });

        this.dom.volumeSlider.addEventListener('input',e=>this.sound.setVolume(e.target.value/100));

        // Settings
        this.dom.btnSettings.addEventListener('click',()=>this.openSettings());
        this.dom.btnSettingsClose.addEventListener('click',()=>this.closeSettings());
        this.dom.btnSettingsDone.addEventListener('click',()=>this.closeSettings());
        this.dom.settingsModal.addEventListener('click',e=>{ if (e.target===this.dom.settingsModal) this.closeSettings(); });
        document.querySelectorAll('.stepper-btn').forEach(btn=>{
            btn.addEventListener('click',()=>this.adjustSetting(btn.dataset.target, parseInt(btn.dataset.dir)));
        });
        document.getElementById('toggle-autobreaks').addEventListener('change',e=>{
            this.settings.autoStartBreaks=e.target.checked; this.saveSettings();
        });
        document.getElementById('toggle-autopomodoros').addEventListener('change',e=>{
            this.settings.autoStartPomodoros=e.target.checked; this.saveSettings();
        });

        // Tasks
        this.dom.btnAddTask.addEventListener('click',()=>{
            this.addTask(this.dom.taskInput.value);
            this.dom.taskInput.value='';
        });
        this.dom.taskInput.addEventListener('keydown',e=>{
            if (e.key==='Enter') { this.addTask(this.dom.taskInput.value); this.dom.taskInput.value=''; }
        });
        this.dom.taskList.addEventListener('click',e=>{
            const item = e.target.closest('.task-item');
            if (!item) return;
            const id = item.dataset.id;
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (action==='done') this.toggleDone(id);
            else if (action==='delete') this.deleteTask(id);
            else if (action==='active') this.setActiveTask(id);
        });
        this.dom.btnClearFinished.addEventListener('click',()=>this.clearFinished());
        this.dom.btnClearAll.addEventListener('click',()=>this.clearAll());

        // Share modal
        this.dom.shareClose.addEventListener('click',()=>this.dom.shareModal.classList.remove('open'));
        this.dom.shareModal.addEventListener('click',e=>{ if (e.target===this.dom.shareModal) this.dom.shareModal.classList.remove('open'); });
        this.dom.btnDownload.addEventListener('click',()=>this.downloadCard());
        this.dom.btnCopyLink.addEventListener('click',()=>this.copyLink());

        // CTA
        this.dom.bsCtaBtn.addEventListener('click',()=>this.track('brainscape_clicked',{location:'cta_bar'}));

        // Keyboard
        document.addEventListener('keydown',e=>{
            if (e.target.tagName==='INPUT') return;
            if (e.code==='Space') { e.preventDefault(); this.handleStartPause(); }
            if (e.code==='KeyR' && this.status!=='running') this.reset();
        });
    }

    // ---- Toast ----
    showToast(msg) {
        document.querySelectorAll('.toast').forEach(t=>t.remove());
        const t=document.createElement('div'); t.className='toast'; t.textContent=msg;
        document.body.appendChild(t);
        requestAnimationFrame(()=>t.classList.add('show'));
        setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); },3000);
    }

    // ---- Init ----
    init() {
        this.bindEvents();
        this.setModeColors('pomodoro');
        this.renderSoundscapes();
        this.renderTasks();
        this.renderStreakStats();
        this.updateDisplay();
        this.updateSessionInfo();
        this.rotateMicroCopy();
        this.initFloatingTips();
    }
}


// ---- Notification permission ----
if ('Notification' in window && Notification.permission==='default') {
    document.addEventListener('click', function req() {
        Notification.requestPermission();
        document.removeEventListener('click',req);
    }, { once:true });
}

// ---- Init ----
document.addEventListener('DOMContentLoaded',()=>{ window.app=new StudyTimer(); });
