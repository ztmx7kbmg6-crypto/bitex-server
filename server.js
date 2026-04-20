const express = require('express');
const webpush = require('web-push');
const app = express();
app.use(express.json());

webpush.setVapidDetails(
  'mailto:yuto.hata0808@gmail.com',
  'BPWngN6HKpVdp2T2QVV2zuFVWXPZ44Q5n-pwAVXAAbzrVKjZpzln8GHgFs4ffSoqVnaWRAv6PCw3mY4dbI0Ha2Y',
  '8iYQVEOnl18ElR7NjmAZop2lF-7LcaI3Gt9ZUhLbROw'
);

const subscriptions = [];
let lastPrice = null;

app.post('/api/subscribe', (req, res) => {
  const sub = req.body;
  if (!subscriptions.find(s => s.endpoint === sub.endpoint)) {
    subscriptions.push(sub);
    console.log('新しいデバイスが登録されました！合計:', subscriptions.length, '台');
  }
  res.json({ ok: true });
});

async function checkAndNotify() {
  try {
    const res = await fetch('https://api.kraken.com/0/public/Ticker?pair=BTCJPY&_=' + Date.now());
    const data = await res.json();
    const key = Object.keys(data.result)[0];
    const price = parseFloat(data.result[key].b[0]);
    console.log('BTC価格チェック: ¥' + Math.round(price).toLocaleString());

    if (lastPrice !== null && Math.abs(price - lastPrice) > 10) {
      const payload = JSON.stringify({
        title: 'BITEX - 価格変動',
        body: 'BTC ¥' + Math.round(price).toLocaleString() + ' (前回から¥' + Math.round(Math.abs(price - lastPrice)).toLocaleString() + '変動)',
        tag: 'price-alert'
      });
      for (const sub of [...subscriptions]) {
        webpush.sendNotification(sub, payload).catch(err => {
          if (err.statusCode === 410) {
            subscriptions.splice(subscriptions.indexOf(sub), 1);
          }
        });
      }
    }
    lastPrice = price;
  } catch (e) {
    console.error('価格取得エラー:', e.message);
  }
}

setInterval(checkAndNotify, 10000);
checkAndNotify();

app.listen(3000, () => console.log('サーバー起動！ポート3000で待機中'));
