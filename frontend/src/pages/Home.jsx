import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../utils/fireBase";
import api from "../../utils/axios";
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { setUserdata } from "../redux/userSlice";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import Artiface from "../components/Artiface";

function Home() {
  const { userData, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const hendalLogin = async (token) => {
    try {
      const { data } = await api.post("/api/auth/login", { token });
      // console.log(data);
      dispatch(setUserdata(data));
    } catch (error) {
      console.log(error);
    }
  };

  const googleLogin = async () => {
    const data = await signInWithPopup(auth, googleProvider);
    const token = await data.user.getIdToken();
    await hendalLogin(token);
  };

  return (
    <div className=" h-screen flex bg-[#0d0f14] text-white overflow-hidden">
      <Sidebar />
      <ChatArea />
      <Artiface />

      {!loading && !userData && (
        <div className=" fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className=" w-85 bg-[#13151c] border border-white/88 rounded-2xl p-7 flex flex-col gap-5">
            <div className=" flex flex-col gap-1">
              <h2 className=" text-[17px] font-semibold text-slate-100 tracking-tight">
                Wellcome to ByteAi
              </h2>
              <p className=" text-[13px] text-slate-500">
                Please login to continue using the app.
              </p>
            </div>
            <button
              onClick={googleLogin}
              className=" w-full flex items-center justify-center gap-3 py-2.75
            rounded-xl text-sm font-medium text-black/90 bg-white hover:bg-gray-200 translate-all duration-150 cursor-pointer"
            >
              <FcGoogle size={15} />
              Continue with google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
