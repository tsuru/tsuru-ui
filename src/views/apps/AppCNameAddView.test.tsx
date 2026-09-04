import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import AppCNameAddView from "./AppCNameAddView";
import config from "../../config";
import * as appHooks from "../../hooks/app";

jest.mock("../../hooks/app");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ name: "test-app" }),
  useNavigate: () => jest.fn(),
}));

// The DNS/certificate doc cards, the DNS portal link and the certificate
// issuers are deployment-specific config, so the view is exercised against a
// fixed fixture instead of whatever the bundled config happens to ship.
jest.mock("../../config", () => ({
  __esModule: true,
  default: {
    ...jest.requireActual("../../configDefaults").default,
    certificateIssuers: [
      {
        value: "test-lets-encrypt",
        label: "Let's Encrypt",
        description: "Ideal for most internet-facing applications.",
        cost: "Free",
        recommended: true,
      },
      {
        value: "test-internal-ca",
        label: "Internal CA",
        description: "For systems not accessed by browsers.",
        cost: "Free",
      },
    ],
    cnameDnsDocs: {
      title: "DNS Zone Standards",
      description: "Understand the DNS zone tree and naming conventions.",
      url: "https://docs.example.com/dns-zones",
      checkboxLabel: "I have read the DNS zone standards",
    },
    cnameCertDocs: {
      title: "Certificate Manager",
      description: "Learn about supported issuers.",
      url: "https://docs.example.com/certificates",
      checkboxLabel: "I have read the certificate documentation",
    },
    cnameDnsPortalURL: "https://dns.example.com/",
  },
}));

jest.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: { children: string }) => <pre>{children}</pre>,
}));
jest.mock("react-syntax-highlighter/dist/esm/styles/prism", () => ({
  oneDark: {},
}));

const mockAddCName = jest.fn();
const mockSetCertIssuer = jest.fn();

const mockUseAddCName = appHooks.useAddCName as jest.MockedFunction<
  typeof appHooks.useAddCName
>;
const mockUseSetCertIssuer = appHooks.useSetCertIssuer as jest.MockedFunction<
  typeof appHooks.useSetCertIssuer
>;

// Mutable so individual tests can drop the optional doc cards.
const mutableConfig = config as {
  cnameDnsDocs?: unknown;
  cnameCertDocs?: unknown;
};
const { cnameDnsDocs, cnameCertDocs } = mutableConfig;

const TEST_CNAME = "myapp.example.com";

const acknowledgeDnsDocs = () => {
  fireEvent.click(screen.getByLabelText(/I have read the DNS zone standards/i));
};

const acknowledgeCertDocs = () => {
  fireEvent.click(
    screen.getByLabelText(/I have read the certificate documentation/i)
  );
};

const enterCName = (value: string) => {
  fireEvent.change(screen.getByLabelText(/Hostname/i), {
    target: { value },
  });
};

const clickMethodCard = (name: string) => {
  fireEvent.click(screen.getByRole("button", { name: new RegExp(name, "i") }));
};

