import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL ?? 'https://medi-g8-b0kxqvrx.ue.gateway.dev/api';
const LOGIN_URL = `${BASE_URL}/v1/login`;
const PEDIDOS_URL = `${BASE_URL}/v1/pedidos/entregar`;

const DEFAULT_USERS = [
  { email: 'demo.co@medisupply.com', password: 'ChangeMe1!', country: 'CO' },
  { email: 'demo.pe@medisupply.com', password: 'ChangeMe1!', country: 'PE' },
  { email: 'demo.ec@medisupply.com', password: 'ChangeMe1!', country: 'EC' },
  { email: 'demo.mx@medisupply.com', password: 'ChangeMe1!', country: 'MX' },
];
const USERS = __ENV.PEDIDOS_USERS ? JSON.parse(__ENV.PEDIDOS_USERS) : DEFAULT_USERS;

const DEFAULT_WINDOWS = [
  { fechaInicio: '2024-01-01', fechaFin: '2024-01-31' },
  { fechaInicio: '2024-02-01', fechaFin: '2024-02-29' },
  { fechaInicio: '', fechaFin: '' },
];
const DATE_WINDOWS = __ENV.PEDIDOS_WINDOWS ? JSON.parse(__ENV.PEDIDOS_WINDOWS) : DEFAULT_WINDOWS;

const pedidosDuration = new Trend('pedidos_duration', true);
const pedidosSuccess = new Rate('pedidos_success');

export const options = {
  scenarios: {
    pedidos_entrega: {
      executor: 'ramping-vus',
      exec: 'consultarPedidos',
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
    pedidos_success: ['rate>0.99'],
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
  return { sessions, windows: DATE_WINDOWS };
}

export function consultarPedidos(data) {
  const session = randomItem(data.sessions);
  const window = randomItem(data.windows);
  const params = [];
  if (window.fechaInicio) params.push(`fechaInicio=${encodeURIComponent(window.fechaInicio)}`);
  if (window.fechaFin) params.push(`fechaFin=${encodeURIComponent(window.fechaFin)}`);
  const url = params.length ? `${PEDIDOS_URL}?${params.join('&')}` : PEDIDOS_URL;

  const res = http.get(url, { headers: { Authorization: session.token } });
  pedidosDuration.add(res.timings.duration);

  const passed = check(res, {
    'status 200': (r) => r.status === 200,
    'duración < 2s': (r) => r.timings.duration < 2000,
    'contenido válido': (r) => !!r.body && r.body.length > 0,
  });
  pedidosSuccess.add(passed);
  sleep(0.75);
}

export function handleSummary(data) {
  return {
    [buildSummaryPath('summary-pedidos')]: JSON.stringify(data, null, 2),
  };
}
