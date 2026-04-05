// script.js
console.log("GrowNex initialization...");

// Fake Live Visitor Counter
const visitorTextEl = document.getElementById('visitor-text');

const counterMessages = [
    (count) => `👁 <span style="color: var(--neon-green); font-weight: 700;">${count}</span> people are viewing this website right now`,
    (count) => `🔥 <span style="color: var(--neon-green); font-weight: 700;">${Math.floor(count / 4)}</span> people contacted in last 10 minutes`
];

function updateVisitorCounter() {
    if (!visitorTextEl) return;

    // Random between 120 and 180
    const count = Math.floor(Math.random() * (180 - 120 + 1)) + 120;

    // Pick message type (first is more likely initially)
    const messageType = Math.random() > 0.7 ? 1 : 0;

    // Add quick fade out/in effect
    visitorTextEl.style.opacity = '0';
    setTimeout(() => {
        visitorTextEl.innerHTML = counterMessages[messageType](count);
        visitorTextEl.style.opacity = '1';
    }, 300);

    // Schedule next update (3-5 seconds)
    const nextUpdate = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
    setTimeout(updateVisitorCounter, nextUpdate);
}

// Fake Recent Customer Popup
const popupEl = document.getElementById('customer-popup');
const popupTextEl = document.getElementById('popup-text');

const firstNames = ["Rahul", "Sneha", "Amit", "Priya", "Vikram", "Anjali", "Rohan", "Neha", "Karan", "Pooja"];
const cities = ["Mumbai", "Pune", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad"];
const actions = ["just contacted us", "booked a service", "requested a callback", "purchased a package"];

function showCustomerPopup() {
    if (!popupEl || !popupTextEl) return;

    const name = firstNames[Math.floor(Math.random() * firstNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];

    popupTextEl.innerHTML = `<span class="text-highlight">${name}</span> from ${city} ${action}`;

    popupEl.classList.add('show');

    setTimeout(() => {
        popupEl.classList.remove('show');
    }, 4000);

    // Schedule next popup (7-12 seconds limit as asked for regular interval, slightly longer than 5-10 for better UX)
    const nextPopup = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
    setTimeout(showCustomerPopup, nextPopup);
}

document.addEventListener('DOMContentLoaded', () => {
    updateVisitorCounter();
    setTimeout(showCustomerPopup, 5000);
});

// Google Sheets Web App URL (Paste your URL here)
const GOOGLE_SCRIPT_URL = ""; // e.g., "https://script.google.com/macros/s/.../exec"

// Contact Form Submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusEl = document.getElementById('form-status');

        const btn = contactForm.querySelector('button');
        const origText = btn.innerText;
        btn.innerText = "Sending...";
        btn.disabled = true;

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;

        // 1. Save to Local Storage for Admin Dashboard (Real data logic)
        const existingLeads = JSON.parse(localStorage.getItem('grownex_leads')) || [];
        const newLead = {
            row: Date.now(), // unique ID based on timestamp
            timestamp: new Date().toISOString(),
            name,
            email,
            phone,
            message,
            status: "New"
        };
        existingLeads.push(newLead);
        localStorage.setItem('grownex_leads', JSON.stringify(existingLeads));

        // 2. Send to Google Sheets (if URL is provided)
        if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== "") {
            const formData = new FormData();
            formData.append('Date', new Date().toLocaleDateString());
            formData.append('Name', name);
            formData.append('Email', email);
            formData.append('Phone', phone);
            formData.append('Message', message);

            try {
                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: formData,
                    mode: 'no-cors' // Use no-cors to prevent CORS issues with Google Forms/Scripts
                }).then(() => console.log('Successfully sent data to Google Sheets'))
                  .catch(err => console.error('Error sending to Google Sheets:', err));
            } catch (err) {
                console.error("Fetch failed", err);
            }
        }

        setTimeout(() => {
            statusEl.innerText = "Thank you! GrowNex team will contact you soon 🚀";
            statusEl.style.color = "var(--neon-green)";
            contactForm.reset();
            btn.innerText = origText;
            btn.disabled = false;
        }, 800);
    });
}
