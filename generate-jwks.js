const fs = require('fs');
const { pem2jwk } = require('pem-jwk');

const pub = fs.readFileSync('public.pem', 'utf8');
const jwk = pem2jwk(pub);
jwk.kid = 'mymainkey-1';
jwk.use = 'sig';
jwk.alg = 'RS256';

const jwks = { keys: [jwk] };
fs.writeFileSync('jwks.json', JSON.stringify(jwks, null, 2));
console.log('jwks.json creado');
