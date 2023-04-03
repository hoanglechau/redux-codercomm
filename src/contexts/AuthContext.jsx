import { createContext, useEffect, useReducer } from "react";
import { useSelector } from "react-redux";
import apiService from "../app/apiService";
import { isValidToken } from "../utils/jwt";

const initialState = {
  isInitialized: false,
  isAuthenticated: false,
  user: null
};

const INITIALIZE = "AUTH.INITIALIZE";
const LOGIN_SUCCESS = "AUTH.LOGIN_SUCCESS";
const REGISTER_SUCCESS = "AUTH.REGISTER_SUCCESS";
const LOGOUT = "AUTH.LOGOUT";
const UPDATE_PROFILE = "AUTH.UPDATE_PROFILE";

const reducer = (state, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user
      };
    case REGISTER_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user
      };
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null
      };
    case INITIALIZE:
      const { isAuthenticated, user } = action.payload;
      return {
        ...state,
        isInitialized: true,
        isAuthenticated,
        user
      };
    case UPDATE_PROFILE:
      const {
        name,
        avatarUrl,
        coverUrl,
        aboutMe,
        city,
        country,
        company,
        jobTitle,
        facebookLink,
        instagramLink,
        linkedinLink,
        twitterLink,
        friendCount,
        postCount
      } = action.payload;

      return {
        ...state,
        user: {
          ...state.user,
          name,
          avatarUrl,
          coverUrl,
          aboutMe,
          city,
          country,
          company,
          jobTitle,
          facebookLink,
          instagramLink,
          linkedinLink,
          twitterLink,
          friendCount,
          postCount
        }
      };
    default:
      return state;
  }
};
const AuthContext = createContext({ ...initialState });

const setsession = (accessToken) => {
  console.log("accessToken", accessToken);
  if (accessToken) {
    window.localStorage.setItem("accessToken", accessToken);
    apiService.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    window.localStorage.removeItem("accessToken");
    delete apiService.defaults.headers.common.Authorization;
  }
};

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const updatedProfile = useSelector((state) => state.user.updatedProfile);
  useEffect(() => {
    console.log("useEffect");
    const initialize = async () => {
      try {
        const accessToken = window.localStorage.getItem("accessToken");
        if (accessToken && isValidToken(accessToken)) {
          setsession(accessToken);
          const response = await apiService.get("/users/me");
          const user = response.data;

          dispatch({
            type: INITIALIZE,
            payload: { isAuthenticated: true, user }
          });
        } else {
          setsession(null);
          dispatch({
            type: INITIALIZE,
            payload: { isAuthenticated: false, user: null }
          });
        }
      } catch (error) {
        setsession(null);
        dispatch({
          type: INITIALIZE,
          payload: { isAuthenticated: false, user: null }
        });
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    console.log("5");
    if (updatedProfile) {
      console.log("6");
      dispatch({ type: UPDATE_PROFILE, payload: updatedProfile });
    }
  }, [updatedProfile]);

  const login = async ({ email, password }, callback) => {
    const response = await apiService.post("/auth/login", { email, password });
    console.log("response in Login", response);
    const { user, accessToken } = response.data;
    console.log("accessToken in Login", accessToken);
    setsession(accessToken);
    dispatch({
      type: LOGIN_SUCCESS,
      payload: { user }
    });
    callback();
  };

  const logout = async (callback) => {
    setsession(null);
    dispatch({
      type: LOGOUT
    });
    callback();
  };

  const register = async ({ name, email, password }, callback) => {
    const respone = await apiService.post("/users", { name, email, password });
    const { user, accessToken } = respone.data;

    setsession(accessToken);
    dispatch({
      type: REGISTER_SUCCESS,
      payload: { user }
    });
    callback();
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
