// Thin wrapper around the Telegram WebApp SDK with a browser-friendly dev mock,
// so the mini app can be developed and screenshotted outside of Telegram.

export type TgUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
};

type ThemeParams = Record<string, string>;

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { user?: TgUser };
  colorScheme: "light" | "dark";
  themeParams: ThemeParams;
  viewportHeight: number;
  isExpanded: boolean;
  platform: string;
  ready(): void;
  expand(): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  enableClosingConfirmation(): void;
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
  MainButton: {
    text: string;
    show(): void;
    hide(): void;
    setText(t: string): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
    showProgress(): void;
    hideProgress(): void;
  };
  HapticFeedback: {
    impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): void;
    notificationOccurred(type: "error" | "success" | "warning"): void;
    selectionChanged(): void;
  };
  onEvent(event: string, cb: () => void): void;
  offEvent(event: string, cb: () => void): void;
  openLink(url: string): void;
  close(): void;
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

function buildMockInitData(user: TgUser): string {
  const params = new URLSearchParams();
  params.set("user", JSON.stringify(user));
  params.set("auth_date", String(Math.floor(Date.now() / 1000)));
  params.set("hash", "dev-mock-hash");
  return params.toString();
}

function createMock(role: "admin" | "user"): TelegramWebApp {
  const user: TgUser =
    role === "admin"
      ? { id: 555000111, first_name: "Vitaliy", last_name: "Admin", username: "vito_admin" }
      : { id: 100001, first_name: "Игорь", last_name: "Смирнов", username: "igorsmirnov" };

  const listeners = new Map<string, Set<() => void>>();
  const noop = () => {};

  return {
    initData: buildMockInitData(user),
    initDataUnsafe: { user },
    colorScheme: "dark",
    themeParams: {},
    viewportHeight: window.innerHeight,
    isExpanded: true,
    platform: "web",
    ready: noop,
    expand: noop,
    setHeaderColor: noop,
    setBackgroundColor: noop,
    enableClosingConfirmation: noop,
    BackButton: {
      show: noop,
      hide: noop,
      onClick: (cb) => {
        const set = listeners.get("back") ?? new Set();
        set.add(cb);
        listeners.set("back", set);
      },
      offClick: (cb) => listeners.get("back")?.delete(cb),
    },
    MainButton: {
      text: "",
      show: noop,
      hide: noop,
      setText: noop,
      onClick: noop,
      offClick: noop,
      showProgress: noop,
      hideProgress: noop,
    },
    HapticFeedback: {
      impactOccurred: noop,
      notificationOccurred: noop,
      selectionChanged: noop,
    },
    onEvent: noop,
    offEvent: noop,
    openLink: (url) => window.open(url, "_blank"),
    close: noop,
  };
}

function getRole(): "admin" | "user" {
  const params = new URLSearchParams(window.location.search);
  return params.get("mock") === "admin" || params.get("admin") === "1" ? "admin" : "user";
}

export function getTelegram(): TelegramWebApp {
  if (window.Telegram?.WebApp && window.Telegram.WebApp.initData) {
    return window.Telegram.WebApp;
  }
  if (!window.__tgMock) {
    window.__tgMock = createMock(getRole());
  }
  return window.__tgMock;
}

declare global {
  interface Window {
    __tgMock?: TelegramWebApp;
  }
}

export function getTelegramUser(): TgUser | null {
  return getTelegram().initDataUnsafe.user ?? null;
}

export function haptic(style: "light" | "medium" | "heavy" = "light") {
  try {
    getTelegram().HapticFeedback.impactOccurred(style);
  } catch {
    /* noop outside Telegram */
  }
}

export function hapticNotify(type: "error" | "success" | "warning") {
  try {
    getTelegram().HapticFeedback.notificationOccurred(type);
  } catch {
    /* noop */
  }
}
