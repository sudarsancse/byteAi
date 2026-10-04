import { useEffect } from "react";
import Home from "./pages/Home";
import getCurrentUser from "./features/getCurrentUser";
import { useDispatch } from "react-redux";
import { setLoading, setUserdata } from "./redux/userSlice";

function App() {
  const dispatch = useDispatch();

  // useEffect(() => {
  //   const getUser = async () => {
  //     const data = await getCurrentUser();
  //     dispatch(setUserdata(data));
  //   };
  //   getUser();
  // }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await getCurrentUser();
        console.log(data);

        dispatch(setUserdata(data));
      } catch (error) {
        console.log(error);
        dispatch(setLoading(false)); // check finished, user is not logged in
      }
    };
    getUser();
  }, [dispatch]);
  return (
    <>
      <Home />
    </>
  );
}

export default App;
