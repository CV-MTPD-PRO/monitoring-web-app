<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { enhance } from '$app/forms';

  let stats = $state({
    status: 'connecting...',
    sparrows_detected_total: 0,
    buzzer_active: false,
    cpu_temp: '--',
    buzzer_mode: 'auto'
  });

  let pollInterval: ReturnType<typeof setInterval>;
  let isToggling = $state(false);

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
    <p class="text-muted">Command Center - Sparrow Edge AI</p>
  </div>
</div>

<div class="dashboard-grid">
  <!-- Video Feed Panel -->
  <div class="glass-panel video-panel">
    <div class="panel-title">
      <h2>Live <span class="text-green">Feed</span></h2>
      <div class="status-dot {stats.status === 'online' ? 'online' : 'offline'}"></div>
    </div>
    
    <div class="video-container">
      {#if stats.status === 'online'}
        <!-- Menyedot siaran MJPEG murni via HTTP -->
        <img src="https://monitoring.matapadi.biz.id/stream" alt="Live Camera" class="live-stream" />
      {:else}
        <div class="offline-screen">
          <p class="text-red">RPi Tunnel is Offline</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Telemetry Panels -->
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
    background: #e2e8f0; /* Light theme empty bg */
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

  /* Telemetry Grid responsif untuk Desktop & Mobile */
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
    /* text-shadow dihapus agar clean */
    transition: color 0.3s ease;
  }

  .stat-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-muted);
  }

  /* Media Queries untuk Mobile */
  @media (max-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
    
    .telemetry-grid {
      /* Jadikan 2 kolom di layar HP agar tidak kepanjangan */
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    }
    
    .stat-value {
      font-size: 2.5rem; /* Perkecil font di mobile */
    }
  }
</style>
