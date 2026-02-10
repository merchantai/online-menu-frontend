<script setup>
import { useRouter } from 'vue-router';

// Admin Contact Logic from .env
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
const adminWhatsapp = import.meta.env.VITE_ADMIN_WHATSAPP;

const contactViaWhatsapp = () => {
  if (!adminWhatsapp) return;
  const phone = adminWhatsapp.replace(/[^\d]/g, '');
  const message = encodeURIComponent("Hello! I'm interested in adding my shop to MerchantAI.");
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
};

const contactViaEmail = () => {
  if (!adminEmail) return;
  const subject = encodeURIComponent("Inquiry: Registering my shop on MerchantAI");
  const body = encodeURIComponent("Hello,\n\nI would like to know more about listing my shop on your platform.");
  window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
};
</script>

<template>
  <div class="join-page">
    <div class="container--narrow">
      <div class="join-content card">
        <header class="join-header">
            <span class="icon-brand">🏪</span>
            <h1>Join MerchantAI</h1>
            <p class="subtitle">Take your business online in minutes</p>
        </header>

        <section class="benefits">
            <div class="benefit-item">
                <span class="benefit-icon">📱</span>
                <div class="benefit-text">
                    <h3>Digital Menu</h3>
                    <p>Beautiful, mobile-first menu for your customers.</p>
                </div>
            </div>
            <div class="benefit-item">
                <span class="benefit-icon">💬</span>
                <div class="benefit-text">
                    <h3>WhatsApp Orders</h3>
                    <p>Receive orders directly on your phone.</p>
                </div>
            </div>
            <div class="benefit-item">
                <span class="benefit-icon">🛡️</span>
                <div class="benefit-text">
                    <h3>Zero Latency</h3>
                    <p>Host your catalogue on your own subdomain.</p>
                </div>
            </div>
        </section>

        <div class="join-actions">
            <h2>Ready to start?</h2>
            <p>Contact our team to get your unique store ID and setup your menu.</p>
            
            <div class="action-grid">
                <button v-if="adminWhatsapp" @click="contactViaWhatsapp" class="btn btn--whatsapp">
                    <span class="icon">💬</span> WhatsApp Admin
                </button>
                <button v-if="adminEmail" @click="contactViaEmail" class="btn btn--outline">
                    <span class="icon">✉️</span> Email Us
                </button>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.join-page {
    padding: 3rem 1rem;
    min-height: 80vh;
    display: flex;
    align-items: center;
}

.join-content {
    padding: 3rem 2rem;
    text-align: center;
}

.icon-brand {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
}

.join-header h1 {
    font-size: 2.2rem;
    margin-bottom: 0.5rem;
    color: var(--primary-color);
}

.subtitle {
    color: var(--text-muted);
    font-size: 1.1rem;
    margin-bottom: 3rem;
}

.benefits {
    display: grid;
    gap: 2rem;
    text-align: left;
    margin-bottom: 4rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
}

.benefit-item {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
}

.benefit-icon {
    font-size: 2rem;
    background: var(--bg-body);
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
    flex-shrink: 0;
}

.benefit-text h3 {
    margin: 0 0 0.3rem 0;
    font-size: 1.2rem;
}

.benefit-text p {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.95rem;
}

.join-actions h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
}

.join-actions p {
    color: var(--text-muted);
    margin-bottom: 2rem;
}

.action-grid {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.action-grid .btn {
    padding: 1rem 2rem;
    font-weight: 700;
}

@media (max-width: 600px) {
    .join-content {
        padding: 2rem 1.5rem;
    }
    .join-header h1 {
        font-size: 1.8rem;
    }
}
</style>
