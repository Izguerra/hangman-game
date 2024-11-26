/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

const toolbarStyles = css`
  padding: 1rem;
  background-color: white;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const buttonStyles = css`
  padding: 0.5rem 1rem;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: #0052a3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

export default function Toolbar({ onSave, onClear }) {
  return (
    <div css={toolbarStyles}>
      <button css={buttonStyles} onClick={onSave}>
        💾 Save Workflow
      </button>
      <button css={buttonStyles} onClick={onClear}>
        🗑️ Clear Canvas
      </button>
    </div>
  );
}
