import AppRoutes from "./routes/Router";
import Loader from "./shared/components/loader";
import { useLoading } from "./shared/contexts/loaderContext";

function App() {

  const { loader } = useLoading();

  return (
    <>
      { loader && <Loader />}
      <AppRoutes />
    </>
  );
}

export default App;
