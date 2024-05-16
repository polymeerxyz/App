import { useLayoutEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { openTab } from "@/lib/utils/extension";
import { MainContextProvider } from "@/pages/main/context";
import DaoPage from "@/pages/main/dao";
import DepositPage from "@/pages/main/dao/deposit";
import WithdrawPage from "@/pages/main/dao/withdraw";
import HomePage from "@/pages/main/home";
import SettingsPage from "@/pages/main/settings";
import ReceivePage from "@/pages/main/token/receive";
import SendPage from "@/pages/main/token/send";
import TokenPage from "@/pages/main/token/token";
import AddSeedPhrasePage from "@/pages/register/add-seedphrase";
import CompleteOnboardingPage from "@/pages/register/complete-onboarding";
import ConnectHardwareWalletPage from "@/pages/register/connect-hardware-wallet";
import { RegisterContextProvider } from "@/pages/register/context";
import CreatePasswordPage from "@/pages/register/create-password";
import CreateSeedPhrasePage from "@/pages/register/create-seedphrase";
import DoOnboardingPage from "@/pages/register/do-onboarding";
import { AppContextProvider } from "@/routes/context";
import FullLayout from "@/routes/full-layout";
import PopupLayout from "@/routes/popup-layout";
import { useWalletStore } from "@/stores/wallet";

export function MainRoute() {
  const location = useLocation();
  const { wallets } = useWalletStore((s) => s.wallet.nervosnetwork);
  const activeWallet = useWalletStore((s) => s.getActiveWallet("nervosnetwork"));

  useLayoutEffect(() => {
    async function initialize() {
      const hasWallet = wallets.length > 0 && !!activeWallet;
      if (!hasWallet && location.pathname.indexOf("/register") === -1) {
        openTab({ url: "index.html#/register/do-onboarding" });
      }
    }
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContextProvider>
      <Routes>
        <Route
          path="/register"
          element={
            <RegisterContextProvider>
              <FullLayout />
            </RegisterContextProvider>
          }
        >
          <Route path="complete-onboarding" element={<CompleteOnboardingPage />} />
          <Route path="connect-hardware-wallet" element={<ConnectHardwareWalletPage />} />
          <Route path="add-seedphrase" element={<AddSeedPhrasePage />} />
          <Route path="create-seedphrase" element={<CreateSeedPhrasePage />} />
          <Route path="create-password" element={<CreatePasswordPage />} />
          <Route path="do-onboarding" element={<DoOnboardingPage />} />
        </Route>
        <Route
          path="/main"
          element={
            <MainContextProvider>
              <PopupLayout />
            </MainContextProvider>
          }
        >
          <Route path="dao">
            <Route path="deposit" element={<DepositPage />} />
            <Route path="withdraw" element={<WithdrawPage />} />
            <Route index element={<DaoPage />} />
          </Route>
          {/* <Route path="exchange" element={<div>Exchange</div>} /> */}
          {/* <Route path="history" element={<div>History</div>} /> */}
          <Route path="settings" element={<SettingsPage />} />
          <Route path="token">
            <Route path=":id" element={<TokenPage />} />
            <Route path=":id/receive" element={<ReceivePage />} />
            <Route path=":id/send" element={<SendPage />} />
            <Route index element={<HomePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/main/token" />} />
      </Routes>
    </AppContextProvider>
  );
}
