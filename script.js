let userEmailMemory = ""; 
let countdownInterval = null;

const step1UI = document.getElementById('step-1');
const step2UI = document.getElementById('step-2');
const step3UI = document.getElementById('step-3');
const tabBg = document.getElementById('tab-bg');
const tabText2 = document.getElementById('tab-text-2');
const tabText3 = document.getElementById('tab-text-3');
const emailInput = document.getElementById('emailInput');
const oobInput = document.getElementById('oobInput');

// ----------------------------------------------------
// FUNGSI SCROLL REVEAL 
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const reveals = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target); 
            }
        });
    }, { root: null, threshold: 0.1 });
    reveals.forEach(reveal => revealObserver.observe(reveal));
});

// ----------------------------------------------------
// FUNGSI FAQ ACCORDION
// ----------------------------------------------------
function toggleFaq(btn) {
    const content = btn.nextElementSibling;
    const icon = btn.querySelector('.faq-icon');
    const allContents = document.querySelectorAll('.faq-content');
    const allIcons = document.querySelectorAll('.faq-icon');
    const allBtns = document.querySelectorAll('.faq-btn');

    const isOpen = !content.classList.contains('max-h-0');

    allContents.forEach(c => {
        c.classList.add('max-h-0', 'border-opacity-0');
        c.classList.remove('max-h-[500px]');
    });
    allIcons.forEach(i => {
        i.classList.remove('rotate-180', 'bg-black', 'text-white');
        i.classList.add('bg-white');
    });
    allBtns.forEach(b => {
        b.classList.remove('bg-brutal-blue');
    });

    if (!isOpen) {
        content.classList.remove('max-h-0', 'border-opacity-0');
        content.classList.add('max-h-[500px]');
        icon.classList.add('rotate-180', 'bg-black', 'text-white');
        icon.classList.remove('bg-white');
        btn.classList.add('bg-brutal-blue');
    }
}

// ----------------------------------------------------
// TOAST NOTIFICATION
// ----------------------------------------------------
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-150%)';
    }, 3000);
}

// ----------------------------------------------------
// FUNGSI TIMER COUNTDOWN
// ----------------------------------------------------
function startTimer(durationInSeconds) {
    clearInterval(countdownInterval); 
    let timer = durationInSeconds;
    const display = document.getElementById('countdown-timer');
    
    display.classList.remove('text-red-700', 'animate-pulse');
    display.classList.add('text-black');

    countdownInterval = setInterval(function () {
        let minutes = parseInt(timer / 60, 10);
        let seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = minutes + ":" + seconds;

        if (timer < 30) { display.classList.add('text-red-700', 'animate-pulse'); }

        if (--timer < 0) {
            clearInterval(countdownInterval);
            showToast("⏳ Waktu link habis! Silakan minta link baru.");
            setTimeout(() => { backToStep1(); }, 2000);
        }
    }, 1000);
}

// ----------------------------------------------------
// TABS & TRANSITION
// ----------------------------------------------------
function setTabProgress(step) {
    if (!tabBg) return;
    if (step === 1) {
        tabBg.style.width = '33.33%'; tabBg.style.transform = 'translateX(0)';
        tabBg.className = "absolute top-0 left-0 h-full w-1/3 bg-brutal-blue border-r-2 border-black transition-all duration-300 ease-in-out";
        tabText2.classList.add('text-gray-400'); tabText2.classList.remove('text-black');
        tabText3.classList.add('text-gray-400'); tabText3.classList.remove('text-black');
    } else if (step === 2) {
        tabBg.style.width = '33.33%'; tabBg.style.transform = 'translateX(100%)';
        tabBg.className = "absolute top-0 left-0 h-full w-1/3 bg-brutal-green border-x-2 border-black transition-all duration-300 ease-in-out";
        tabText2.classList.remove('text-gray-400'); tabText2.classList.add('text-black');
        tabText3.classList.add('text-gray-400'); tabText3.classList.remove('text-black');
    } else if (step === 3) {
        tabBg.style.width = '33.33%'; tabBg.style.transform = 'translateX(200%)';
        tabBg.className = "absolute top-0 left-0 h-full w-1/3 bg-brutal-pink border-l-2 border-black transition-all duration-300 ease-in-out";
        tabText3.classList.remove('text-gray-400'); tabText3.classList.add('text-black');
    }
}

