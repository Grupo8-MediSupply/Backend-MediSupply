import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL ?? 'https://medi-g8-b0kxqvrx.ue.gateway.dev/api';
const LOGIN_URL = `${BASE_URL}/v1/login`;
const ORDER_URL = `${BASE_URL}/v1/ordenes/porCliente`;

const DEFAULT_USERS = [
  { email: 'demo.co@medisupply.com', password: 'ChangeMe1!', country: 'CO' },
  { email: 'demo.pe@medisupply.com', password: 'ChangeMe1!', country: 'PE' },
  { email: 'demo.ec@medisupply.com', password: 'ChangeMe1!', country: 'EC' },
  { email: 'demo.mx@medisupply.com', password: 'ChangeMe1!', country: 'MX' },
];
const USERS = __ENV.ORDER_USERS ? JSON.parse(__ENV.ORDER_USERS) : DEFAULT_USERS;

const DEFAULT_ORDERS = [
  {
    productos: [
      {
        lote: '11111111-1111-1111-1111-111111111111',
        cantidad: 2,
        bodega: '22222222-2222-2222-2222-222222222222',
      },
    ],
  },
  {
    productos: [
      {
        lote: '33333333-3333-3333-3333-333333333333',
        cantidad: 1,
        bodega: '44444444-4444-4444-4444-444444444444',
      },
    ],
  },
];
const ORDER_TEMPLATES = __ENV.ORDER_TEMPLATES
  ? JSON.parse(__ENV.ORDER_TEMPLATES)
  : DEFAULT_ORDERS;

const ordenesDuration = new Trend('ordenes_duration', true);
const ordenesSuccess = new Rate('ordenes_success');

// 🧪 Smoke test de órdenes (pocas solicitudes, mismo estilo que login)
export const options = {
  scenarios: {
    ordenes_smoke: {
      executor: 'constant-arrival-rate',
      exec: 'ordenesScenario',
      rate: 10,           // 10 órdenes por minuto
      timeUnit: '1m',
      duration: '1m',     // ~10 iteraciones → ~10 logins + 10 órdenes
      preAllocatedVUs: 5,
      maxVUs: 10,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% de requests (login+orden) < 2s
    ordenes_success: ['rate>0.90'],    // al menos 90% de órdenes exitosas
  },
};

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function buildSummaryPath(baseName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `reports/${baseName}-${timestamp}.json`;
}

export function ordenesScenario() {
  const user = randomItem(USERS);

  // 1️⃣ Login (igual estilo que loginScenario)
  const loginPayload = JSON.stringify({
    email: user.email,
    password: user.password,
  });

  const commonHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const loginRes = http.post(LOGIN_URL, loginPayload, { headers: commonHeaders });

  let token = null;
  let loginBody = {};

  try {
    loginBody = loginRes.json();
    token =
      loginBody?.access_token ||
      loginBody?.result?.access_token ||
      loginBody?.data?.access_token;
  } catch (_) {
    // Si no es JSON, dejamos token = null
  }

  const loginOk =
    (loginRes.status === 200 || loginRes.status === 201) && !!token;

  check(loginRes, {
    'login status 200 o 201': (r) => r.status === 200 || r.status === 201,
    'login token presente': () => !!token,
  });

  if (!loginOk) {
    ordenesSuccess.add(false);
    console.warn(
      `⚠️ Login fallido (${loginRes.status}) para ${user.email} → body: ${JSON.stringify(
        loginBody
      )}`
    );
    sleep(1);
    return;
  }

  // 2️⃣ Crear orden con el token obtenido
  const order = randomItem(ORDER_TEMPLATES);

  const orderHeaders = {
    ...commonHeaders,
    Authorization: `Bearer ${token}`,
  };

  const orderRes = http.post(ORDER_URL, JSON.stringify(order), {
    headers: orderHeaders,
  });

  ordenesDuration.add(orderRes.timings.duration);

  const ok =
    (orderRes.status === 200 || orderRes.status === 201) &&
    orderRes.timings.duration < 2000;

  check(orderRes, {
    'orden status 200 o 201': (r) => r.status === 200 || r.status === 201,
    'orden duración < 2s': (r) => r.timings.duration < 2000,
  });

  ordenesSuccess.add(ok);

  sleep(1);
}

export function handleSummary(data) {
  return {
    [buildSummaryPath('summary-ordenes-smoke')]: JSON.stringify(data, null, 2),
  };
}
