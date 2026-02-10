<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['terms', 'privacy'].includes(value)
  }
});

const isTerms = computed(() => props.type === 'terms');

const lastUpdated = "February 10, 2026";
</script>

<template>
  <div class="legal-page">
    <div class="container--narrow">
      <div class="legal-content card">
        <header class="legal-header">
          <h1>{{ isTerms ? 'Terms & Conditions' : 'Privacy Policy' }}</h1>
          <p class="last-updated">Last Updated: {{ lastUpdated }}</p>
        </header>

        <div v-if="isTerms" class="legal-text">
          <section>
            <h2>1. Introduction</h2>
            <p>Welcome to MerchantAI. This platform is a digital catalog hosting service. By using this website, you agree to these terms.</p>
          </section>

          <section>
            <h2>2. Nature of Service</h2>
            <p>MerchantAI is a platform that allows shop owners to list their products and menus. We are <strong>NOT</strong> a marketplace, a delivery service, or an intermediary for payments. Any transaction between a user and a shop owner is strictly private and external to this platform.</p>
          </section>

          <section>
            <h2>3. Limitation of Liability</h2>
            <p>MerchantAI does not take any responsibility for the accuracy of the menus, prices, availability, or quality of products listed by shop owners. The shop owners are solely responsible for the content they provide. We are not liable for any actions, disputes, or damages arising from your interaction with any shop listed here.</p>
          </section>

          <section>
            <h2>4. User Conduct</h2>
            <p>Users must not attempt to disrupt the service or use the platform for any illegal activities.</p>
          </section>

          <section>
            <h2>5. Disclaimer</h2>
            <p>The platform is provided "as is" without any warranties. We reserve the right to modify or terminate the service at any time.</p>
          </section>
        </div>

        <div v-else class="legal-text">
          <section>
            <h2>1. Data Collection</h2>
            <p><strong>We do not collect any personal data from users browsing the menus.</strong> We do not use tracking cookies, we do not require user accounts for browsing, and we do not store your location or identity.</p>
          </section>

          <section>
            <h2>2. Shop Owner Data</h2>
            <p>We only store data provided by shop owners (Name, Address, Menu, WhatsApp Number) for the purpose of displaying their digital catalog.</p>
          </section>

          <section>
            <h2>3. Third-Party Services</h2>
            <p>Our "Order via WhatsApp" button directs you to the WhatsApp platform. Once you leave our site, you are subject to WhatsApp's privacy policy. We do not receive copies of your messages or orders.</p>
          </section>

          <section>
            <h2>4. Security</h2>
            <p>While we take reasonable steps to secure the platform via Firebase, we cannot guarantee absolute security of data stored in the cloud.</p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legal-page {
  padding: 3rem 1rem;
  background: var(--bg-body);
  min-height: 100vh;
}

.legal-content {
  padding: 3rem 2.5rem;
}

.legal-header {
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 2rem;
  padding-bottom: 1rem;
}

.legal-header h1 {
  font-size: 2rem;
  margin: 0;
  color: var(--primary-color);
}

.last-updated {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.legal-text section {
  margin-bottom: 2rem;
}

.legal-text h2 {
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
  color: var(--text-main);
}

.legal-text p {
  line-height: 1.7;
  color: var(--text-main);
}

@media (max-width: 600px) {
  .legal-content {
    padding: 2rem 1.5rem;
  }
}
</style>
