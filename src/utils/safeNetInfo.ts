/**
 * Safe wrapper around @react-native-community/netinfo.
 *
 * The netinfo package throws synchronously, at module-import time, if its
 * native module isn't linked into the running binary (e.g. a custom dev
 * client built before this dependency was added, or any other native/JS
 * version mismatch). Because that throw happens during import — not inside
 * a function we control — a normal try/catch around our own code can't
 * catch it, and it takes down the entire app before a single screen renders.
 *
 * Loading the module lazily via require() inside a try/catch means a broken
 * native binary degrades to "assume online" instead of crashing on launch.
 * If you're seeing the fallback kick in, the underlying native module issue
 * still needs fixing (rebuild your dev client / reinstall the package) —
 * this just stops it from being fatal.
 */

export interface SafeNetInfoState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string;
}

type Listener = (state: SafeNetInfoState) => void;

const FALLBACK_STATE: SafeNetInfoState = {
  isConnected: true,
  isInternetReachable: true,
  type: 'unknown',
};

let netInfoModule: any = null;
let loadAttempted = false;

const loadNetInfo = (): any => {
  if (loadAttempted) return netInfoModule;
  loadAttempted = true;
  try {
    // @ts-ignore — require is provided by the Metro/CommonJS runtime
    netInfoModule = require('@react-native-community/netinfo').default;
  } catch (err) {
    console.warn(
      '[safeNetInfo] @react-native-community/netinfo native module is unavailable — assuming online. ' +
        'This usually means the app binary needs a rebuild (custom dev client) after this dependency was added.',
      err,
    );
    netInfoModule = null;
  }
  return netInfoModule;
};

export const safeNetInfoFetch = async (): Promise<SafeNetInfoState> => {
  const NetInfo = loadNetInfo();
  if (!NetInfo) return FALLBACK_STATE;
  try {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
    };
  } catch {
    return FALLBACK_STATE;
  }
};

export const safeNetInfoAddEventListener = (listener: Listener): (() => void) => {
  const NetInfo = loadNetInfo();
  if (!NetInfo) {
    // No native module — report the fallback state once, no further updates.
    listener(FALLBACK_STATE);
    return () => {};
  }
  try {
    return NetInfo.addEventListener((state: any) => {
      listener({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });
  } catch {
    listener(FALLBACK_STATE);
    return () => {};
  }
};
