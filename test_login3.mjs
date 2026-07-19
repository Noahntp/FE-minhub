async function test() {
  const res = await fetch('http://62.171.157.22:8081/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: 'test_1784458120777@test.com', password: 'password123' })
  });
  const data = await res.json();
  console.log('Login Response:', JSON.stringify(data, null, 2));
}
test();
