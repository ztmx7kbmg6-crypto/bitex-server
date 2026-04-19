const express = require('express');
const webpush = require('web-push');
const app = express();
app.use(express.json());

webpush.setVapidDetails(
  'mailto:yuto.hata0808@gmail.com',
  'BNxxxxxx...BPXhTz8M58KacqS-2quWQ4gc-g3a36OPJ2q3RD7v2MZ1DbQU_8NDCVvSTZy1HBmbxgtIbmR47Vn2UyIV4chPsds',
  'xxxxxxxx...ugMxDiE8wzTwIn16enwspu-nDkK82BF5S8yILIoVVIU'
);

const subscriptions = [];

app.post('/api/subscribe', (req, res) => {
  const sub = req.body;
  if (!subscriptions.find(s => s.endpoint === sub.endpoint)) {
    subscriptions.push(sub);
    console.log('登録完了！合計:', subscriptions.length, '台');
  }
  res.json({ ok: true });
});

async function checkAndNotify() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=jpy');
    const data = await res.json();
    const price = data.bitcoin.jpy;
    console.log('BTC価格: ¥' + price.toLocaleString());
  } catch(e) {
    console.error('エラー:', e.message);
  }
}

setInterval(checkAndNotify, 60000);
checkAndNotify();

app.listen(3000, () => console.log('サーバー起動！'));
