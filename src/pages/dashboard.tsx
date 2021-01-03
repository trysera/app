import { useState, useEffect } from "react";
import {
  useModal,
  useInput,
  Page,
  Divider,
  Text,
  Button,
  Modal,
  Input,
  Loading,
  Grid,
  Card,
  Spacer,
  Code,
  Row,
  useClipboard,
  useToasts,
  useMediaQuery,
  Table,
} from "@geist-ui/react";
import {
  ClippyIcon,
  ClockIcon,
  FileBinaryIcon,
  InfoIcon,
  KeyIcon,
  LinkIcon,
  PencilIcon,
  PersonIcon,
  ServerIcon,
  ShareAndroidIcon,
  TrashcanIcon,
} from "@primer/octicons-react";
import Router, { useRouter } from "next/router";
import Head from "next/head";
import {
  create,
  edit,
  getFee,
  getPasswords,
  remove,
  share,
} from "@trysera/lib";

function Passwords() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("keyfile")) {
      getPasswords(JSON.parse(localStorage.getItem("keyfile"))).then((res) => {
        setData(res);
        setLoading(false);
      });
    }
  }, []);

  const [id, setID] = useState("");
  const [loadingFee, setLoadingFee] = useState(true);
  const [fee, setFee] = useState(0);

  const [, setToast] = useToasts();
  const { copy } = useClipboard();

  const { setVisible: removeVisible, bindings: removeBindings } = useModal();
  const { setVisible: shareVisible, bindings: shareBindings } = useModal();
  const { setVisible: editVisible, bindings: editBindings } = useModal();

  const {
    state: address,
    reset: resetAddress,
    bindings: addressBindings,
  } = useInput("");

  const {
    state: username,
    reset: resetUsername,
    bindings: usernameBindings,
  } = useInput("");
  const {
    state: password,
    reset: resetPassword,
    bindings: passwordBindings,
  } = useInput("");

  const cleanup = () => {
    editVisible(false);
    resetUsername();
    resetPassword();
  };

  if (loading) return <Loading />;
  return (
    <Grid.Container gap={5} justify="center">
      {data.map((elem, index) => (
        <Grid key={index}>
          <Card hoverable>
            <Text h3>{elem.site}</Text>
            <Row justify="center" align="middle">
              <Text
                style={{ cursor: "pointer" }}
                onClick={() => {
                  copy(elem.password);
                  setToast({ text: "Password copied to clipboard." });
                }}
              >
                <ClippyIcon />
              </Text>
              <Spacer x={1} />
              <Text
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setID(elem.id);
                  shareVisible(true);
                }}
              >
                <ShareAndroidIcon />
              </Text>
              <Spacer x={1} />
              <Text
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setID(elem.id);
                  editVisible(true);
                }}
              >
                <PencilIcon />
              </Text>
              <Spacer x={1} />
              <Text
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setID(elem.id);
                  removeVisible(true);
                }}
              >
                <TrashcanIcon />
              </Text>
            </Row>
            <Text>
              <PersonIcon /> {elem.username}
              <br />
              <KeyIcon /> <span className="blurred">{elem.password}</span>
            </Text>
            <Card.Footer>
              <Text>
                {elem.shared ? <ShareAndroidIcon /> : <FileBinaryIcon />}{" "}
                <Code>{elem.id}</Code>
                <br />
                {elem.mined ? (
                  <>
                    <ServerIcon />{" "}
                    <a
                      target="_blank"
                      href={`https://viewblock.io/arweave/tx/${elem.tx}`}
                    >
                      <Code>{elem.tx}</Code>
                    </a>
                  </>
                ) : (
                  <>
                    <ClockIcon /> <Code>{elem.tx}</Code>
                  </>
                )}
              </Text>
            </Card.Footer>
          </Card>
        </Grid>
      ))}
      <Modal
        {...shareBindings}
        onOpen={async () => {
          setLoadingFee(true);
          setFee(await getFee("share"));
          setLoadingFee(false);
        }}
      >
        <Modal.Title>Share Password</Modal.Title>
        <Modal.Content>
          <Text>
            Password ID: <Code>{id}</Code>
          </Text>
          <Input icon={<PersonIcon />} {...addressBindings} width="100%">
            Wallet Address:
          </Input>
          <Divider />
          {loadingFee ? (
            <Loading />
          ) : (
            <Text>
              Fee: <Code>{fee} AR</Code> ~ <Code>$0.25</Code>
            </Text>
          )}
        </Modal.Content>
        <Modal.Action
          passive
          onClick={() => {
            shareVisible(false);
          }}
        >
          Cancel
        </Modal.Action>
        <Modal.Action
          onClick={async () => {
            const tx = await share(
              id,
              address,
              JSON.parse(localStorage.getItem("keyfile"))
            );

            if (!tx) setToast({ text: "Insufficient balance." });

            resetAddress();
            shareVisible(false);
          }}
          loading={loadingFee}
        >
          Share
        </Modal.Action>
      </Modal>
      <Modal {...editBindings} onClose={cleanup}>
        <Modal.Title>Edit Password</Modal.Title>
        <Modal.Content>
          <Text>
            Password ID: <Code>{id}</Code>
          </Text>
          <Input
            icon={<PersonIcon />}
            {...usernameBindings}
            placeholder={id && data.find((elem) => elem.id === id).username}
            width="100%"
          >
            Username:
          </Input>
          <Input
            icon={<KeyIcon />}
            {...passwordBindings}
            placeholder={id && data.find((elem) => elem.id === id).password}
            width="100%"
          >
            Password:
          </Input>
        </Modal.Content>
        <Modal.Action passive onClick={cleanup}>
          Cancel
        </Modal.Action>
        <Modal.Action
          onClick={async () => {
            await edit(
              id,
              { username, password },
              JSON.parse(localStorage.getItem("keyfile"))
            );

            cleanup();
            Router.reload();
          }}
        >
          Confirm
        </Modal.Action>
      </Modal>
      <Modal {...removeBindings}>
        <Modal.Title>Remove Password</Modal.Title>
        <Modal.Content>
          <Text>
            Password ID: <Code>{id}</Code>
          </Text>
        </Modal.Content>
        <Modal.Action
          passive
          onClick={() => {
            removeVisible(false);
          }}
        >
          Cancel
        </Modal.Action>
        <Modal.Action
          onClick={async () => {
            await remove(id, JSON.parse(localStorage.getItem("keyfile")));

            Router.reload();
          }}
        >
          Confirm
        </Modal.Action>
      </Modal>
    </Grid.Container>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [addr, setAddr] = useState("");

  useEffect(() => {
    const keyfile = localStorage.getItem("keyfile");
    if (router.pathname === "/dashboard" && !keyfile)
      router.push(router.asPath.split(router.pathname)[0] || "/");
    else setAddr(localStorage.getItem("address"));
  }, []);

  const { setVisible, bindings } = useModal();

  const { state: site, reset: resetSite, bindings: siteBindings } = useInput(
    ""
  );
  const {
    state: username,
    reset: resetUsername,
    bindings: usernameBindings,
  } = useInput("");
  const {
    state: password,
    reset: resetPassword,
    bindings: passwordBindings,
  } = useInput("");

  const cleanup = () => {
    setVisible(false);
    resetSite();
    resetUsername();
    resetPassword();
  };

  const [loading, setLoading] = useState(false);
  const [showFee, setShowFee] = useState(false);
  const [fee, setFee] = useState(0);

  const mobile = useMediaQuery("mobile");
  const [, setToast] = useToasts();

  const { setVisible: setFeeVisible, bindings: feeBindings } = useModal();
  const feeData = [
    { amnt: "<= 2", price: "Free" },
    { amnt: "> 2", price: "$0.50 each" },
  ];

  return (
    <Page>
      <Head>
        <title>Sera / Dashboard</title>
      </Head>
      <Row align="middle">
        <svg
          height="25px"
          viewBox="0 0 613 144"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="logo"
        >
          <path
            d="M0 120.6L19.2 95.6C27.6 102.4 35.4667 107.333 42.8 110.4C50.1333 113.467 57.8 115 65.8 115C73.6667 115 79.8 113.8 84.2 111.4C88.7333 109 91 105.667 91 101.4C91 97.5333 89.4667 94.5333 86.4 92.4C83.4667 90.2667 78.5333 88.6 71.6 87.4L40.8 82C29.4667 80 20.7333 75.6667 14.6 69C8.46667 62.3333 5.4 53.8667 5.4 43.6C5.4 30.1333 10.4667 19.5333 20.6 11.8C30.8667 3.93333 44.9333 -7.62939e-06 62.8 -7.62939e-06C73.2 -7.62939e-06 83.6667 1.79999 94.2 5.39999C104.867 9 114 13.8667 121.6 20L103.4 45.4C96.0667 39.6667 88.8667 35.4667 81.8 32.8C74.8667 30.1333 67.7333 28.8 60.4 28.8C53.4667 28.8 47.9333 29.9333 43.8 32.2C39.8 34.3333 37.8 37.2667 37.8 41C37.8 44.4667 39.0667 47.2 41.6 49.2C44.2667 51.0667 48.5333 52.4667 54.4 53.4L83.4 58.2C96.8667 60.3333 107.067 64.8 114 71.6C121.067 78.4 124.6 87.2 124.6 98C124.6 112.133 119.067 123.333 108 131.6C97.0667 139.867 82.1333 144 63.2 144C52 144 40.8 141.933 29.6 137.8C18.5333 133.667 8.66667 127.933 0 120.6ZM160.311 142V1.99999H270.711V31.8H194.711V57H244.911V85.8H194.711V112.2H271.511V142H160.311ZM311.756 142V1.99999H383.356C390.556 1.99999 397.156 3.13333 403.156 5.39999C409.29 7.53332 414.49 10.6 418.756 14.6C423.156 18.4667 426.556 23.1333 428.956 28.6C431.49 34.0667 432.756 40.0667 432.756 46.6C432.756 55.4 430.356 63.2667 425.556 70.2C420.756 77.1333 414.423 82.4 406.556 86L437.156 142H398.756L372.356 91H346.156V142H311.756ZM380.156 31.4H346.156V63H380.156C385.49 63 389.756 61.5333 392.956 58.6C396.29 55.6667 397.956 51.8667 397.956 47.2C397.956 42.5333 396.29 38.7333 392.956 35.8C389.756 32.8667 385.49 31.4 380.156 31.4ZM459.381 142L516.781 1.99999H556.181L612.781 142H575.581L562.781 108.2H508.181L495.181 142H459.381ZM518.581 80.8H552.581L535.781 36L518.581 80.8Z"
            fill="url(#paint0_linear)"
          />
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="0"
              y1="-62"
              x2="536.631"
              y2="311.335"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8DB4FF" stopOpacity="0" />
              <stop offset="1" stopColor="#F4B1AB" />
              <stop offset="1" stopColor="#F4B1AB" />
            </linearGradient>
          </defs>
        </svg>
        {!mobile && (
          <>
            <Spacer x={1} />
            <Button
              auto
              size="small"
              onClick={async () => {
                setLoading(true);

                const _fee = await getFee("create", addr);
                setShowFee(_fee > 0);
                setFee(_fee);

                setLoading(false);
                setVisible(true);
              }}
              loading={loading}
            >
              Add Password
            </Button>
            <Spacer x={1} />
            /
            <Spacer x={1} />
            <Button
              auto
              size="small"
              onClick={() => {
                localStorage.removeItem("address");
                localStorage.removeItem("keyfile");
                Router.push(
                  Router.router.asPath.split(Router.router.pathname)[0] || "/"
                );
              }}
            >
              Sign Out
            </Button>
          </>
        )}
      </Row>
      {mobile && (
        <Row align="middle">
          <Button
            auto
            size="small"
            onClick={async () => {
              setLoading(true);

              const _fee = await getFee("create", addr);
              setShowFee(_fee > 0);
              setFee(_fee);

              setLoading(false);
              setVisible(true);
            }}
            loading={loading}
          >
            Add Password
          </Button>
          <Spacer x={1} />
          /
          <Spacer x={1} />
          <Button
            auto
            size="small"
            onClick={() => {
              localStorage.removeItem("address");
              localStorage.removeItem("keyfile");
              Router.push(
                Router.router.asPath.split(Router.router.pathname)[0] || "/"
              );
            }}
          >
            Sign Out
          </Button>
        </Row>
      )}
      <Spacer y={0.5} />
      <Text
        h4
        style={{
          fontFamily:
            "Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace",
        }}
      >
        Wallet:{" "}
        <a
          target="_blank"
          href={`https://viewblock.io/arweave/address/${addr}`}
        >
          <Code>{addr}</Code>
        </a>
      </Text>
      <Spacer y={2} />
      <Passwords />
      <Modal {...bindings} onClose={cleanup}>
        <Modal.Title>Add Password</Modal.Title>
        <Modal.Content>
          <Input icon={<LinkIcon />} {...siteBindings} width="100%">
            Website:
          </Input>
          <Input icon={<PersonIcon />} {...usernameBindings} width="100%">
            Username:
          </Input>
          <Input icon={<KeyIcon />} {...passwordBindings} width="100%">
            Password:
          </Input>
          {showFee && (
            <>
              <Divider />
              <Text>
                Fee: <Code>{fee} AR</Code> ~ <Code>$0.50</Code>{" "}
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setVisible(false);
                    setFeeVisible(true);
                  }}
                >
                  <InfoIcon />
                </span>
              </Text>
            </>
          )}
        </Modal.Content>
        <Modal.Action passive onClick={cleanup}>
          Cancel
        </Modal.Action>
        <Modal.Action
          onClick={async () => {
            const tx = await create(
              { site, username, password },
              JSON.parse(localStorage.getItem("keyfile"))
            );

            if (!tx) setToast({ text: "Insufficient balance." });

            cleanup();
            if (tx) Router.reload();
          }}
        >
          Confirm
        </Modal.Action>
      </Modal>
      <Modal
        {...feeBindings}
        onClose={() => {
          setFeeVisible(false);
          setVisible(true);
        }}
      >
        <Modal.Title>Fee Info</Modal.Title>
        <Modal.Content>
          <Table data={feeData}>
            <Table.Column prop="amnt" label="Amount of Passwords" />
            <Table.Column prop="price" label="Price" />
          </Table>
        </Modal.Content>
        <Modal.Action
          onClick={() => {
            setFeeVisible(false);
            setVisible(true);
          }}
        >
          Got it
        </Modal.Action>
      </Modal>
    </Page>
  );
}
