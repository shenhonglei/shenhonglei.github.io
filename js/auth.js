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

  function getLang() {
    var path = window.location.pathname;
    if (path.indexOf('/zh/') !== -1) return 'zh';
    if (path.indexOf('/en/') !== -1) return 'en';
    var htmlLang = document.documentElement.lang || '';
    if (htmlLang.indexOf('zh') === 0) return 'zh';
    return 'en';
  }

  function redirectToLogin() {
    var lang = getLang();
    var returnTo = encodeURIComponent(window.location.pathname);
    window.location.href = '/' + lang + LOGIN_PATH + '?return=' + returnTo;
  }

  function renderUserUI() {
    var containers = document.querySelectorAll('[data-auth-ui]');
    var lang = getLang();

    containers.forEach(function (el) {
      if (currentUser) {
        var email = currentUser.email || '';
        el.innerHTML =
          '<span class="auth-user-email">' +
          email +
          '</span>' +
          '<a href="#" class="auth-logout-btn" onclick="authLogout();return false">' +
          (lang === 'zh' ? '退出' : 'Logout') +
          '</a>';
      } else {
        var loginLabel = lang === 'zh' ? '登录' : 'Login';
        var registerLabel = lang === 'zh' ? '注册' : 'Register';
        el.innerHTML =
          '<a href="/' +
          lang +
          LOGIN_PATH +
          '" class="auth-login-btn" style="margin-right:10px">' +
          loginLabel +
          '</a>' +
          '<a href="/' +
          lang +
          LOGIN_PATH +
          '?mode=register" class="auth-register-btn">' +
          registerLabel +
          '</a>';
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
        window.location.href = returnTo || '/' + getLang() + '/';
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
