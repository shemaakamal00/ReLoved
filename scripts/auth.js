import { registerUser, loginUser } from "./api.js";

const AUTH_KEY = "reloved-auth";

export function getCurrentUser() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveAuth(user, token) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ user, token }));
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  alert("Du är nu utloggad.");
  window.location.href = "home.html";
}

export function setupRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      alert("Lösenorden matchar inte");
      return;
    }

    try {
      const { user, token } = await registerUser(
        formData.get("name"),
        formData.get("email"),
        password,
      );
      saveAuth(user, token);
      alert(`Välkommen till ReLoved, ${user.first_name}!`);
      window.location.href = "home.html";
    } catch (err) {
      alert(err.message);
    }
  });
}

export function setupLoginForm() {
  const form = document.getElementById("login-form");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    try {
      const { user, token } = await loginUser(
        formData.get("email"),
        formData.get("password"),
      );
      saveAuth(user, token);
      alert(`Välkommen tillbaka, ${user.first_name}!`);
      window.location.href = "home.html";
    } catch (err) {
      alert(err.message);
    }
  });
}

export function renderProfilePage() {
  const profileAvatar = document.querySelector(".profile-avatar");
  if (!profileAvatar) return;

  const auth = getCurrentUser();
  if (!auth) {
    window.location.href = "login.html";
    return;
  }

  const { user } = auth;
  const initials =
    `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();
  profileAvatar.textContent = initials;
  document.querySelector(".profile-sidebar h2").textContent =
    `${user.first_name} ${user.last_name}`;
  document.querySelector(".profile-sidebar p").textContent = user.email;

  document.getElementById("firstName").value = user.first_name;
  document.getElementById("lastName").value = user.last_name;
  document.getElementById("email").value = user.email;
}
export function setupLogoutLink() {
  const logoutLink = document.getElementById("logout-link");
  if (!logoutLink) return;

  logoutLink.addEventListener("click", (event) => {
    event.preventDefault();
    logout();
  });
}
