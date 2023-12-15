import { produce } from "immer";

const initialState = {
  login: "",
  doubleAuth: "",
};

const LOG = "id";
const DOUBLE = "double";
//const EMAIL = "email";

export const recup_login = (login) => ({
  type: LOG,
  payload: login,
});

export const recup_doubleAuth = (double) => ({
  type: DOUBLE,
  payload: double,
});
export default function userReducer(state = initialState, action) {
  return produce(state, (draft) => {
    if (action.type === LOG) {
      draft.login = action.payload;
    }
    if (action.type === DOUBLE) {
      draft.doubleAuth = action.payload;
    }
  });
}
