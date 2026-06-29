async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser12345@example.com',
        password: 'password',
        role: 'STUDENT',
        enrollmentNo: '8888',
        departmentId: '1'
      })
    });
    const data = await res.json();
    console.log(res.status, data);
  } catch (err) {
    console.error(err.message);
  }
}
test();
