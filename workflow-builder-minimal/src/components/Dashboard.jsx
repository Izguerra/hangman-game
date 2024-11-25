/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import WorkflowBuilder from './workflow/WorkflowBuilder';

const headerStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  border-bottom: 1px solid #dee2e6;
`;

const buttonStyles = css`
  padding: 0.75rem 1.5rem;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background-color: #0052a3;
  }
`;

const mainStyles = css`
  height: calc(100vh - 64px);
  background-color: #f5f5f5;
`;

const userEmailStyles = css`
  margin-right: 1rem;
  color: #666;
`;

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  return (
    <div css={css`height: 100vh; display: flex; flex-direction: column;`}>
      <header css={headerStyles}>
        <h1 css={css`margin: 0; font-size: 1.5rem;`}>Workflow Builder</h1>
        <div css={css`display: flex; align-items: center;`}>
          <span css={userEmailStyles}>{currentUser?.email}</span>
          <button onClick={handleLogout} css={buttonStyles}>
            Log Out
          </button>
        </div>
      </header>
      <main css={mainStyles}>
        <WorkflowBuilder />
      </main>
    </div>
  );
}
