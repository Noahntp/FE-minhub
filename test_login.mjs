async function test() {
  const res = await fetch('http://62.171.157.22:8081/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: 'student.test@mindhub.local', password: 'password123' })
  });
  const data = await res.json();
  console.log('Login Token:', data.token || data.session_token || data.data?.token || data.data?.session_token);
  
  if (data.data?.token) {
    const enrollRes = await fetch('http://62.171.157.22:8081/api/users/1/enrollments', {
      headers: { 'Authorization': `Bearer ${data.data.token}`, 'Accept': 'application/json' }
    });
    console.log('Enrollments status:', enrollRes.status);
    console.log('Enrollments response:', await enrollRes.text());
  }
}
test();
