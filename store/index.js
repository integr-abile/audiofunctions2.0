export const state = () => ({
  title: "Default title",
});

export const mutations = {
  setTitle(state, newTitle) {
    state.title = newTitle;
  },
};
