const key = document.querySelector('#api-key');
const message = document.querySelector('#message');
if (new URLSearchParams(location.search).get('login') === 'success') {
  message.textContent = 'Login erfolgreich. Dein Telefonassistent kann jetzt die Starter-API verwenden.';
  history.replaceState(null, '', '/');
}
async function request(path, method = 'GET') {
  const response = await fetch(path, { method, headers: { Authorization: `Bearer ${key.value}` } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'Anfrage fehlgeschlagen.');
  return data;
}
function showError(error) { message.textContent = error.message; }
document.querySelector('#login-form').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const { url } = await request('/auth/login', 'POST');
    location.assign(url);
  } catch (error) { showError(error); }
});
document.querySelector('#status').addEventListener('click', async () => {
  try {
    const user = await request('/api/me');
    message.textContent = `Verbindung zur mobie-API erfolgreich (Testnutzer ${user.id ?? 'angemeldet'}).`;
  } catch (error) { showError(error); }
});
document.querySelector('#logout').addEventListener('click', async () => {
  try {
    await request('/api/logout', 'POST');
    message.textContent = 'Starter abgemeldet. Die Auth0-Browsersitzung bleibt bestehen.';
  } catch (error) { showError(error); }
});
