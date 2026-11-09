import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { fetchMyProfile, updateMyProfile } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useApi } from "../hooks/useApi";
import type { ProfileUpdate, User } from "../types";
import { initials } from "../utils/format";
import PageMessage from "../components/ui/PageMessage";

function Profile() {
  const { user: authUser, token, logout } = useAuth();
  const { data: profile, setData: setProfile } = useApi(
    (signal) => fetchMyProfile(token!, signal),
    [token],
    {
      enabled: Boolean(token),
    },
  );

  if (!profile) return <PageMessage>Laddar profil...</PageMessage>;

  const fullName = `${profile.first_name} ${profile.last_name}`;

  return (
    <main>
      <section className="profile-page">
        <div className="profile-header">
          <p className="eyebrow">Mitt konto</p>
          <h1>Min profil</h1>
        </div>

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-avatar">{initials(fullName)}</div>
            <h2>{fullName}</h2>
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

          <ProfileForm profile={profile} onSaved={setProfile} />
        </div>
      </section>
    </main>
  );
}

interface ProfileFormProps {
  profile: User;
  onSaved: (profile: User) => void;
}

function ProfileForm({ profile, onSaved }: ProfileFormProps) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileUpdate>({
    first_name: profile.first_name,
    last_name: profile.last_name,
    address: profile.address ?? "",
    postal_code: profile.postal_code ?? "",
    city: profile.city ?? "",
  });

  function field(name: keyof ProfileUpdate) {
    return {
      value: form[name],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((current) => ({ ...current, [name]: e.target.value })),
    };
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    try {
      onSaved(await updateMyProfile(token, form));
      showToast("Sparat. Adressen fylls i automatiskt i kassan.");
    } catch (err) {
      console.error(err);
      showToast("Kunde inte spara ändringarna.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="profile-content" onSubmit={handleSave}>
      <div className="profile-card">
        <h2>Profiluppgifter</h2>
        <div className="profile-form">
          <label>
            Förnamn
            <input type="text" {...field("first_name")} required />
          </label>

          <label>
            Efternamn
            <input type="text" {...field("last_name")} required />
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
            <input type="text" {...field("address")} />
          </label>

          <label>
            Postnummer
            <input type="text" {...field("postal_code")} />
          </label>

          <label>
            Stad
            <input type="text" {...field("city")} />
          </label>
        </div>
      </div>

      <button className="button button-primary" type="submit" disabled={saving}>
        {saving ? "Sparar..." : "Spara ändringar"}
      </button>
    </form>
  );
}

export default Profile;
