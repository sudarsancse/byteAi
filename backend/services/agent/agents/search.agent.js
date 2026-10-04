import { checkLimit } from "../Config/agentLimit.js";
import { searchtool } from "../Config/tavily.js";
import { dedcutCredits } from "../utils/dedcutCredits.js";

export const searchAgent = async (state) => {
  try {
    await checkLimit(state.userId, "search");
    const results = await searchtool.invoke({
      query: state.prompt,
    });
    console.log(results);
    // CREDITS DEDUCTS API CALL
    await dedcutCredits(state.userId, "search");
    return {
      ...state,
      searchResults: results,
      images: results.images,
    };
  } catch (error) {
    return {
      ...state,
      searchResults: error?.data?.message || [],
      images: [],
    };
  }
};
