// Shared application state
// All modules import this object by reference — mutations are visible everywhere

const state = {
  data: {},
  currentItem: null,
  currentCategory: null,
};

export default state;
