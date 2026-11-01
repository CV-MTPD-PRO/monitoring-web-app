<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { enhance } from '$app/forms';

  let stats = $state({
    status: 'connecting...',
    sparrows_detected_total: 0,
    buzzer_active: false,
    cpu_temp: '--',
    buzzer_mode: 'auto',
    patrol_active: false,
    target_locked: false
  });

  let pollInterval: ReturnType<typeof setInterval>;
  let isToggling = $state(false);
  let isPatrolToggling = $state(false);

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (res.ok && !data.error) {
        stats = data;
      } else {
        stats.status = 'offline';
      }
    } catch (e) {
      stats.status = 'offline';
    }
  }

  async function toggleOverride(targetMode: string) {
    if (isToggling) return;
    isToggling = true;
    
    // Optimistic UI Update
    const prevMode = stats.buzzer_mode;
    const prevActive = stats.buzzer_active;
    
    stats.buzzer_mode = targetMode;
    if (targetMode === 'force_on') stats.buzzer_active = true;
    else if (targetMode === 'auto') stats.buzzer_active = false;

    try {
      const res = await fetch('/api/buzzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: targetMode })
      });
      if (!res.ok) throw new Error();
    } catch (e) {
      stats.buzzer_mode = prevMode;
      stats.buzzer_active = prevActive;
      alert("Gagal menghubungi RPi!");
    } finally {
      isToggling = false;
    }
  }

  // PTZ Manual Control Functions
  async function sendPtz(pan: number, tilt: number) {
    if (stats.status !== 'online') return;
    try {
      await fetch('/api/ptz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pan, tilt })
      });
    } catch (err) {
      console.error("PTZ error:", err);
    }
  }

  const stopPtz = () => sendPtz(0, 0);

  // Smart Patrol Mode Toggle
  async function togglePatrol() {
    if (isPatrolToggling || stats.status !== 'online') return;
    isPatrolToggling = true;
    const targetMode = stats.patrol_active ? 'stop' : 'start';
    const prevPatrol = stats.patrol_active;
    stats.patrol_active = !stats.patrol_active;

    try {
      const res = await fetch('/api/patrol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: targetMode })
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      stats.patrol_active = prevPatrol;
      alert("Gagal mengubah mode patroli kamera!");
    } finally {
      isPatrolToggling = false;
    }
  }

  onMount(() => {
    fetchStats();
    pollInterval = setInterval(fetchStats, 2000); // Polling setiap 2 detik
  });

  onDestroy(() => {
    if (pollInterval) clearInterval(pollInterval);
  });
</script>

<div class="dashboard-header">
  <div>
    <h1>MATAPADI <span class="text-primary">Dashboard</span></h1>
    <p class="text-muted">Command Center - Sparrow Edge AI & Smart Patrol</p>
  </div>
</div>

<div class="dashboard-grid">
  <!-- Left Column: Video & PTZ Controls -->
  <div class="video-section">
    <!-- Video Feed Panel -->
    <div class="glass-panel video-panel">
      <div class="panel-title">
        <h2>Live <span class="text-green">Feed</span></h2>
        <div class="header-badges">
          {#if stats.target_locked}
            <span class="badge badge-locked">🎯 TARGET LOCKED</span>
          {/if}
          {#if stats.patrol_active}
            <span class="badge badge-patrol">🛡️ SMART PATROL</span>
          {/if}
          <div class="status-dot {stats.status === 'online' ? 'online' : 'offline'}"></div>
        </div>
      </div>
      
      <div class="video-container">
        {#if stats.status === 'online'}
          <!-- Menyedot siaran MJPEG (dengan failover otomatis ke Cloudflare Tunnel) -->
          <img 
            src="/stream" 
            onerror={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (target.src !== 'https://embed.matapadi.biz.id/stream') {
                target.src = 'https://embed.matapadi.biz.id/stream';
              }
            }}
            alt="Live Camera" 
            class="live-stream" 
          />
        {:else}
          <div class="offline-screen">
            <p class="text-red">RPi Tunnel is Offline</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- PTZ & Camera Motion Controller Panel -->
    <div class="glass-panel ptz-panel">
      <div class="ptz-header">
        <div>
          <h3>Hikvision <span class="text-primary">PTZ Control</span></h3>
          <p class="text-muted text-xs">Kendali Arah Kamera & Patroli Otomatis Sawah</p>
        </div>
        <button 
          class="patrol-toggle-btn {stats.patrol_active ? 'patrol-on' : 'patrol-off'}"
          onclick={togglePatrol}
          disabled={stats.status !== 'online' || isPatrolToggling}
        >
          {stats.patrol_active ? '🛡️ STOP PATROL' : '🔄 AUTO PATROL'}
        </button>
      </div>

      <!-- D-Pad Directional Controls -->
      <div class="dpad-container">
        <div class="dpad-grid">
          <div></div>
          <button 
            class="dpad-btn btn-up" 
            aria-label="Tilt Up"
            onmousedown={() => sendPtz(0, 40)} 
            onmouseup={stopPtz}
            ontouchstart={(e) => { e.preventDefault(); sendPtz(0, 40); }}
            ontouchend={(e) => { e.preventDefault(); stopPtz(); }}
            disabled={stats.status !== 'online' || stats.patrol_active}
          >
            ▲
          </button>
          <div></div>

          <button 
            class="dpad-btn btn-left" 
            aria-label="Pan Left"
            onmousedown={() => sendPtz(-40, 0)} 
            onmouseup={stopPtz}
            ontouchstart={(e) => { e.preventDefault(); sendPtz(-40, 0); }}
            ontouchend={(e) => { e.preventDefault(); stopPtz(); }}
            disabled={stats.status !== 'online' || stats.patrol_active}
          >
            ◀
          </button>
          <button 
            class="dpad-btn btn-center" 
            aria-label="Stop PTZ"
            onclick={stopPtz}
            disabled={stats.status !== 'online'}
          >
            ⏹
          </button>
          <button 
            class="dpad-btn btn-right" 
            aria-label="Pan Right"
            onmousedown={() => sendPtz(40, 0)} 
            onmouseup={stopPtz}
            ontouchstart={(e) => { e.preventDefault(); sendPtz(40, 0); }}
            ontouchend={(e) => { e.preventDefault(); stopPtz(); }}
            disabled={stats.status !== 'online' || stats.patrol_active}
          >
            ▶
          </button>

          <div></div>
          <button 
            class="dpad-btn btn-down" 
            aria-label="Tilt Down"
            onmousedown={() => sendPtz(0, -40)} 
            onmouseup={stopPtz}
            ontouchstart={(e) => { e.preventDefault(); sendPtz(0, -40); }}
            ontouchend={(e) => { e.preventDefault(); stopPtz(); }}
            disabled={stats.status !== 'online' || stats.patrol_active}
          >
            ▼
          </button>
          <div></div>
        </div>
        {#if stats.patrol_active}
          <p class="ptz-hint text-green">Patroli otomatis sedang aktif. D-Pad dikunci agar tidak bentrok.</p>
        {:else}
          <p class="ptz-hint text-muted">Tekan dan tahan panah untuk memutar kamera.</p>
        {/if}
      </div>
    </div>
  </div>

  <!-- Right Column: Telemetry Panels -->
  <div class="telemetry-grid">
    <div class="glass-panel stat-card">
      <h3 class="text-muted">Total Detections</h3>
      <p class="stat-value text-primary">{stats.sparrows_detected_total}</p>
      <p class="stat-label">Birds Today</p>
    </div>

    <div class="glass-panel stat-card">
      <h3 class="text-muted">RPi Core Temp</h3>
      <p class="stat-value {parseFloat((stats.cpu_temp || '').replace(/'C/g, '')) > 75 ? 'text-red' : 'text-green'}">
        {(stats.cpu_temp || '--').replace(/'C/g, '')}°C
      </p>
      <p class="stat-label">Thermal Status</p>
    </div>

    <!-- Gunakan alert-pulse jika buzzer_active = true -->
    <div class="glass-panel stat-card {stats.buzzer_active ? 'alert-pulse' : ''}">
      <h3 class="text-muted">Buzzer ESP32</h3>
      <p class="stat-value {stats.buzzer_active ? 'text-red' : 'text-muted'}">
        {stats.buzzer_active ? 'ACTIVE' : 'IDLE'}
      </p>
      
      <!-- Manual Override Toggle -->
      <div class="override-control">
        <button 
          class="override-btn {stats.buzzer_mode === 'auto' ? 'mode-auto' : 'mode-force'}"
          onclick={() => toggleOverride(stats.buzzer_mode === 'auto' ? 'force_on' : 'auto')}
          disabled={stats.status !== 'online' || isToggling}
        >
          {stats.buzzer_mode === 'auto' ? '🛡️ AI AUTO' : '🚨 FORCE SIREN'}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .video-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .header-badges {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .badge {
    padding: 0.25rem 0.6rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.5px;
  }

  .badge-patrol {
    background: rgba(16, 185, 129, 0.15);
    color: var(--accent-green);
    border: 1px solid var(--accent-green);
    animation: pulse 2s infinite;
  }

  .badge-locked {
    background: rgba(239, 68, 68, 0.15);
    color: var(--accent-red);
    border: 1px solid var(--accent-red);
    animation: pulse-danger 1s infinite;
  }

  /* PTZ Panel Styles */
  .ptz-panel {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .ptz-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .patrol-toggle-btn {
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    border: none;
    transition: all 0.3s ease;
  }

  .patrol-off {
    background: #e2e8f0;
    color: var(--text-main);
  }

  .patrol-off:hover:not(:disabled) {
    background: #cbd5e1;
  }

  .patrol-on {
    background: var(--accent-green);
    color: white;
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
  }

  .dpad-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
  }

  .dpad-grid {
    display: grid;
    grid-template-columns: repeat(3, 60px);
    grid-template-rows: repeat(3, 60px);
    gap: 8px;
    justify-content: center;
  }

  .dpad-btn {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    border: 1px solid var(--panel-border);
    background: rgba(255, 255, 255, 0.9);
    color: var(--text-main);
    font-size: 1.2rem;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    transition: all 0.15s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }

  .dpad-btn:hover:not(:disabled) {
    background: var(--accent-primary);
    color: white;
    transform: translateY(-2px);
  }

  .dpad-btn:active:not(:disabled) {
    background: var(--accent-green);
    color: white;
    transform: scale(0.95);
  }

  .dpad-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn-center {
    background: #f1f5f9;
    color: var(--accent-red);
  }

  .ptz-hint {
    font-size: 0.75rem;
    text-align: center;
    margin-top: 0.2rem;
  }

  .text-xs {
    font-size: 0.75rem;
  }

  .override-control {
    margin-top: 1rem;
    width: 100%;
  }

  .override-btn {
    width: 100%;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    border: none;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }

  .override-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .mode-auto {
    background: #e2e8f0;
    color: var(--text-muted);
  }

  .mode-auto:hover:not(:disabled) {
    background: #cbd5e1;
    color: var(--text-main);
  }

  .mode-force {
    background: var(--accent-red);
    color: white;
    animation: pulse-danger 1.2s infinite;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }

  .panel-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .status-dot.online {
    background-color: var(--accent-green);
    box-shadow: 0 0 10px var(--accent-green);
  }
  .status-dot.offline {
    background-color: var(--accent-red);
    box-shadow: 0 0 10px var(--accent-red);
  }

  .video-container {
    width: 100%;
    aspect-ratio: 16/9;
    background: #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    border: 1px solid var(--panel-border);
  }

  .live-stream {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .offline-screen {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: repeating-linear-gradient(
      45deg,
      #f8fafc,
      #f8fafc 10px,
      #f1f5f9 10px,
      #f1f5f9 20px
    );
  }

  .telemetry-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 1.5rem;
  }

  .stat-value {
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0.5rem 0;
    line-height: 1;
    transition: color 0.3s ease;
  }

  .stat-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-muted);
  }

  @media (max-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
    
    .telemetry-grid {
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    }
    
    .stat-value {
      font-size: 2.5rem;
    }
  }
</style>
