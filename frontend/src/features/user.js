import { produce } from "immer";

const initialState = {
  email: "",
  token: "test",
  doubleauth: "",
};

const TOKEN = "token";
const EMAIL = "email";

export const user_email = (email) => ({
  type: EMAIL,
  payload: email,
});

export default function userReducer(state = initialState, action) {
  return produce(state, (draft) => {
    if (action.type === TOKEN) {
      draft.token = action.payload;
    }
  });
}
