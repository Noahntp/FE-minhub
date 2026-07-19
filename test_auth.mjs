async function test() {
  const loginRes = await fetch('http://62.171.157.22:8081/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token || loginData.session_token || loginData.data?.token || loginData.data?.session_token;
  
  if (!token) {
    console.log('Login failed:', loginData);
    return;
  }
  
  const lessonRes = await fetch('http://62.171.157.22:8081/api/learn/lessons/1', {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });
  console.log('Lesson status:', lessonRes.status);
  console.log('Lesson response:', await lessonRes.text());
}
test();
