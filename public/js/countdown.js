// Shared Beta Launch Countdown Timer
function initCountdown() {
  // Set actual beta launch date: December 15, 2025 at 12:00 PM EST
  const launchDate = new Date('2025-12-15T12:00:00-05:00');
  
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = launchDate.getTime() - now;
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    
    if (distance < 0) {
      const countdownBar = document.getElementById('countdownBar');
      if (countdownBar) {
        countdownBar.innerHTML = '<div class="container mx-auto text-center">🎉 Beta is now LIVE!</div>';
      }
    }
  }
  
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCountdown);
} else {
  initCountdown();
}
