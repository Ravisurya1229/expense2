export const isLoggedIn = () => {
  return localStorage.getItem("user") !== null;
};

export const logout = () => {
  localStorage.removeItem("user");
};
