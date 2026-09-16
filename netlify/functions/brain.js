// Funzione serverless (Netlify Functions) che espone un unico "cervello
// condiviso": i pesi del motore e le statistiche di addestramento, salvati
// in Netlify Blobs invece che nel localStorage del singolo browser.
//
// GET  -> restituisce l'ultimo salvataggio condiviso (o null se non esiste
//         ancora, cioè nessuno ha mai sincronizzato nulla).
// POST -> riceve un nuovo salvataggio e lo scrive, MA solo se non è più
//         indietro di quello già presente (stesso criterio usato lato
//         client per unire localStorage e file locale: prima il numero
//         totale di partite giocate, poi la generazione). Questo evita che
//         un computer rimasto indietro sovrascriva per sbaglio i progressi
//         fatti nel frattempo da un altro computer.
const { getStore } = require('@netlify/blobs');

const KEY = 'shared-brain';
const STORE_NAME = 'scacchi-autodidatta';

exports.handler = async (event) => {
  const store = getStore(STORE_NAME);

  if (event.httpMethod === 'GET') {
    try {
      const data = await store.get(KEY, { type: 'json' });
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify(data || null)
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: String(err && err.message || err) }) };
    }
  }

  if (event.httpMethod === 'POST') {
    let incoming;
    try {
      incoming = JSON.parse(event.body || '{}');
    } catch (err) {
      return { statusCode: 400, body: JSON.stringify({ error: 'JSON non valido' }) };
    }
    if (!incoming || !incoming.champion) {
      return { statusCode: 400, body: JSON.stringify({ error: 'dati non validi: manca "champion"' }) };
    }

    try {
      const existing = await store.get(KEY, { type: 'json' });
      if (existing) {
        const existingGames = existing.totalGames || 0, incomingGames = incoming.totalGames || 0;
        const existingGen = existing.generation || 0, incomingGen = incoming.generation || 0;
        const existingIsAhead = existingGames > incomingGames || (existingGames === incomingGames && existingGen > incomingGen);
        if (existingIsAhead) {
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ saved: false, reason: 'il cervello condiviso è già più avanti', current: existing })
          };
        }
      }
      await store.setJSON(KEY, incoming);
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ saved: true }) };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: String(err && err.message || err) }) };
    }
  }

  return { statusCode: 405, headers: { Allow: 'GET, POST' }, body: 'Method Not Allowed' };
};
