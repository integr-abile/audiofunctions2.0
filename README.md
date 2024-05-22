# audiofunctions2.0

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

## Usage

In sviluppo valorizzare nel file `.env` la variabile `DEBUG` per sfruttare tutte le funzionalità o i valori che su netlify
sono disabilitati. In Netlify sono valorizzate attraverso la Netylify UI le stesse variabili d'ambiente.

## URL di test

I query params dei link di seguito sono stati calcolati con `this.$sessionDataSerializer.encode()` passando come parametro a `encode()` il JSON di configurazione un fac simile di
quello iniziale, ma **con solo gli overrides** 

