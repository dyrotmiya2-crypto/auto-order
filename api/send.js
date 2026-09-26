const axios = require('axios');
const crypto = require('crypto');

const cfg = {
  key: 'AIzaSyDtG1AU22ErnQD60AzBAcaknySiz9_CEq0',
  idt: 'https://www.googleapis.com/identitytoolkit/v3/relyingparty'
};
const dip = () => [crypto.randomInt(1, 255), crypto.randomInt(0, 255), crypto.randomInt(0, 255), crypto.randomInt(1, 255)].join('.');
const sp = h => ({ ...h, 'x-forwarded-for': dip(), 'x-real-ip': dip(), 'client-ip': dip(), 'x-client-ip': dip(), 'x-originating-ip': dip(), 'x-cluster-client-ip': dip() });
const h1 = {
  'content-type': 'application/json',
  'x-android-package': 'com.alightcreative.motion',
  'x-android-cert': 'ECA6BF91B8715A6F810ED0BBFC65B6CD578F52A8',
  'user-agent': 'dalvik/2.1.0 (linux; u; android 15; 23127pn0cc build/bp1a.250505.005)'
};
const bad = e => e.response?.data ? (typeof e.response.data === 'object' ? JSON.stringify(e.response.data) : String(e.response.data)) : e.message;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { email } = req.body;

  const c1 = { identifier: email, continueUri: 'http://localhost' };
  const c2 = { requestType: 6, email: email, androidInstallApp: true, canHandleCodeInApp: true, continueUrl: 'https://alightcreative.com?ui_sid=0366624874&ui_sd=0', iosBundleId: 'com.alightcreative.motion', androidPackageName: 'com.alightcreative.motion', androidMinimumVersion: '585', clientType: 'CLIENT_TYPE_ANDROID' };
  
  try {
    await axios.post(`${cfg.idt}/createAuthUri?key=${cfg.key}`, c1, { headers: sp(h1) });
    const r = await axios.post(`${cfg.idt}/getOobConfirmationCode?key=${cfg.key}`, c2, { headers: sp(h1) });
    return res.status(200).json({ ok: true, r: r.data });
  } catch (e) {
    return res.status(500).json({ ok: false, why: bad(e) });
  }
};
