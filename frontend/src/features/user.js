import { produce } from "immer";

const initialState = {
  count: 0,
};

const COUNT = "count";
//const EMAIL = "email";

export const publi_count = (publi) => ({
  type: COUNT,
  payload: publi,
});

export default function userReducer(state = initialState, action) {
  return produce(state, (draft) => {
    if (action.type === COUNT) {
      draft.token = action.payload;
    }
  });
}
