<script setup>
import { getDiscoveryUrl } from '../utils/domain';
const discoveryUrl = getDiscoveryUrl();
</script>

<template>
  <div class="about-platform">
    <div class="container--narrow">
      <header class="about-header text-center">
        <span class="brand-icon">🏛️</span>
        <h1>About Pro Menu</h1>
        <p class="subtitle">The complete digital ecosystem for modern retail.</p>
      </header>

      <section class="platform-features card mt-4">
        <div class="feature-item">
          <div class="feature-icon">📱</div>
          <div class="feature-text">
            <h3>Digital First</h3>
            <p>Convert your physical menu or product list into a stunning, lightning-fast digital experience accessible via QR codes or links.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">💬</div>
          <div class="feature-text">
            <h3>WhatsApp Integrated</h3>
            <p>Customers can browse your items and send their orders directly to your WhatsApp, making communication seamless and personal.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🛡️</div>
          <div class="feature-text">
            <h3>Custom Permalinks</h3>
            <p>Get a unique, clean URL for your shop (e.g., <code>promenu.in/your-shop</code>) that's easy to share on social media.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">⚡</div>
          <div class="feature-text">
            <h3>Offline Ready (PWA)</h3>
            <p>Built as a Progressive Web App, it works even on slow connections and can be installed on home screens like a native app.</p>
          </div>
        </div>
      </section>

      <section class="about-cta text-center mt-4">
        <h2>Want to list your shop?</h2>
        <p>Join hundreds of businesses growing with Pro Menu.</p>
        <div class="cta-actions">
            <router-link to="/join" class="btn btn--primary">Get Started Now</router-link>
            <router-link to="/" class="btn btn--outline">Back to Discovery</router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about-platform {
  padding: 4rem 1rem;
  background: var(--bg-body);
  min-height: 90vh;
}

.brand-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
}

.platform-features {
  padding: 3rem 2rem;
  display: grid;
  gap: 2.5rem;
}

.feature-item {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.feature-icon {
  font-size: 2.2rem;
  background: var(--bg-body);
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.feature-text h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  color: var(--primary-color);
}

.feature-text p {
  margin: 0;
  line-height: 1.6;
  color: var(--text-main);
}

.about-cta {
  padding: 3rem 1rem;
}

.about-cta h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.ml-2 { margin-left: 1rem; }

@media (max-width: 600px) {
  .platform-features {
    padding: 2rem 1.5rem;
    gap: 2rem;
  }
  
  .feature-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    align-items: center;
  }
  
  .feature-icon {
    width: 60px;
    height: 60px;
  }
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 4rem; /* Significantly increased gap from text above */
}

.cta-actions .btn {
  text-align: center;
  min-width: 200px;
}

@media (max-width: 480px) {
  .cta-actions {
    flex-direction: column;
    align-items: stretch;
    padding: 0 1rem;
  }
  
  .cta-actions .btn {
    width: 100%;
  }
}
</style>
