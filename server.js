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
    const btcRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
    const btcData = await btcRes.json();
    console.log('BTC raw:', JSON.stringify(btcData));

    const rateRes = await fetch('https://open.er-api.com/v6/latest/USD');
    const rateData = await rateRes.json();
    console.log('Rate raw:', JSON.stringify(rateData).slice(0, 100));

    const price = parseFloat(btcData.price) * rateData.rates.JPY;
    console.log('BTC価格チェック: ¥' + Math.round(price).toLocaleString());

    if (price > 1) {
      const payload = JSON.stringify({
        title: 'BITEX - 価格アラート',
        body: 'BTC ¥' + Math.round(price).toLocaleString() + ' を確認！',
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
  } catch (e) {
    console.error('価格取得エラー:', e.message);
  }
}
setInterval(checkAndNotify, 10000);
async function checkAndNotify() {
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCJPY');
    const data = await res.json();
    const price = parseFloat(data.price);
    console.log('BTC価格チェック: ¥' + Math.round(price).toLocaleString());

    if (price > 1) {
      const payload = JSON.stringify({
        title: 'BITEX - 価格アラート',
        body: 'BTC ¥' + Math.round(price).toLocaleString() + ' を確認！',
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
  } catch (e) {
    console.error('価格取得エラー:', e.message);
  }
}

app.listen(3000, () => console.log('サーバー起動！ポート3000で待機中'));
