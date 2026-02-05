import { useLoader } from "./useLoader";
import Loader from "./Loader";

const GlobalLoader = () => {
  const { isLoading, message } = useLoader();

  return <Loader isVisible={isLoading} message={message} />;
};

export default GlobalLoader;
