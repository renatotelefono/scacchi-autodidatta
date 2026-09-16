# Scacchi Autodidatta

Un'applicazione di scacchi che gioca contro se stessa e impara nel tempo tramite un algoritmo evolutivo (ricerca minimax/alpha-beta con parametri di valutazione ottimizzati partita dopo partita). Motore, generazione delle mosse e ricerca scritti interamente da zero, nessuna libreria esterna.

- **Addestramento automatico**: il motore gioca contro se stesso a generazioni successive, salvando i progressi.
- **Partita amichevole**: gioca tu stesso contro il motore, scegliendo il colore.
- Persistenza locale (browser + file locale opzionale) **e** cervello condiviso su Netlify (vedi sotto), così i progressi si accumulano anche aprendo il sito da computer diversi.

Apri `index.html` in un browser per avviarla in locale (in questo caso il cervello condiviso su Netlify non è raggiungibile e resta tutto solo nel browser).

## Cervello condiviso (Netlify Functions + Netlify Blobs)

Il sito, quando è pubblicato su Netlify, sincronizza automaticamente i pesi e le statistiche tramite una funzione serverless (`netlify/functions/brain.js`) che li salva in Netlify Blobs — uno storage incluso gratis in Netlify, senza bisogno di configurare un database esterno o segreti/token. Ad ogni partita il browser invia l'aggiornamento; all'avvio scarica l'ultima versione salvata e la confronta con quella locale, tenendo sempre la più avanzata (in base al numero di partite giocate, poi alla generazione).

Netlify deve eseguire `npm install` in fase di build (già configurato in `netlify.toml`) per installare `@netlify/blobs` prima di distribuire la funzione.

Limite noto: se il sito viene usato da due computer nello stesso momento, l'aggiornamento del computer "più indietro" viene scartato dal server per non retrocedere i progressi — nessun dato viene perso, semplicemente quel salvataggio locale non entra a far parte del cervello condiviso finché non recupera terreno.
