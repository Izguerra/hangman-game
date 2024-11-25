/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import WorkflowCanvas from './WorkflowCanvas';
import Toolbar from './Toolbar';

const containerStyles = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
`;

export default function WorkflowBuilder() {
  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving workflow...');
  };

  const handleClear = () => {
    // TODO: Implement clear functionality
    console.log('Clearing canvas...');
  };

  return (
    <div css={containerStyles}>
      <Toolbar onSave={handleSave} onClear={handleClear} />
      <WorkflowCanvas />
    </div>
  );
}
