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

const lastUpdated = "February 12, 2026";
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
            <p>Welcome to Pro Menu. This platform is a digital catalog hosting service. By using this website, you agree to these terms.</p>
          </section>

          <section>
            <h2>2. Nature of Service</h2>
            <p>Pro Menu is a platform that allows shop owners to list their products and menus. We are <strong>NOT</strong> a marketplace, a delivery service, or an intermediary for payments. Any transaction between a user and a shop owner is strictly private and external to this platform.</p>
          </section>

          <section>
            <h2>3. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Pro Menu and its operators shall not be liable for any direct, indirect, incidental, or consequential damages. This includes, but is not limited to, damages for loss of profits, goodwill, use, data, or other intangible losses. Specifically, we are not responsible for:</p>
            <ul>
              <li>The accuracy of store content, prices, or product quality.</li>
              <li>Any unauthorized access to or use of our servers and/or any personal information stored therein (e.g., data leaks or breaches).</li>
              <li>Any technical failures, interruptions of service, or bugs.</li>
              <li>Disputes or transactions arising between users and listed shop owners.</li>
            </ul>
          </section>

          <section>
            <h2>4. User Conduct</h2>
            <p>Users must not attempt to disrupt the service, circumvent security features, or use the platform for any illegal activities.</p>
          </section>

          <section>
            <h2>5. Disclaimer</h2>
            <p>The platform is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind. We reserve the right to modify or terminate the service at any time without notice.</p>
          </section>
        </div>

        <div v-else class="legal-text">
          <section>
            <h2>1. Overview</h2>
            <p>We value your privacy. This policy explains how we handle information on Pro Menu.</p>
          </section>

          <section>
            <h2>2. Analytics & Cookies</h2>
            <p>We use <strong>Google Analytics for Firebase</strong> to understand how users interact with our platform. This service tracks anonymous metrics such as page views, shop menu popularity, search patterns, and basic demographic data (approximate location, age, gender). This data is used solely to improve our service and help shop owners understand their audience.</p>
          </section>

          <section>
            <h2>3. Shop Owner Data</h2>
            <p>We store data provided by shop owners (Name, Address, Menu, Phone Number) for the purpose of displaying their digital catalog to the public.</p>
          </section>

          <section>
            <h2>4. Third-Party Services</h2>
            <p>Our "Order via WhatsApp" button directs you to the WhatsApp platform. Once you leave our site, you are subject to WhatsApp's privacy policy. We do not receive copies of your messages or orders.</p>
          </section>

          <section>
            <h2>5. Data Security</h2>
            <p>We implement industry-standard security measures through Firebase (a Google service). However, no method of transmission over the Internet or electronic storage is 100% secure. You acknowledge that we cannot guarantee the absolute security of your information and are not liable for any unauthorized data access or leaks.</p>
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
