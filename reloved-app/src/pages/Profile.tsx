import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { fetchMyProfile, updateMyProfile } from "../api/client";
import type { User } from "../types";

function Profile() {
  const { user: authUser, token, logout } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<User | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchMyProfile(token).then((data) => {
      setProfile(data);
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setAddress(data.address ?? "");
      setPostalCode(data.postal_code ?? "");
      setCity(data.city ?? "");
    });
  }, [token]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    try {
      const updated = await updateMyProfile(token, {
        first_name: firstName,
        last_name: lastName,
        address,
        postal_code: postalCode,
        city,
      });
      setProfile(updated);
      showToast("Dina uppgifter är sparade!");
    } catch (err) {
      console.error(err);
      showToast("Kunde inte spara ändringarna.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <main>
        <p> Laddar profil ...</p>
      </main>
    );
  }

  const initials =
    `${profile.first_name[0] ?? ""}${profile.last_name[0] ?? ""}`.toUpperCase();

  return (
    <main>
      <section className="profile-page">
        <div className="profile-header">
          <p className="eyebrow">Mitt konto</p>
          <h1>Min profil</h1>
          <p>Hantera dina uppgifter och navigera till dina sidor.</p>
        </div>

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-avatar">{initials}</div>
            <h2>
              {profile.first_name} {profile.last_name}
            </h2>
            <p>{profile.email}</p>

            <nav className="profile-menu" aria-label="Kontomeny">
              <Link to="/orders">Mina ordrar</Link>
              <Link to="/seller">Säljarpanel</Link>
              {authUser?.role === "admin" && (
                <Link to="/admin">Adminpanel</Link>
              )}
              <button type="button" onClick={logout}>
                Logga ut
              </button>
            </nav>
          </aside>

          <form className="profile-content" onSubmit={handleSave}>
            <div className="profile-card">
              <h2>Profiluppgifter</h2>
              <div className="profile-form">
                <label>
                  Förnamn
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Efternamn
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </label>

                <label className="profile-form__full">
                  E-post
                  <input type="email" value={profile.email} disabled />
                </label>
              </div>
            </div>

            <div className="profile-card">
              <h2>Leveransadress</h2>
              <div className="profile-form">
                <label className="profile-form__full">
                  Adress
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </label>

                <label>
                  Postnummer
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </label>

                <label>
                  Stad
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </label>
              </div>
            </div>

            <button
              className="button button-primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Sparar..." : "Spara ändringar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Profile;
