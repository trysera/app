import { useRouter } from "next/router";
import { useEffect } from "react";
import Arweave from "arweave";
import { useModal, Page, Button, Text, Modal, Card } from "@geist-ui/react";
import Head from "next/head";
import { FileIcon } from "@primer/octicons-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const keyfile = localStorage.getItem("keyfile");
    if (router.asPath === "/" && keyfile) router.push("/dashboard");
  }, []);

  const client = new Arweave({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  });

  const { setVisible, bindings } = useModal();

  return (
    <Page>
      <Head>
        <title>Sera / Home</title>
      </Head>
      <Button auto size="large" onClick={() => setVisible(true)}>
        Sign In
      </Button>
      <Text className="hero gradient">
        Encrypted
        <br />
        Decentralised
        <br />P A S S W O R D S
      </Text>
      <Modal {...bindings}>
        <Modal.Title>Sign In</Modal.Title>
        <Modal.Subtitle style={{ textTransform: "none" }}>
          Use your{" "}
          <a
            href="https://www.arweave.org/wallet"
            target="_blank"
            rel="noopener noreferrer"
          >
            Arweave keyfile
          </a>{" "}
          to continue
        </Modal.Subtitle>
        <Modal.Content>
          <Card
            style={{ border: "1px dashed #333", cursor: "pointer" }}
            onClick={() => document.getElementById("file").click()}
          >
            <FileIcon size={24} /> Upload your keyfile
          </Card>
        </Modal.Content>
        <Modal.Action passive onClick={() => setVisible(false)}>
          Cancel
        </Modal.Action>
      </Modal>
      <input
        type="file"
        id="file"
        accept=".json,application/json"
        onChange={(ev) => {
          const reader = new FileReader();
          reader.onload = async () => {
            const jwk = JSON.parse(reader.result.toString());
            const addr = await client.wallets.jwkToAddress(jwk);

            localStorage.setItem("keyfile", JSON.stringify(jwk));
            localStorage.setItem("address", addr);

            router.push("/dashboard");
          };
          reader.readAsText(ev.target.files[0]);
        }}
      />
      <style jsx>{`
        #file {
          opacity: 0;
        }
      `}</style>
    </Page>
  );
}
