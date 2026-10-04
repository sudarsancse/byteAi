import api from "../../utils/axios";

const createOrder = async (plan) => {
  try {
    const { data } = await api.post("/api/biling/create", {
      plan,
    });
    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default createOrder;
