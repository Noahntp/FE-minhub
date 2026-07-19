import axios from 'axios';

const api = axios.create({
  baseURL: 'http://62.171.157.22:8081/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

async function run() {
  try {
    const res = await api.post('/auth/login', {
      email: 'student@example.com', // A mock student
      password: 'password'
    });
    const token = res.data.data.token || res.data.token;
    console.log("Logged in:", token.substring(0, 10));
    
    // Now try fetching the lesson
    const lessonRes = await api.get('/learn/lessons/1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Lesson response:", JSON.stringify(lessonRes.data, null, 2));
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
run();