function transitionStep(hideEl, showEl) {
    hideEl.classList.remove('active-step');
    hideEl.classList.add('hidden-step');
    setTimeout(() => {
        showEl.classList.remove('hidden-step');
        showEl.classList.add('active-step');
    }, 300);
}

function getExpiryDate() {
    const now = new Date();
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear() + 1}`;
}

// ----------------------------------------------------
// PROSES KLIK TOMBOL VERIFIKASI
// ----------------------------------------------------
async function parseResponse(res) {
    const text = await res.text();
    if (text.includes('<!DOCTYPE html>') || text.startsWith('The page c')) throw new Error("Endpoint API 404.");
    try { return JSON.parse(text); } catch { throw new Error("Respons server tidak valid."); }
}

async function processStep1() {
    const email = emailInput.value.trim();
    if (!email || !email.includes('@')) { showToast("⚠️ Masukkan email yang valid!"); return; }

    const btn = document.getElementById('btn-step-1');
    btn.classList.add('is-loading');

    try {
        const response = await fetch('/api/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await parseResponse(response);
        if (!data.ok) throw new Error(data.why || 'Gagal mengirim link.');

        userEmailMemory = email; 
        document.getElementById('display-email').innerText = email;
        document.getElementById('modal-email').innerText = email;

        setTabProgress(2);
        transitionStep(step1UI, step2UI);
        startTimer(180);

    } catch (error) { showToast(`❌ Error: ${error.message}`); } 
    finally { btn.classList.remove('is-loading'); }
}

function backToStep1() {
    clearInterval(countdownInterval);
    setTabProgress(1);
    transitionStep(step2UI, step1UI);
}

async function processStep2() {
    const oob = oobInput.value.trim();
    if (!oob) { showToast("⚠️ Tempelkan link OOB terlebih dahulu!"); return; }

    const btn = document.getElementById('btn-step-2');
    btn.classList.add('is-loading');

    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmailMemory, rawLink: oob })
        });
        const data = await parseResponse(response);
        if (!data.ok) throw new Error(data.why || 'Verifikasi gagal.');

        clearInterval(countdownInterval); 
        document.getElementById('modal-expiry').innerHTML = `<i class="ph ph-calendar-blank"></i> ${getExpiryDate()}`;

        openSuccessModal();
        
        const counter = document.getElementById('daily-count');
        if (counter) counter.innerText = parseInt(counter.innerText) + 1;

    } catch (error) { showToast(`❌ Error: ${error.message}`); } 
    finally { btn.classList.remove('is-loading'); }
}

function resetForm() {
    clearInterval(countdownInterval);
    userEmailMemory = ""; emailInput.value = ""; oobInput.value = "";
    setTabProgress(1);
    transitionStep(step3UI, step1UI);
}

// ----------------------------------------------------
// FUNGSI MODAL SUCCESS & ANIMASI CONFETTI LEDAKAN MERIAH (±30 DETIK)
// ----------------------------------------------------
function openSuccessModal() {
    const modal = document.getElementById('success-modal');
    const modalBg = document.getElementById('success-modal-bg');
    const modalContent = document.getElementById('success-modal-content');
    
    modal.classList.remove('hidden');
    modalBg.classList.remove('backdrop-exit');
    modalBg.classList.add('backdrop-enter');
    modalContent.classList.remove('modal-exit');
    modalContent.classList.add('modal-enter');
    
    shootConfetti();
}

function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    const modalBg = document.getElementById('success-modal-bg');
    const modalContent = document.getElementById('success-modal-content');
    
    modalBg.classList.remove('backdrop-enter');
    modalBg.classList.add('backdrop-exit');
    modalContent.classList.remove('modal-enter');
    modalContent.classList.add('modal-exit');
    
    setTimeout(() => { 
        modal.classList.add('hidden');
        setTabProgress(3);
        transitionStep(step2UI, step3UI);
    }, 200);
}

function shootConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    container.style.opacity = '1';
    
    const colors = ['#fef08a', '#93c5fd', '#bbf7d0', '#fbcfe8', '#e9d5ff', '#ef4444', '#f97316', '#06b6d4', '#a855f7'];
    const totalPieces = 180; // Jumlah pita & confetti banyak dan meriah
    
    for(let i = 0; i < totalPieces; i++) {
        let confetti = document.createElement('div');
        confetti.className = 'absolute animate-burst border border-black shadow-brutal-hover rounded-sm';
        
        confetti.style.top = '50%';
        confetti.style.left = '50%';
        
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Kombinasi bentuk tali panjang (ribbon) dan potongan kotak meriah
        const isRibbon = Math.random() > 0.35;
        if (isRibbon) {
            confetti.style.width = (Math.random() * 6 + 3) + 'px';
            confetti.style.height = (Math.random() * 50 + 25) + 'px'; // Panjang seperti pita/tali
        } else {
            confetti.style.width = (Math.random() * 12 + 6) + 'px';
            confetti.style.height = (Math.random() * 12 + 6) + 'px';
        }
        
        // Meledak memenuhi hampir seluruh layar
        const tx = (Math.random() - 0.5) * window.innerWidth * 0.95;
        const ty = (Math.random() - 0.5) * window.innerHeight * 0.95;
        const rot = (Math.random() - 0.5) * 1440;

        confetti.style.setProperty('--tx', `${tx}px`);
        confetti.style.setProperty('--ty', `${ty}px`);
        confetti.style.setProperty('--rot', `${rot}deg`);
        
        // Bertahan selama ±30 detik
        confetti.style.animationDuration = '30s';
        confetti.style.animationDelay = (Math.random() * 0.4) + 's';
        
        container.appendChild(confetti);
    }
    
    // Perlahan hilang setelah 30 detik
    setTimeout(() => { container.style.opacity = '0'; }, 30000);
}

// ----------------------------------------------------
// FUNGSI COPY DATA
// ----------------------------------------------------
function copySuccessData() {
    const email = document.getElementById('modal-email').innerText;
    const expiry = document.getElementById('modal-expiry').innerText;
    
    const textToCopy = `AlightPro - Bukti Verifikasi\n\nEmail Terdaftar: ${email}\nMasa Berlaku Lisensi: ${expiry}\nStatus Akun: LINKED & VERIFIED\nAuto Renewal: Aktif\n\nSelamat berkreasi!`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const btn = document.querySelector('#success-modal-content button:nth-of-type(2)');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<i class="ph-fill ph-check-circle text-lg"></i> Disalin!`;
        setTimeout(() => { btn.innerHTML = originalHtml; }, 2000);
    }).catch(err => {
        showToast("❌ Gagal menyalin. Silakan coba lagi.");
    });
}

// ----------------------------------------------------
// FUNGSI MODAL CS 
// ----------------------------------------------------
function openCSModal() {
    const modal = document.getElementById('cs-modal');
    const modalBg = document.getElementById('cs-modal-bg');
    const modalContent = document.getElementById('cs-modal-content');
    modal.classList.remove('hidden');
    modalBg.classList.remove('backdrop-exit');
    modalBg.classList.add('backdrop-enter');
    modalContent.classList.remove('modal-exit');
    modalContent.classList.add('modal-enter');
}
function closeCSModal() {
    const modal = document.getElementById('cs-modal');
    const modalBg = document.getElementById('cs-modal-bg');
    const modalContent = document.getElementById('cs-modal-content');
    modalBg.classList.remove('backdrop-enter');
    modalBg.classList.add('backdrop-exit');
    modalContent.classList.remove('modal-enter');
    modalContent.classList.add('modal-exit');
    setTimeout(() => { modal.classList.add('hidden'); }, 200);
}
