const axios = require('axios');
const crypto = require('crypto');

const cfg = {
  key: 'AIzaSyDtG1AU22ErnQD60AzBAcaknySiz9_CEq0',
  idt: 'https://www.googleapis.com/identitytoolkit/v3/relyingparty',
  vfy: 'https://us-central1-alight-creative.cloudfunctions.net/verifyPurchase'
};

const dip = () => [crypto.randomInt(1, 255), crypto.randomInt(0, 255), crypto.randomInt(0, 255), crypto.randomInt(1, 255)].join('.');
const sp = h => ({ ...h, 'x-forwarded-for': dip(), 'x-real-ip': dip() });
const h1 = { 'content-type': 'application/json', 'x-android-package': 'com.alightcreative.motion', 'x-android-cert': 'ECA6BF91B8715A6F810ED0BBFC65B6CD578F52A8', 'user-agent': 'dalvik/2.1.0' };
const h2 = { 'content-type': 'application/json; charset=utf-8', 'user-agent': 'okhttp/3.12.1', 'accept-encoding': 'gzip' };

const bad = e => {
  const d = e.response?.data;
  if (!d) return e.message;
  if (typeof d === 'object') return JSON.stringify(d);
  // Jika respons berupa HTML error dari Cloud Functions / Firebase
  if (typeof d === 'string' && d.includes('<!DOCTYPE html>')) {
    return "Server menolak permintaan (HTML Error Response). Kemungkinan Link OOB sudah kedaluwarsa atau sudah pernah digunakan.";
  }
  return String(d);
};

// Fungsi Ekstrak Kode OOB yang lebih fleksibel
function code(raw) {
  if (!raw) return null;
  let s = String(raw).replace(/&/g, '&');
  try { s = decodeURIComponent(s); } catch {}
  try {
    const u = new URL(s);
    let c = u.searchParams.get('oobCode');
    if (!c) {
      const n = u.searchParams.get('link') || u.searchParams.get('q') || u.searchParams.get('url');
      if (n) { try { c = new URL(n).searchParams.get('oobCode'); } catch {} }
    }
    if (c) return c.replace(/[^a-zA-Z0-9_-]/g, '');
  } catch {}
  const m = s.match(/oobCode=([a-zA-Z0-9_-]+)/i);
  if (m) return m[1];
  const t = raw.trim();
  if (/^[a-zA-Z0-9_-]{10,}$/.test(t) && !t.includes('://')) return t;
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { email, rawLink } = req.body;
  
  const c = code(rawLink);
  if (!c) return res.status(400).json({ ok: false, why: 'Code OOB tidak valid atau tidak ditemukan dalam link yang Anda masukkan.' });

  try {
    // 1. Sign In menggunakan OOB Code
    const a = await axios.post(`${cfg.idt}/emailLinkSignin?key=${cfg.key}`, {
      email: email,
      oobCode: c,
      clientType: 'CLIENT_TYPE_ANDROID'
    }, { headers: sp(h1) });

    const id = a.data.idToken;
    
    // 2. Buat Order ID unik dengan prefix Alfian-Shop
    const o = 'Alfian-Shop-' + crypto.randomBytes(3).toString('hex').toUpperCase(); 
    
    const b = {
      data: {
        productId: 'am.full.sub.annual.19q4',
        token: 'mmgaobamlahbbeccfplmbkbb.AO-J1OzqG0or_GJJIx-ms8GrTm-jaglCRfhQSRPUZKpl2YspYS-oN7_94uv8RC5vQbvd_Ios2pPDStZ2n7F0hLE3FiOU7HS3R6Fquulv5xLXFECSv4ctElw',
        skuType: 'subs',
        orderId: o
      }
    };

    const authHeader = {
      ...h2,
      authorization: 'Bearer ' + id,
      'firebase-instance-id-token': 'cSDnCyp3T-uwp07z3tL86T:APA91bFkmvvsHw5nnqa1SBFci-99DRsKClLiETdRrVcJjS5yBx1v_FbCb1d8WhBuea_zmwnYBktyTIzcRhN4b6uNOUur9wPc0gKXmJDoZic0LhNq5V2s0xI'
    };
    
    // 3. Eksekusi Inject Purchase / Premium
    await axios.post(cfg.vfy, b, { headers: sp(authHeader) });
    
    return res.status(200).json({ ok: true, email: email, orderId: o });
  } catch (e) {
    return res.status(500).json({ ok: false, why: bad(e) });
  }
};
