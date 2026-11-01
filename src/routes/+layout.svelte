<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { enhance } from '$app/forms';
  
  let { children } = $props();
  let isMobileMenuOpen = $state(false);

  function toggleMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }
</script>

{#if $page.url.pathname === '/login'}
  <main class="login-wrapper">
    {@render children()}
  </main>
{:else}
  <div class="app-layout">
    <!-- Hamburger Button (Mobile Only) -->
    <button class="hamburger-btn" onclick={toggleMenu} aria-label="Toggle Menu">
      <div class="bar {isMobileMenuOpen ? 'open' : ''}"></div>
      <div class="bar {isMobileMenuOpen ? 'open' : ''}"></div>
      <div class="bar {isMobileMenuOpen ? 'open' : ''}"></div>
    </button>

    <!-- Sidebar / Mobile Navigation -->
    <aside class="sidebar {isMobileMenuOpen ? 'mobile-open' : ''}">
      <div class="brand">
        <img src="/logo.png" alt="MATAPADI Logo" class="sidebar-logo" />
        <h2 class="text-primary">MATAPADI</h2>
      </div>
      
      <nav class="nav-links">
        <a href="/" class="nav-item {$page.url.pathname === '/' ? 'active' : ''}" onclick={() => isMobileMenuOpen = false}>
          <span>Dashboard</span>
        </a>
        <a href="/settings" class="nav-item {$page.url.pathname.startsWith('/settings') ? 'active' : ''}" onclick={() => isMobileMenuOpen = false}>
          <span>Settings</span>
        </a>
        <a href="/analytics" class="nav-item {$page.url.pathname.startsWith('/analytics') ? 'active' : ''}" onclick={() => isMobileMenuOpen = false}>
          <span>Analytics</span>
        </a>
      </nav>

      <!-- Logout Section at bottom of Sidebar -->
      <div class="auth-section">
        <form action="/logout" method="POST" use:enhance>
          <button type="submit" class="cyber-button" style="width: 100%; font-size: 0.8rem;">Logout</button>
        </form>
      </div>
    </aside>

    <!-- Overlay for mobile when menu is open -->
    {#if isMobileMenuOpen}
      <div class="mobile-overlay" onclick={toggleMenu} onkeypress={toggleMenu} role="button" tabindex="0"></div>
    {/if}

    <!-- Main Content Area -->
    <main class="main-content">
      {@render children()}
    </main>
  </div>
{/if}

<style>
  /* Login Wrapper khusus untuk memusatkan layar penuh */
  :global(.login-wrapper) {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: 100%;
    overflow: hidden;
  }

  :global(.login-wrapper::before) {
    content: "";
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background-image: url('/login-bg-optimized.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    z-index: -1;
  }

  .app-layout {
    display: flex;
    min-height: 100vh;
    width: 100%;
  }

  /* Sidebar Styles */
  .sidebar {
    width: 250px;
    background: rgba(255, 255, 255, 0.85); /* Light theme sidebar */
    backdrop-filter: var(--glass-blur);
    border-right: 1px solid var(--panel-border);
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 3rem;
    transition: transform 0.3s ease;
    z-index: 100;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .sidebar-logo {
    max-width: 40px;
    height: auto;
  }

  .brand h2 {
    margin: 0;
    line-height: 1;
    letter-spacing: 1px;
    font-size: 1.5rem;
  }

  .nav-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-item {
    padding: 1rem;
    color: var(--text-muted);
    text-decoration: none;
    font-weight: 600;
    border-radius: 8px;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.9rem;
  }

  .nav-item:hover {
    background: rgba(0, 0, 0, 0.03); /* Light theme hover */
    color: var(--text-main);
  }

  .nav-item.active {
    background: rgba(22, 101, 52, 0.05); /* MATAPADI active bg */
    color: var(--accent-primary);
    border-left: 3px solid var(--accent-primary);
  }

  .auth-section {
    margin-top: auto; /* Mendorong tombol ke bawah */
    padding-top: 1rem;
    border-top: 1px solid var(--panel-border);
  }

  /* Main Content Styles */
  .main-content {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    overflow-y: auto;
  }

  /* Hamburger Button */
  .hamburger-btn {
    display: none;
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 200;
    background: rgba(255, 255, 255, 0.9); /* Light theme hamburger */
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 0.8rem;
    cursor: pointer;
    flex-direction: column;
    gap: 5px;
    backdrop-filter: var(--glass-blur);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .bar {
    width: 24px;
    height: 2px;
    background-color: var(--text-main); /* Dark bar color */
    transition: all 0.3s ease;
  }

  .bar.open:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .bar.open:nth-child(2) { opacity: 0; }
  .bar.open:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  .mobile-overlay {
    display: none;
  }

  /* Mobile Responsive */
  @media (max-width: 900px) {
    .hamburger-btn {
      display: flex;
    }

    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      transform: translateX(-100%);
    }

    .sidebar.mobile-open {
      transform: translateX(0);
    }

    .mobile-overlay {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 50;
    }

    .main-content {
      padding: 5rem 1rem 2rem 1rem; /* Extra top padding for hamburger */
    }
  }
</style>
