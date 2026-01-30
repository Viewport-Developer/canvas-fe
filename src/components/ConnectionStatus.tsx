import styled from "styled-components";

const CopyButton = styled.button`
  position: fixed;
  top: 24px;
  right: 12px;
  padding: 4px 10px;
  background: #45b975;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  z-index: 10000;

  &:hover {
    background: #44a16a;
  }
`;

const CopyLink = () => {
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return <CopyButton onClick={handleCopyUrl}>URL 복사</CopyButton>;
};

export default CopyLink;
