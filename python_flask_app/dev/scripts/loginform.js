const form = document.getElementById('loginForm');
const loadingOverlay = document.getElementById('loadingOverlay');

form.addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent default form submission

  // ✅ Show loading screen
  loadingOverlay.style.display = 'flex';

  const formData = new FormData(form);
  const data = {
    username: formData.get('username'), // Reads username field
    email: formData.get('handle'),      // Reads email/handle field
    password: formData.get('password')
  };

  // ✅ Connects to PostgreSQL Auth API
  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(async response => {
    loadingOverlay.style.display = 'none';

    const result = await response.json();
    const box = document.getElementById('responseBox');

    if (response.ok) {
      // Store logged-in user in session storage and redirect to home
      sessionStorage.setItem('user', JSON.stringify(result.user));
      window.location.href = '/home';
      return;
    }

    // Display error message
    box.style.display = 'block';
    box.style.color = '#e74c3c';
    box.style.marginBottom = '15px';
    box.innerHTML = `<b>Error:</b> ${result.error || 'Login failed'}`;
  })
  .catch(err => {
    loadingOverlay.style.display = 'none';
    console.error('Login Fetch Error:', err);
    alert('Network error during login.');
  });
});
