import api from "../../utils/axios";

const verifyPayment = async (payload) => {
  try {
    const { data } = await api.post("/api/biling/verify-payment", {
      payload,
    });
    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default verifyPayment;
