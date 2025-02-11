import React from "react";
import toast from "react-hot-toast";
import { AiOutlineUpload } from "react-icons/ai";
import { Button } from "src/components/Button";
import { Input } from "src/components/Input";
import { Modal, ModalProps } from "src/components/Modal";
import useJson from "src/store/useJson";
import styled from "styled-components";

const StyledModalContent = styled(Modal.Content)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const StyledUploadWrapper = styled.label`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.BACKGROUND_SECONDARY};
  border: 2px dashed ${({ theme }) => theme.BACKGROUND_TERTIARY};
  border-radius: 5px;
  width: 100%;
  min-height: 200px;
  padding: 16px;
  cursor: pointer;

  input[type="file"] {
    display: none;
  }
`;

const StyledFileName = styled.span`
  padding-top: 14px;
  color: ${({ theme }) => theme.INTERACTIVE_NORMAL};
`;

const StyledUploadMessage = styled.h3`
  color: ${({ theme }) => theme.INTERACTIVE_ACTIVE};
  margin-bottom: 0;
`;

export const ImportModal: React.FC<ModalProps> = ({ visible, setVisible }) => {
  const setJson = useJson(state => state.setJson);
  const [url, setURL] = React.useState("");
  const [jsonFile, setJsonFile] = React.useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setJsonFile(e.target.files?.item(0));
  };

  const handleFileDrag = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();

    if (e.type === 'drop' && e.dataTransfer.files.length) {
      if (e.dataTransfer.files[0].type === 'application/json') {
        setJsonFile(e.dataTransfer.files[0])
      } else {
        toast.error('Please upload JSON file!')
      }
    }
  }

  const handleImportFile = () => {
    if (url) {
      setJsonFile(null);

      toast.loading("Loading...", { id: "toastFetch" });
      return fetch(url)
        .then(res => res.json())
        .then(json => {
          setJson(JSON.stringify(json, null, 2));
          setVisible(false);
        })
        .catch(() => toast.error("Failed to fetch JSON!"))
        .finally(() => toast.dismiss("toastFetch"));
    }

    if (jsonFile) {
      const reader = new FileReader();

      reader.readAsText(jsonFile, "UTF-8");
      reader.onload = function (data) {
        setJson(data.target?.result as string);
        setVisible(false);
      };
    }
  };

  return (
    <Modal visible={visible} setVisible={setVisible}>
      <Modal.Header>Import JSON</Modal.Header>
      <StyledModalContent>
        <Input
          value={url}
          onChange={e => setURL(e.target.value)}
          type="url"
          placeholder="URL of JSON to fetch"
          autoFocus
        />
        <StyledUploadWrapper
          onDrop={handleFileDrag}
          onDragOver={handleFileDrag}
        >
          <input
            key={jsonFile?.name}
            onChange={handleFileChange}
            type="file"
            accept="application/JSON"
          />
          <AiOutlineUpload size={48} />
          <StyledUploadMessage>Click Here to Upload JSON</StyledUploadMessage>
          <StyledFileName>{jsonFile?.name ?? "None"}</StyledFileName>
        </StyledUploadWrapper>
      </StyledModalContent>
      <Modal.Controls setVisible={setVisible}>
        <Button status="SECONDARY" onClick={handleImportFile} disabled={!(jsonFile || url)}>
          Import
        </Button>
      </Modal.Controls>
    </Modal>
  );
};
