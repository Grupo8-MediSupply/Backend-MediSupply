import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL ?? 'https://medi-g8-b0kxqvrx.ue.gateway.dev/api';
const LOGIN_URL = `${BASE_URL}/v1/login`;
const PRODUCT_URL = `${BASE_URL}/v1/producto/ObtenerProductos`;

const DEFAULT_USERS = [
  { email: 'demo.co@medisupply.com', password: 'ChangeMe1!', country: 'CO' },
  { email: 'demo.pe@medisupply.com', password: 'ChangeMe1!', country: 'PE' },
  { email: 'demo.ec@medisupply.com', password: 'ChangeMe1!', country: 'EC' },
  { email: 'demo.mx@medisupply.com', password: 'ChangeMe1!', country: 'MX' },
];
const USERS = __ENV.PRODUCT_USERS ? JSON.parse(__ENV.PRODUCT_USERS) : DEFAULT_USERS;

const productosDuration = new Trend('productos_duration', true);
const productosSuccess = new Rate('productos_success');

export const options = {
  scenarios: {
    productos_cache: {
      executor: 'ramping-vus',
      exec: 'testProductos',
      stages: [
        { duration: '20s', target: 30 },
        { duration: '40s', target: 100 },
        { duration: '20s', target: 150 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
    productos_duration: ['p(90)<1500'],
    productos_success: ['rate>0.99'],
  },
};

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function buildSummaryPath(baseName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `reports/${baseName}-${timestamp}.json`;
}

export function setup() {
  return {
    sessions: USERS.map((user) => {
      const payload = JSON.stringify({ email: user.email, password: user.password });
      const res = http.post(LOGIN_URL, payload, { headers: { 'Content-Type': 'application/json' } });
      if (res.status !== 200 || !res.json()?.access_token)
        throw new Error(`No se pudo autenticar al usuario ${user.email}`);
      return { country: user.country, token: `Bearer ${res.json().access_token}` };
    }),
  };
}

export function testProductos(data) {
  const session = randomItem(data.sessions);
  const response = http.get(PRODUCT_URL, {
    headers: { Authorization: session.token },
    tags: { endpoint: 'obtener-productos', country: session.country },
  });

  productosDuration.add(response.timings.duration);

  const passed = check(response, {
    'status 200': (r) => r.status === 200,
    'duración < 2s': (r) => r.timings.duration < 2000,
    'payload válido': (r) => !!r.json(),
  });

  productosSuccess.add(passed);
  sleep(0.75);
}

export function handleSummary(data) {
  return {
    [buildSummaryPath('summary-productos')]: JSON.stringify(data, null, 2),
  };
}
