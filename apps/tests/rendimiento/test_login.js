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

export const options = {
  scenarios: {
    login_load: {
      executor: 'ramping-vus',
      exec: 'loginScenario',
      stages: [
        { duration: '10s', target: 2 },
        { duration: '15s', target: 5 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000', 'avg<1500'],
    login_duration: ['p(95)<1500'],
    login_success: ['rate>0.99'],
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
  const payload = JSON.stringify({ email: user.email, password: user.password });
  const headers = { 'Content-Type': 'application/json' };

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
  } catch (err) {
    console.error('⚠️ Error parseando JSON:', err.message);
  }

  const isStatusOk = response.status === 200 || response.status === 201;
  const hasToken = !!token;

  // Log de depuración controlado
  if (!isStatusOk || !hasToken) {
    console.warn(
      `⚠️ Login fallido (${response.status}) para ${user.email} → respuesta:`,
      JSON.stringify(jsonBody)
    );
  }

  check(response, {
    'status 200 o 201': () => isStatusOk,
    'duración < 2s': (r) => r.timings.duration < 2000,
    'token presente': () => hasToken,
  });

  loginSuccess.add(isStatusOk && hasToken);
  sleep(1);
}

export function handleSummary(data) {
  return {
    [buildSummaryPath('summary-login')]: JSON.stringify(data, null, 2),
  };
}
