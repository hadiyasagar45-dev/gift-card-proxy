export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code } = req.body;

  // ←←← આ 2 લીટીમાં તમારી વિગતો બદલો ←←←
  const STORE = 'તમારું-store.myshopify.com';        // દા.ત. abc.myshopify.com
  const TOKEN = 'shpat_તમારો-લાંબો-token-અહીં';     // Step 1 માં કૉપી કરેલો token

  try {
    const response = await fetch(`https://${STORE}/admin/api/2025-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': TOKEN,
      },
      body: JSON.stringify({
        query: `query($code: String!) { 
          giftCard(code: $code) { 
            balance { amount currencyCode } 
            initialValue { amount currencyCode } 
            enabled 
            expiresOn 
          } 
        }`,
        variables: { code }
      })
    });

    const json = await response.json();
    const gc = json.data?.giftCard;

    if (gc && gc.enabled) {
      res.status(200).json({
        success: true,
        balance: `${gc.balance.currencyCode} ${parseFloat(gc.balance.amount).toFixed(2)}`,
        original: `${gc.initialValue.currencyCode} ${parseFloat(gc.initialValue.amount).toFixed(2)}`,
        expires: gc.expiresOn ? new Date(gc.expiresOn).toLocaleDateString() : null
      });
    } else {
      res.status(200).json({ success: false, message: 'Invalid or expired gift card' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
}
