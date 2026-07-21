const fetch = require('node-fetch');

async function test() {
  const email = `test_${Date.now()}@test.com`;
  console.log('Registering', email);
  const res = await fetch('http://62.171.157.22:8081/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      full_name: 'Test User',
      email: email,
      password: 'password123',
      password_confirmation: 'password123',
      role: 'student'
    })
  });
  
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

test();
