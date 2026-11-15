import { Backdrop } from "./components/Backdrop";
import { HomeScreen } from "./components/HomeScreen";
import { LoginScreen } from "./components/LoginScreen";
import { useSession } from "./store/session";

export function App() {
  const user = useSession((state) => state.user);

  return (
    <>
      <Backdrop />
      {user ? <HomeScreen user={user} /> : <LoginScreen />}
    </>
  );
}
