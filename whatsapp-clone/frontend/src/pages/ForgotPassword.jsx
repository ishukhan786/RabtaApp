import { Link } from 'react-router-dom';
import { KeyRound, MessageCircle } from 'lucide-react';

export default function ForgotPassword() {
  function handleSubmit(event) {
    event.preventDefault();
    event.currentTarget.reset();
  }

  return (
    <main className="auth-shell">
      <section className="auth-showcase">
        <div className="brand-mark">
          <MessageCircle size={26} />
        </div>
        <h1>Reset access without losing your flow.</h1>
        <p>Enter your account details and set a fresh password to get back into Rabta.</p>
      </section>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card-icon">
          <KeyRound size={22} />
        </div>
        <h2>Renew password</h2>
        <p>Use your username or email and create a new password.</p>
        <label htmlFor="identifier">Username or email</label>
        <input id="identifier" name="identifier" placeholder="Enter username or email" required />
        <label htmlFor="newPassword">New password</label>
        <input id="newPassword" name="newPassword" type="password" placeholder="Enter new password" required />
        <button className="primary-action">Renew password</button>
        <p className="auth-switch">
          Remembered it? <Link to="/login">Back to login</Link>
        </p>
      </form>
    </main>
  );
}
