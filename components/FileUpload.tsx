"use client";
import { IKImage, ImageKitProvider, IKUpload } from "imagekitio-next";
import config from "@/lib/config";
import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

const {
  env: {
    imagekit: { publicKey, urlEndpoint },
  },
} = config;

const authenticator = async () => {
  try {
    const response = await fetch(`${config.env.apiEndpoint}/api/auth/imagekit`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText}`);
    }
    const { signature, token, expire } = await response.json();
    return { signature, token, expire };
  } catch (error: unknown) {
    throw new Error(
      `Authentication request failed. Reason: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

function FileUpload({
  onFileChange,
}: {
  onFileChange: (filePath: string) => void;
}) {
  const ikUploadRef = useRef(null);
  const [file, setFile] = useState<{ filePath: string } | null>(null);

  const onError = (error: unknown) => {
    console.error(error);
    toast.error("Failed to upload file");
  };
  const onSuccess = (res: { filePath: string }) => {
    setFile(res);
    onFileChange(res.filePath);
    toast.success("File uploaded successfully!");
  };

  const handleUpload = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (ikUploadRef.current) {
      (ikUploadRef.current as HTMLInputElement).click();
    }
  };

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <IKUpload
        className="hidden"
        ref={ikUploadRef}
        onError={onError}
        onSuccess={onSuccess}
        fileName="test-upload.png"
      />
      <button className="upload-btn" onClick={handleUpload}>
        <Image
          src="/icons/upload.svg"
          alt="upload-icon"
          width={20}
          height={20}
          className="object-contain"
        />
        <p className="text-base text-light-100">Upload a file</p>
        {file && <p className="upload-filename">{file.filePath}</p>}
      </button>

      {file && <IKImage alt={file.filePath} path={file.filePath} />}
    </ImageKitProvider>
  );
}

export default FileUpload;
