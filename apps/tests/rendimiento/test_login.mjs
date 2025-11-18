import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL ?? 'https://medi-g8-b0kxqvrx.ue.gateway.dev/api';
const LOGIN_URL = `${BASE_URL}/v1/login`;

const DEFAULT_USERS = [
  { email: 'admin.colombia@example.com', password: 'deploy', country: 'CO' },
];
const USERS = __ENV.LOGIN_USERS ? JSON.parse(__ENV.LOGIN_USERS) : DEFAULT_USERS;

const loginDuration = new Trend('login_duration', true);
const loginSuccess = new Rate('login_success');

// 🧪 Escenario alineado con el enunciado (100 y 400 req/min)
export const options = {
  scenarios: {
    // Fase base: equivalente a 100 pedidos/min
    login_base_load: {
      executor: 'constant-arrival-rate',
      exec: 'loginScenario',
      rate: 100,              // 100 logins por minuto
      timeUnit: '1m',
      duration: '2m',         // ~200 solicitudes
      preAllocatedVUs: 10,    // VUs reservados
      maxVUs: 30,             // tope de VUs si se necesita más
    },

    // Fase pico: equivalente a campaña (400 pedidos/min)
    login_peak_campaign: {
      executor: 'constant-arrival-rate',
      exec: 'loginScenario',
      startTime: '2m10s',     // pequeño respiro después de la fase base
      rate: 400,              // 400 logins por minuto
      timeUnit: '1m',
      duration: '1m',         // ~400 solicitudes
      preAllocatedVUs: 30,
      maxVUs: 60,
    },
  },
  thresholds: {
    // Mantener latencias razonables (enunciado pide <2s en tareas críticas)
    http_req_duration: ['p(95)<2000'], // 95% de logins < 2s
    login_success: ['rate>0.99'],      // al menos 99% de logins exitosos
  },
};

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function buildSummaryPath(baseName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `reports/${baseName}-${timestamp}.json`;
}

export function loginScenario() {
  const user = randomItem(USERS);
  const payload = JSON.stringify({
    email: user.email,
    password: user.password,
  });

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const response = http.post(LOGIN_URL, payload, { headers });

  loginDuration.add(response.timings.duration);

  let token = null;
  let jsonBody = {};

  try {
    jsonBody = response.json();
    token =
      jsonBody?.access_token ||
      jsonBody?.result?.access_token ||
      jsonBody?.data?.access_token;
  } catch (_) {
    // Si no es JSON, simplemente dejamos token = null
  }

  // Aceptamos status 200 o 201
  const ok = (response.status === 200 || response.status === 201) && token;

  check(response, {
    'status 200 o 201': () =>
      response.status === 200 || response.status === 201,
    'token presente': () => !!token,
  });

  loginSuccess.add(ok);

  // Pequeña pausa para que cada VU no haga busy-loop extremo
  sleep(1);
}

export function handleSummary(data) {
  return {
    [buildSummaryPath('summary-login-load')]: JSON.stringify(data, null, 2),
  };
}
