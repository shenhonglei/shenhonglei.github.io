(function () {
  'use strict';

  var SUPABASE_URL = window.SITE_AUTH.supabaseUrl;
  var SUPABASE_KEY = window.SITE_AUTH.supabaseKey;
  var LOGIN_PATH = window.SITE_AUTH.loginPath;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('Auth: Supabase not configured. Skipping auth gate.');
    return;
  }

  var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  var currentUser = null;

  function isLoginPage() {
    return window.location.pathname.indexOf(LOGIN_PATH) !== -1;
  }

  function redirectToLogin() {
    var returnTo = encodeURIComponent(window.location.pathname);
    window.location.href = LOGIN_PATH + '?return=' + returnTo;
  }

  function renderUserUI() {
    var containers = document.querySelectorAll('[data-auth-ui]');

    containers.forEach(function (el) {
      if (currentUser) {
        var email = currentUser.email || '';
        el.innerHTML =
          '<span class="auth-user-email">' +
          email +
          '</span>' +
          '<a href="#" class="auth-logout-btn" onclick="authLogout();return false">退出</a>';
      } else {
        el.innerHTML =
          '<a href="' +
          LOGIN_PATH +
          '" class="auth-login-btn" style="margin-right:10px">登录</a>' +
          '<a href="' +
          LOGIN_PATH +
          '?mode=register" class="auth-register-btn">注册</a>';
      }
    });
  }

  // Listen for auth state changes
  supabase.auth.onAuthStateChange(function (event, session) {
    currentUser = session ? session.user : null;
    if (event === 'SIGNED_IN') {
      if (isLoginPage()) {
        var params = new URLSearchParams(window.location.search);
        var returnTo = params.get('return');
        window.location.href = returnTo || '/';
        return;
      }
    } else if (event === 'SIGNED_OUT') {
      if (!isLoginPage()) {
        redirectToLogin();
      }
    }
    renderUserUI();
  });

  window.authLogout = function () {
    supabase.auth.signOut();
  };

  // Check session on page load (async)
  supabase.auth.getSession().then(function (res) {
    var session = res.data && res.data.session;
    currentUser = session ? session.user : null;

    if (!session && !isLoginPage()) {
      redirectToLogin();
    } else {
      renderUserUI();
      window.authSupabase = supabase;
      document.documentElement.classList.add('auth-ready');
    }
  });
})();
