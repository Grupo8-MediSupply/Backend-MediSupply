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
  { productos: [{ lote: '11111111-1111-1111-1111-111111111111', cantidad: 2, bodega: '22222222-2222-2222-2222-222222222222' }] },
  { productos: [{ lote: '33333333-3333-3333-3333-333333333333', cantidad: 1, bodega: '44444444-4444-4444-4444-444444444444' }] },
];
const ORDER_TEMPLATES = __ENV.ORDER_TEMPLATES ? JSON.parse(__ENV.ORDER_TEMPLATES) : DEFAULT_ORDERS;

const ordenesDuration = new Trend('ordenes_duration', true);
const ordenesSuccess = new Rate('ordenes_success');

export const options = {
  scenarios: {
    ordenes_creacion: {
      executor: 'ramping-vus',
      exec: 'crearOrden',
      stages: [
        { duration: '20s', target: 30 },
        { duration: '40s', target: 80 },
        { duration: '20s', target: 120 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    ordenes_success: ['rate>0.99'],
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
  const sessions = USERS.map((user) => {
    const res = http.post(LOGIN_URL, JSON.stringify({ email: user.email, password: user.password }), {
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status !== 200 || !res.json()?.access_token)
      throw new Error(`No se pudo autenticar a ${user.email}`);
    return { country: user.country, token: `Bearer ${res.json().access_token}` };
  });
  return { sessions, orders: ORDER_TEMPLATES };
}

export function crearOrden(data) {
  const session = randomItem(data.sessions);
  const order = randomItem(data.orders);
  const response = http.post(ORDER_URL, JSON.stringify(order), {
    headers: { 'Content-Type': 'application/json', Authorization: session.token },
  });

  ordenesDuration.add(response.timings.duration);
  const passed = check(response, {
    'status 200/201': (r) => [200, 201].includes(r.status),
    'duración < 2s': (r) => r.timings.duration < 2000,
  });
  ordenesSuccess.add(passed);
  sleep(1);
}

export function handleSummary(data) {
  return {
    [buildSummaryPath('summary-ordenes')]: JSON.stringify(data, null, 2),
  };
}