describe("AppCNameAddView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mutableConfig.cnameDnsDocs = cnameDnsDocs;
    mutableConfig.cnameCertDocs = cnameCertDocs;
    mockAddCName.mockResolvedValue(undefined);
    mockSetCertIssuer.mockResolvedValue(undefined);
    mockUseAddCName.mockReturnValue(mockAddCName);
    mockUseSetCertIssuer.mockReturnValue(mockSetCertIssuer);
  });

  const renderView = () =>
    render(
      <BrowserRouter>
        <AppCNameAddView />
      </BrowserRouter>
    );

  test("renders DNS doc card in step 1 and hides hostname input", () => {
    renderView();

    expect(screen.getByText("1. CNAME")).toBeInTheDocument();
    expect(screen.getByText("DNS Zone Standards")).toBeInTheDocument();

    // DNS doc link
    const dnsLink = screen.getByRole("link", { name: /open/i });
    expect(dnsLink).toHaveAttribute(
      "href",
      "https://docs.example.com/dns-zones"
    );

    // Hostname input not visible until DNS doc acknowledged
    expect(screen.queryByText("2. Certificate")).not.toBeVisible();
  });

  test("shows hostname input after acknowledging DNS docs", () => {
    renderView();

    acknowledgeDnsDocs();

    expect(screen.getByLabelText(/Hostname/i)).toBeInTheDocument();
    expect(screen.getByText(/Open DNS Portal/i)).toBeInTheDocument();
  });

  test("skips the doc cards when they are not configured", () => {
    mutableConfig.cnameDnsDocs = undefined;
    mutableConfig.cnameCertDocs = undefined;

    renderView();

    expect(screen.queryByText("DNS Zone Standards")).not.toBeInTheDocument();
    expect(screen.queryByText("Certificate Manager")).not.toBeInTheDocument();

    // Hostname input is available right away, and the certificate step opens
    // as soon as the CNAME is valid.
    enterCName(TEST_CNAME);

    expect(screen.getByText("2. Certificate")).toBeVisible();
    expect(screen.getAllByText(/Let's Encrypt/i).length).toBeGreaterThan(0);
  });

  test("shows validation error for invalid hostname", () => {
    renderView();

    acknowledgeDnsDocs();
    enterCName("nodotshere");

    expect(screen.getByText(/Enter a valid hostname/i)).toBeInTheDocument();
  });

  test("shows cert doc card in step 2 after valid CNAME", () => {
    renderView();

    acknowledgeDnsDocs();
    enterCName(TEST_CNAME);

    expect(screen.getByText("2. Certificate")).toBeInTheDocument();
    expect(screen.getByText("Certificate Manager")).toBeInTheDocument();

    // Issuer options not visible until cert doc acknowledged
    expect(screen.queryByText(/Let's Encrypt/i)).not.toBeVisible();
  });

  test("shows issuer selector after acknowledging cert docs", () => {
    renderView();

    acknowledgeDnsDocs();
    enterCName(TEST_CNAME);
    acknowledgeCertDocs();

    expect(screen.getAllByText(/Let's Encrypt/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/No certificate/i).length).toBeGreaterThan(0);
  });

  test("shows completion method step after CNAME + cert docs + issuer", () => {
    renderView();

    acknowledgeDnsDocs();
    enterCName(TEST_CNAME);
    acknowledgeCertDocs();

    expect(screen.getByText("3. Completion Method")).toBeInTheDocument();
  });

  test("browser path: submits CNAME + issuer and shows success", async () => {
    renderView();

    acknowledgeDnsDocs();
    enterCName(TEST_CNAME);
    acknowledgeCertDocs();
    clickMethodCard("Web Interface");

    fireEvent.click(screen.getByRole("button", { name: /Add CNAME/i }));

    await waitFor(() => expect(mockAddCName).toHaveBeenCalledWith(TEST_CNAME));
    expect(mockSetCertIssuer).toHaveBeenCalledWith(
      TEST_CNAME,
      "test-lets-encrypt"
    );

    await waitFor(() => {
      expect(screen.getByText(/CNAME Added Successfully/i)).toBeInTheDocument();
    });
  });

  test("browser path: CNAME-only (no certificate) skips certissuer call", async () => {
    renderView();

    acknowledgeDnsDocs();
    enterCName(TEST_CNAME);
    acknowledgeCertDocs();

    fireEvent.click(screen.getByText(/No certificate/i));

    clickMethodCard("Web Interface");

    fireEvent.click(screen.getByRole("button", { name: /Add CNAME/i }));

    await waitFor(() => expect(mockAddCName).toHaveBeenCalledWith(TEST_CNAME));
    expect(mockSetCertIssuer).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText(/CNAME Added Successfully/i)).toBeInTheDocument();
    });
  });

  test("browser path: shows error on API failure", async () => {
    mockAddCName.mockRejectedValue(new Error("CNAME already exists"));

    renderView();

    acknowledgeDnsDocs();
    enterCName(TEST_CNAME);
    acknowledgeCertDocs();
    clickMethodCard("Web Interface");

    fireEvent.click(screen.getByRole("button", { name: /Add CNAME/i }));

    await waitFor(() => {
      expect(screen.getByText(/CNAME already exists/i)).toBeInTheDocument();
    });
  });

  test("CLI path: shows CLI commands with dynamic values", () => {
    renderView();

    acknowledgeDnsDocs();
    enterCName(TEST_CNAME);
    acknowledgeCertDocs();
    clickMethodCard("Command Line");

    expect(screen.getByText(/4. Instructions/i)).toBeInTheDocument();
    expect(screen.getByText(/tsuru cname add/i)).toBeInTheDocument();
  });

  test("Terraform path: shows terraform snippet with dynamic values", () => {
    renderView();

    acknowledgeDnsDocs();
    enterCName(TEST_CNAME);
    acknowledgeCertDocs();
    clickMethodCard("Infrastructure as Code");

    expect(screen.getByText(/4. Instructions/i)).toBeInTheDocument();
    expect(screen.getByText(/tsuru_app_cname/i)).toBeInTheDocument();
  });

  test("submit button only appears for web method", () => {
    renderView();

    acknowledgeDnsDocs();
    enterCName(TEST_CNAME);
    acknowledgeCertDocs();

    clickMethodCard("Command Line");
    expect(
      screen.queryByRole("button", { name: /^Add CNAME$/i })
    ).not.toBeInTheDocument();

    clickMethodCard("Web Interface");
    expect(
      screen.getByRole("button", { name: /^Add CNAME$/i })
    ).toBeInTheDocument();
  });
});
