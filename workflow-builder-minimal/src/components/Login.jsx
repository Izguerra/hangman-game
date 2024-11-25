/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const containerStyles = css`
  width: 100%;
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const formStyles = css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const inputStyles = css`
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #0066cc;
  }
`;

const buttonStyles = css`
  padding: 0.75rem;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background-color: #0052a3;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const errorStyles = css`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const linkStyles = css`
  text-align: center;
  margin-top: 1rem;
`;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div css={containerStyles}>
      <h2 css={css`text-align: center; margin-bottom: 1.5rem;`}>Log In</h2>
      {error && <div css={errorStyles}>{error}</div>}
      <form onSubmit={handleSubmit} css={formStyles}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          css={inputStyles}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          css={inputStyles}
        />
        <button type="submit" disabled={loading} css={buttonStyles}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <div css={linkStyles}>
        Need an account? <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
}
