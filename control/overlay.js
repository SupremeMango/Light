const supabaseUrl = 'https://vpxnqmcerpsveoykztjg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweG5xbWNlcnBzdmVveWt6dGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNzE1NTIsImV4cCI6MjA5MDk0NzU1Mn0.BMwGIkKIHqnCMsV6YdtZzxBeIy6vJuPFgUPrMuOS56A'
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 2. The Login Function
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        errorEl.innerText = error.message;
        errorEl.classList.remove('hidden');
    } else {
        document.getElementById('login-overlay').classList.add('hidden');
        console.log("Success!");
    }
}

// 3. Make it visible to the HTML button
window.handleLogin = handleLogin;

// 4. Check if already logged in
async function checkUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
        document.getElementById('login-overlay').classList.add('hidden');
    }
}
checkUser();