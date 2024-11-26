/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const formStyles = css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  width: 100%;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const inputStyles = css`
  padding: 0.75rem;
  border: 1px solid #ddd;
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
  color: #0066cc;
  text-decoration: none;
  font-size: 0.875rem;
  &:hover {
    text-decoration: underline;
  }
`;

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create account: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div css={css`
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    `}>
      <form css={formStyles} onSubmit={handleSubmit}>
        <h2 css={css`margin: 0 0 1rem;`}>Sign Up</h2>
        {error && <div css={errorStyles}>{error}</div>}
        <input
          type="email"
          placeholder="Email"
          css={inputStyles}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          css={inputStyles}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          css={inputStyles}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button 
          type="submit" 
          css={buttonStyles}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
        <div css={css`text-align: center;`}>
          Already have an account? <Link to="/login" css={linkStyles}>Log In</Link>
        </div>
      </form>
    </div>
  );
}
