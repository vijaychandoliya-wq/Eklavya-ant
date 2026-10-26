import {clearSessionToken} from '../src/secureSession';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {changePassword, getBaseUrl, hasSession, login, logout, setSchoolCode} from '../src/api';

const fetchMock = jest.fn();

beforeEach(async () => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
  await clearSessionToken();
  await AsyncStorage.clear();
});

test('uses the shared API for school 117 and sends the tenant header', async () => {
  await setSchoolCode('117');
  expect(await getBaseUrl()).toBe('https://gurukul-worker-api.gurukull.workers.dev');

  fetchMock.mockResolvedValue({
    ok: true,
    text: async () => JSON.stringify({token: 'parent-token', parent_id: 7, user_name: 'Parent', user_email: 'parent@example.test'}),
  });

  await login('parent@example.test', 'access-key');

  expect(fetchMock).toHaveBeenCalledWith(
    'https://gurukul-worker-api.gurukull.workers.dev/api/parent/login',
    expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({'x-school-code': '117'}),
    }),
  );
  expect(await hasSession()).toBe(true);
});

test('keeps another configured school on the same shared API', async () => {
  await setSchoolCode('RAJESH');
  expect(await getBaseUrl()).toBe('https://gurukul-worker-api.gurukull.workers.dev');
});

test('clears the session when the server rejects a protected request', async () => {
  await setSchoolCode('117');
  fetchMock.mockResolvedValueOnce({
    ok: true,
    text: async () => JSON.stringify({token: 'parent-token', parent_id: 7, user_name: 'Parent', user_email: 'parent@example.test'}),
  });
  await login('parent@example.test', 'access-key');
  fetchMock.mockResolvedValueOnce({ok: false, status: 401, text: async () => JSON.stringify({message: 'Expired'})});

  // logout is the smallest protected call and must clear local credentials in finally.
  await expect(logout()).rejects.toThrow('Expired');
  expect(await hasSession()).toBe(false);
});

// Request/response contract only; no account or password is persisted.
test('sends the own-password contract with the selected school and no target identity', async () => {
 await setSchoolCode('108');
 fetchMock.mockResolvedValue({ok:true,text:async()=>JSON.stringify({success:true,sessionsRevoked:true})});
 const values={oldpassword: 'old scalar password', newpassword: 'a sufficiently long new passphrase', confirmpassword: 'a sufficiently long new passphrase'};
 await changePassword(values);
 const [url,options]=fetchMock.mock.calls[0];
 expect(url).toBe('https://gurukul-worker-api.gurukull.workers.dev/v2/password/change');
 expect(options.headers['x-school-code']).toBe('108');
 const keys=String(options.body).split('&').map(pair=>decodeURIComponent(pair.split('=')[0]));
 expect(keys.sort()).toEqual(Object.keys(values).sort());
 expect(keys).not.toContain('userId');
});
