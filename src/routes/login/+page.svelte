<script lang="ts">
  import { enhance } from '$app/forms';
  let { form } = $props();
  let showPassword = $state(false);

  function togglePassword() {
    showPassword = !showPassword;
  }
</script>

<div class="login-container">
  <div class="glass-panel login-box">
    <div class="header">
      <img src="/logo.png" alt="MATAPADI Logo" class="logo-img" />
      <h1 class="text-primary">MATAPADI</h1>
      <p class="text-muted">Sparrow Defense System</p>
    </div>

    <form method="POST" use:enhance class="login-form">
      <div class="input-group">
        <label for="username">Operator ID</label>
        <input 
          type="text" 
          name="username" 
          id="username" 
          placeholder="Enter Username..." 
          class="cyber-input" 
          required 
        />
      </div>

      <div class="input-group">
        <label for="password">Security Protocol (Password)</label>
        <div class="password-wrapper">
          <input 
            type={showPassword ? "text" : "password"} 
            name="password" 
            id="password" 
            placeholder="Enter Passcode..." 
            class="cyber-input" 
            required 
          />
          <button type="button" class="toggle-btn" onclick={togglePassword} aria-label="Toggle Password Visibility">
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {#if form?.incorrect}
        <p class="error-text text-red">Akses Ditolak. Kredensial Tidak Valid!</p>
      {/if}

      <button type="submit" class="cyber-button">Authorize Access</button>
    </form>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .login-box {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }

  .header p {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .logo-img {
    max-width: 80px;
    height: auto;
    margin: 0 auto 0.5rem auto;
    display: block;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    text-align: left;
    gap: 0.5rem;
  }

  .input-group label {
    font-size: 0.85rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .password-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .password-wrapper input {
    padding-right: 4rem; /* Memberi ruang untuk tombol show/hide */
  }

  .toggle-btn {
    position: absolute;
    right: 0.5rem;
    background: transparent;
    border: none;
    color: var(--accent-primary);
    font-weight: 600;
    cursor: pointer;
    padding: 0.5rem;
    font-size: 0.85rem;
    text-transform: uppercase;
  }

  .toggle-btn:hover {
    text-decoration: underline;
  }

  .error-text {
    font-size: 0.85rem;
    font-weight: 600;
  }
</style>
