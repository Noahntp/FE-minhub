async function test() {
  const email = `test_${Date.now()}@test.com`;
  await fetch('http://62.171.157.22:8081/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      full_name: 'Test Student', email: email, password: 'password123', password_confirmation: 'password123', role: 'student'
    })
  });
  
  const loginRes = await fetch('http://62.171.157.22:8081/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: email, password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token || loginData.session_token || loginData.data?.token || loginData.data?.session_token;
  
  if (!token) {
    console.log('Login failed:', loginData);
    return;
  }
  
  const enrollRes = await fetch('http://62.171.157.22:8081/api/users/1/enrollments', {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });
  console.log('Enrollments status:', enrollRes.status);
  console.log('Enrollments response:', await enrollRes.text());
}
test();
