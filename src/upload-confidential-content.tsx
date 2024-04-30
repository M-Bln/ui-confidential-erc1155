import React, { useState, useCallback } from "react";
import { ethers } from "ethers";
import { Web3Auth } from "./web3-auth";
import { EncryptFile } from "./encrypt-file";
import { UploadToCrustIpfs } from "./upload-to-crust-ipfs";
import { UploadToLighthouse } from "./upload-to-lighthouse";
import { DelegatedUpload } from "./delegated-upload";
import { ContractInteractions } from "./contract-interactions";

// interface ProviderSignerProps {
//     provider: ethers.Provider;
//     signer: ethers.Signer;
// }

export function UploadConfidentialContent() {
    const [authHeader, setAuthHeader] = useState<string | null>(null);
    const [fileSelected, setFileSelected] = useState<boolean>(false);
    const [file, setFile] = useState<Uint8Array>(new Uint8Array(0));
    const [fileCid, setFileCid] = useState<string | null>(null);
    const [encryptedFile, setEncryptedFile] = useState<Uint8Array>(new Uint8Array(0));
    const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
    const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const fileToUpload = e.target.files?.[0];
        
        if (fileToUpload) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const arrayBuffer = reader.result as ArrayBuffer;
                const fileAsUint8Array = new Uint8Array(arrayBuffer);
                setFile(fileAsUint8Array);
            };
            reader.readAsArrayBuffer(fileToUpload);
            setFileSelected(true);
        }

    }, [file])
    return (
        <div>
            <h1>Mint Confidential Content</h1>
            <h2>Encrypt content</h2>
            <div>Choose a file to encrypt and upload <input type="file" onChange={handleFile} /></div>
            {fileSelected && !encryptionKey && <EncryptFile file={file} setEncryptedFile={setEncryptedFile} setEncryptionKey={setEncryptionKey}/>}
            {encryptionKey && <div>The file was encrypted with this private key: {encryptionKey}</div>}
            <DelegatedUpload encryptedFile = {encryptedFile} setFileCid = {setFileCid} />
            <UploadToLighthouse encryptedFile = {encryptedFile} setFileCid ={setFileCid} fileCid={fileCid} />
            {fileCid && <div>Encrypted content CID: {fileCid}</div>}
            {fileCid && <ContractInteractions  />}
        </div>
    )
    //            {!authHeader && <Web3Auth provider={provider} signer={signer} setAuthHeader={setAuthHeader}/>}
    // {authHeader && <UploadToCrustIpfs encryptedFile = {encryptedFile} authHeader={authHeader} />}
}