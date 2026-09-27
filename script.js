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
// FUNGSI FAQ ACCORDION (Animasi rotasi & slide)
// ----------------------------------------------------
function toggleFaq(btn) {
    const content = btn.nextElementSibling;
    const icon = btn.querySelector('.faq-icon');
    const allContents = document.querySelectorAll('.faq-content');
    const allIcons = document.querySelectorAll('.faq-icon');
    const allBtns = document.querySelectorAll('.faq-btn');

    const isOpen = !content.classList.contains('max-h-0');

    // Tutup semuanya dengan transisi smooth
    allContents.forEach(c => {
        c.classList.add('max-h-0', 'border-opacity-0', 'opacity-0', 'py-0');
        c.classList.remove('max-h-[500px]', 'opacity-100', 'py-4');
    });
    allIcons.forEach(i => {
        i.classList.remove('rotate-180', 'bg-black', 'text-white');
        i.classList.add('bg-white');
    });
    allBtns.forEach(b => {
        b.classList.remove('bg-brutal-blue');
    });

    // Buka item yang diklik dengan transisi padding/opacity dan rotasi panah
    if (!isOpen) {
        content.classList.remove('max-h-0', 'border-opacity-0', 'opacity-0', 'py-0');
        content.classList.add('max-h-[500px]', 'opacity-100', 'py-4');
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

        if (timer < 30) { 
            display.classList.add('text-red-700', 'animate-pulse'); 
        }

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

function getActivationTimeData() {
    const now = new Date();
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const expiryDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear() + 1}`;
    
    let hours = now.getHours();
    let mins = now.getMinutes();
    hours = hours < 10 ? '0' + hours : hours;
    mins = mins < 10 ? '0' + mins : mins;
    const timeWita = `${hours}:${mins} WITA`;

    return { expiryDate, timeWita, timestamp: now.getTime() };
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

// [ REVISI: RIWAYAT GAGAL / SUKSES ]
function saveHistory(status, email, orderStr) {
    const timeData = getActivationTimeData();
    let history = JSON.parse(localStorage.getItem('alightHistory') || '[]');
    history.unshift({ 
        status: status,
        email: email, 
        date: timeData.expiryDate, 
        time: timeData.timeWita, 
        order: orderStr,
        timestamp: timeData.timestamp
    });
    localStorage.setItem('alightHistory', JSON.stringify(history));
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
        
        if (!data.ok) {
            // Catat ke riwayat gagal
            saveHistory('failed', userEmailMemory, 'Gagal/Invalid');
            throw new Error(data.why || 'Verifikasi gagal.');
        }

        clearInterval(countdownInterval); 
        const timeData = getActivationTimeData();
        
        document.getElementById('modal-expiry').innerHTML = `<i class="ph ph-calendar-blank"></i> ${timeData.expiryDate}`;
        document.getElementById('modal-time').innerHTML = `<i class="ph ph-clock"></i> ${timeData.timeWita}`;
        if(data.orderId) document.getElementById('modal-order').innerText = data.orderId;

        document.getElementById('step3-email').innerText = userEmailMemory;
        document.getElementById('step3-expiry').innerHTML = `<i class="ph ph-calendar-blank"></i> ${timeData.expiryDate}`;
        document.getElementById('step3-time').innerHTML = `<i class="ph ph-clock"></i> ${timeData.timeWita}`;
        if(data.orderId) document.getElementById('step3-order').innerText = data.orderId;

        // Catat ke riwayat sukses
        saveHistory('success', userEmailMemory, data.orderId || 'Alfian-Shop-XXX');

        openSuccessModal();
        const counter = document.getElementById('daily-count');
        if (counter) counter.innerText = parseInt(counter.innerText) + 1;

    } catch (error) { 
        showToast(`❌ Error: ${error.message}`); 
    } 
    finally { btn.classList.remove('is-loading'); }
}

function resetAndCloseModal() {
    const modal = document.getElementById('success-modal');
    const modalBg = document.getElementById('success-modal-bg');
    const modalContent = document.getElementById('success-modal-content');
    
    modalBg.classList.remove('backdrop-enter');
    modalBg.classList.add('backdrop-exit');
    modalContent.classList.remove('modal-enter');
    modalContent.classList.add('modal-exit');
    
    setTimeout(() => { 
        modal.classList.add('hidden'); 
        resetForm();
    }, 200);
}

function resetForm() {
    clearInterval(countdownInterval);
    userEmailMemory = ""; emailInput.value = ""; oobInput.value = "";
    
    if(!step3UI.classList.contains('hidden-step')) {
        setTabProgress(1);
        transitionStep(step3UI, step1UI);
    } else if(!step2UI.classList.contains('hidden-step')){
        setTabProgress(1);
        transitionStep(step2UI, step1UI);
    }
}

// ----------------------------------------------------
// FUNGSI MODAL SUCCESS & ANIMASI CONFETTI
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
    
    container.style.transition = 'none'; 
    container.style.opacity = '1';
    
    const colors = ['#fef08a', '#93c5fd', '#bbf7d0', '#fbcfe8', '#e9d5ff', '#ef4444', '#f97316', '#06b6d4', '#a855f7'];
    const totalPieces = 220; 
    
    for(let i = 0; i < totalPieces; i++) {
        let confetti = document.createElement('div');
        confetti.className = 'absolute animate-burst border border-black shadow-brutal-hover rounded-sm';
        
        confetti.style.top = '50%';
        confetti.style.left = '50%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        const isRibbon = Math.random() > 0.35;
        if (isRibbon) {
            confetti.style.width = (Math.random() * 6 + 3) + 'px';
            confetti.style.height = (Math.random() * 50 + 25) + 'px';
        } else {
            confetti.style.width = (Math.random() * 12 + 6) + 'px';
            confetti.style.height = (Math.random() * 12 + 6) + 'px';
        }
        
        const tx = (Math.random() - 0.5) * window.innerWidth * 1.1;
        const ty = (Math.random() - 0.5) * window.innerHeight * 1.1;
        const rot = (Math.random() - 0.5) * 1440;

        confetti.style.setProperty('--tx', `${tx}px`);
        confetti.style.setProperty('--ty', `${ty}px`);
        confetti.style.setProperty('--rot', `${rot}deg`);
        
        confetti.style.animationDuration = (Math.random() * 2 + 8) + 's';
        confetti.style.animationDelay = (Math.random() * 0.2) + 's';
        
        container.appendChild(confetti);
    }
    
    setTimeout(() => { 
        container.style.transition = 'opacity 2s ease-in-out';
        container.style.opacity = '0'; 
    }, 10000);
}

// ----------------------------------------------------
// FUNGSI COPY DATA
// ----------------------------------------------------
function copySuccessData(btnElement) {
    const isFromStep3 = btnElement.innerText.includes('Verifikasi Akun');
    const email = document.getElementById(isFromStep3 ? 'step3-email' : 'modal-email').innerText;
    const expiry = document.getElementById(isFromStep3 ? 'step3-expiry' : 'modal-expiry').innerText;
    const orderId = document.getElementById(isFromStep3 ? 'step3-order' : 'modal-order').innerText;
    
    const textToCopy = `AlightPro - Bukti Verifikasi\n\nEmail Terdaftar: ${email}\nOrder ID: ${orderId}\nMasa Berlaku Lisensi: ${expiry}\nStatus Akun: LINKED & VERIFIED\nAuto Renewal: Aktif\n\nSelamat berkreasi!`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalHtml = btnElement.innerHTML;
        btnElement.innerHTML = `<i class="ph-fill ph-check-circle text-lg"></i> Disalin!`;
        setTimeout(() => { btnElement.innerHTML = originalHtml; }, 2000);
    }).catch(err => {
        showToast("❌ Gagal menyalin. Silakan coba lagi.");
    });
}

function copyStep3Data(btnElement) {
    const email = document.getElementById('step3-email').innerText;
    const expiry = document.getElementById('step3-expiry').innerText;
    const orderId = document.getElementById('step3-order').innerText;
    
    const textToCopy = `AlightPro - Bukti Verifikasi\n\nEmail Terdaftar: ${email}\nOrder ID: ${orderId}\nMasa Berlaku Lisensi: ${expiry}\nStatus Akun: LINKED & VERIFIED\nAuto Renewal: Aktif\n\nSelamat berkreasi!`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalHtml = btnElement.innerHTML;
        btnElement.innerHTML = `<i class="ph-fill ph-check-circle text-lg"></i> Disalin!`;
        setTimeout(() => { btnElement.innerHTML = originalHtml; }, 2000);
    }).catch(err => {
        showToast("❌ Gagal menyalin.");
    });
}

// ----------------------------------------------------
// FUNGSI MODAL RIWAYAT (SUKSES/GAGAL + HAPUS OTOMATIS 3 HARI)
// ----------------------------------------------------
function openHistoryModal() {
    const modal = document.getElementById('history-modal');
    const modalBg = document.getElementById('history-modal-bg');
    const modalContent = document.getElementById('history-modal-content');
    const container = document.getElementById('history-list');
    
    let historyData = JSON.parse(localStorage.getItem('alightHistory') || '[]');
    const now = Date.now();
    // [ REVISI: Kedaluwarsa otomatis setelah 3 Hari (72 Jam) ]
    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
    
    // Filter data riwayat: Hanya simpan yang usianya di bawah 3 hari
    historyData = historyData.filter(item => (now - item.timestamp) < THREE_DAYS);
    localStorage.setItem('alightHistory', JSON.stringify(historyData)); 
    
    container.innerHTML = '';
    
    if (historyData.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-10 opacity-50">
                <i class="ph ph-ghost text-5xl mb-2"></i>
                <p class="text-xs font-bold text-gray-700">Belum ada riwayat verifikasi.</p>
            </div>`;
    } else {
        historyData.forEach((item, index) => {
            // Tampilan UI dibedakan berdasarkan status
            const isSuccess = item.status === 'success';
            const badgeIcon = isSuccess ? 'ph-check-circle text-green-500' : 'ph-x-circle text-red-500';
            const badgeText = isSuccess ? 'Berhasil' : 'Gagal';
            const badgeTextColor = isSuccess ? 'text-blue-600' : 'text-red-600';

            container.innerHTML += `
            <div class="bg-white border-2 border-black rounded-xl p-3 shadow-brutal-sm mb-3">
                <div class="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                    <p class="text-[11px] sm:text-xs font-bold ${badgeTextColor} flex items-center gap-1">${badgeText} <i class="ph-fill ${badgeIcon}"></i></p>
                    <div class="flex flex-col items-end">
                        <p class="text-[9px] sm:text-[10px] font-bold text-gray-500 flex items-center gap-1"><i class="ph ph-calendar-blank"></i> ${item.date}</p>
                        <p class="text-[9px] sm:text-[10px] font-bold text-purple-600 flex items-center gap-1 mt-0.5"><i class="ph ph-clock"></i> ${item.time || '-'}</p>
                    </div>
                </div>
                <p class="text-[11px] sm:text-xs font-semibold text-black mb-1">Email: <span class="font-bold text-gray-700 break-all">${item.email}</span></p>
                <p class="text-[11px] sm:text-xs font-semibold text-black">Order ID: <span class="font-bold text-gray-700">${item.order}</span></p>
            </div>`;
        });
    }

    modal.classList.remove('hidden');
    modalBg.classList.remove('backdrop-exit');
    modalBg.classList.add('backdrop-enter');
    modalContent.classList.remove('modal-exit');
    modalContent.classList.add('modal-enter');
}

// [ REVISI: Tombol Hapus Manual Riwayat ]
function clearHistory() {
    localStorage.removeItem('alightHistory');
    openHistoryModal(); // Muat ulang list UI (akan kosong)
}

function closeHistoryModal() {
    const modal = document.getElementById('history-modal');
    const modalBg = document.getElementById('history-modal-bg');
    const modalContent = document.getElementById('history-modal-content');
    
    modalBg.classList.remove('backdrop-enter');
    modalBg.classList.add('backdrop-exit');
    modalContent.classList.remove('modal-enter');
    modalContent.classList.add('modal-exit');
    
    setTimeout(() => { modal.classList.add('hidden'); }, 200);
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
