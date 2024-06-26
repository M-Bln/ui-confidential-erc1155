import { FhevmInstance } from 'fhevmjs';
import React, { useState } from 'react';

import { AccessConfidentialData } from './access-confidential-data';

interface AccessConfidentialContentProps {
  instance: FhevmInstance;
  signerAddress: string;
  token: { publicKey: Uint8Array; signature: string };
}

export const AccessConfidentialContent: React.FC<
  AccessConfidentialContentProps
> = ({ instance, signerAddress, token }) => {
  //const [tokenId, setTokenId] = useState<string | null >(null)
  const [cid, setCid] = useState<string | null>(null);
  const [cidInputField, setCidInputField] = useState<string>('');
  const [encryptedFile, setEncryptedFile] = useState<Uint8Array | null>(null);
  // const [clearFile, setClearFile] = useState<Uint8Array>(new Uint8Array(0));
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const loadEncryptedFile = async () => {
    try {
      setCid(cidInputField);
      const response = await fetch(
        `https://cloudflare-ipfs.com/ipfs/${cidInputField}`,
      );

      const data = await response.arrayBuffer();
      const fileAsUint8Array = new Uint8Array(data);
      setEncryptedFile(fileAsUint8Array);
      setLoadingError(null);
    } catch (error) {
      setLoadingError('Error fetching encrypted file' + (error as string));
    }
  };

  const decryptFile = async () => {
    if (encryptedFile && encryptionKey.length > 0) {
      // Convert the encryption key back to a Uint8Array
      const key = new Uint8Array(
        (encryptionKey.match(/.{1,2}/g) || []).map((byte) =>
          parseInt(byte, 16),
        ),
      );
      console.log('get key: ', key);
      // Decrypt the file
      const iv = encryptedFile.slice(0, 12);
      const data = encryptedFile.slice(12);
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        key,
        'AES-GCM',
        false,
        ['decrypt'],
      );
      const decryptedFile = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        data,
      );
      const decryptedFileAsUint8Array = new Uint8Array(decryptedFile);

      // Create a Blob from the decrypted file
      const blob = new Blob([decryptedFileAsUint8Array]);

      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);

      // Create a link element
      const link = document.createElement('a');

      // Set the link's href to the Blob URL
      link.href = url;

      // Set the download attribute to the desired file name
      link.download = 'decrypted-file';

      // Append the link to the body
      document.body.appendChild(link);

      // Programmatically click the link to start the download
      link.click();

      // Remove the link from the body
      document.body.removeChild(link);
    }
  };

  return (
    <div className="primary-light-rounded relative">
      <h1 className="h1 mb-0 border-b-2 border-primary-dark">
        Access Confidential Content
      </h1>

      <div className="mb-4 flex items-center space-x-4">
        <label
          htmlFor="CID"
          className="block text-neutral-dark text-lg font-bold mb-2"
        >
          CID:
        </label>
        <input
          type="text"
          id="CID"
          onChange={(e) => setCidInputField(e.target.value)}
          className="input-field flex-grow"
        />
        <button
          disabled={cidInputField === ''}
          onClick={loadEncryptedFile}
          className="button ml-auto"
        >
          Load encrypted file
        </button>
      </div>
      {loadingError && <div className="text-red-500 mb-4">{loadingError}</div>}

      {cid && encryptedFile && (
        <AccessConfidentialData
          instance={instance}
          cid={cid}
          token={token}
          signerAddress={signerAddress}
          setEncryptionKey={setEncryptionKey}
        />
      )}
      {encryptedFile && encryptionKey !== '' && (
        <div className="flex justify-center">
          <button onClick={decryptFile} className="button">
            Decrypt content
          </button>
        </div>
      )}
    </div>
  );
};
