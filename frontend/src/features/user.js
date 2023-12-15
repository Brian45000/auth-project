import { produce } from "immer";

const initialState = {
  id: "",
};

const ID = "id";
//const EMAIL = "email";

export const recup_id = (id) => ({
  type: ID,
  payload: id,
});

export default function userReducer(state = initialState, action) {
  return produce(state, (draft) => {
    if (action.type === ID) {
      draft.id = action.payload;
    }
  });
}
