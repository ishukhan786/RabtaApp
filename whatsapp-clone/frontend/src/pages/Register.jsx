import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Sparkles, UserPlus } from 'lucide-react';
import { apiRequest } from '../utils/api';

export default function Register() {
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);

    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: form.get('name')?.trim(),
          username: form.get('username')?.trim(),
          email: form.get('email')?.trim(),
          password: form.get('password')?.trim(),
        }),
      });

      setMessage({ type: 'success', text: 'Account created successfully. You can login now.' });
      event.currentTarget.reset();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-showcase">
        <div className="brand-mark">
          <MessageCircle size={26} />
        </div>
        <h1>Start fresh with a beautiful chat space.</h1>
        <p>Create your Rabta account and step into a sharper, faster messaging experience.</p>
        <div className="feature-grid">
          <span><Sparkles size={16} /> Modern chat UI</span>
          <span><Sparkles size={16} /> Group ready</span>
          <span><Sparkles size={16} /> Media sharing</span>
        </div>
      </section>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card-icon">
          <UserPlus size={22} />
        </div>
        <h2>Create account</h2>
        <p>Create your account with a username people can use to add you.</p>
        <label htmlFor="name">Full name</label>
        <input id="name" name="name" placeholder="Your name" required />
        <label htmlFor="username">Username</label>
        <input id="username" name="username" placeholder="Choose a unique username" required />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="Email address" required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" placeholder="Create password" required />
        {message && <div className={`form-alert ${message.type}`}>{message.text}</div>}
        <button className="primary-action" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
        <p className="auth-switch">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}
