/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useRef, useState } from 'react';

const canvasStyles = css`
  flex: 1;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  margin: 1rem;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
`;

const nodeStyles = css`
  position: absolute;
  background-color: white;
  border: 1px solid #0066cc;
  border-radius: 4px;
  padding: 1rem;
  min-width: 150px;
  cursor: move;
  user-select: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

export default function WorkflowCanvas() {
  const [nodes, setNodes] = useState([]);
  const [draggingNode, setDraggingNode] = useState(null);
  const canvasRef = useRef(null);

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newNode = {
        id: Date.now(),
        x: e.clientX - rect.left - 75,
        y: e.clientY - rect.top - 25,
        title: `Node ${nodes.length + 1}`,
      };
      setNodes([...nodes, newNode]);
    }
  };

  const handleNodeMouseDown = (e, node) => {
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    setDraggingNode({
      node,
      offsetX: e.clientX - (rect.left + node.x),
      offsetY: e.clientY - (rect.top + node.y),
    });
  };

  const handleMouseMove = (e) => {
    if (draggingNode) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - draggingNode.offsetX;
      const y = e.clientY - rect.top - draggingNode.offsetY;

      setNodes(nodes.map(node => 
        node.id === draggingNode.node.id
          ? { ...node, x, y }
          : node
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  return (
    <div
      ref={canvasRef}
      css={canvasStyles}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {nodes.map(node => (
        <div
          key={node.id}
          css={[nodeStyles, css`
            left: ${node.x}px;
            top: ${node.y}px;
          `]}
          onMouseDown={(e) => handleNodeMouseDown(e, node)}
        >
          {node.title}
        </div>
      ))}
    </div>
  );
}
