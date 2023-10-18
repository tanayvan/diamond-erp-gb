import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { firebase } from 'src/firebase';

const HANDLERS = {
  INITIALIZE: 'INITIALIZE',
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT'
};

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null
};

const handlers = {
  [HANDLERS.INITIALIZE]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      ...(
        // if payload (user) is provided, then is authenticated
        user
          ? ({
            isAuthenticated: true,
            isLoading: false,
            user
          })
          : ({
            isLoading: false
          })
      )
    };
  },
  [HANDLERS.SIGN_IN]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user
    };
  },
  [HANDLERS.SIGN_OUT]: (state) => {
    return {
      ...state,
      isAuthenticated: false,
      user: null
    };
  }
};

const reducer = (state, action) => (
  handlers[action.type] ? handlers[action.type](state, action) : state
);

// The role of this context is to propagate authentication state through the App tree.

export const AuthContext = createContext({ undefined });

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialized = useRef(false);
  const auth = getAuth(firebase)
  const initialize = async () => {
    // Prevent from calling twice in development mode with React.StrictMode enabled
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    let isAuthenticated = false;

    try {
      isAuthenticated = auth.currentUser
    } catch (err) {
      console.error(err);
    }
    auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        dispatch({
          type: HANDLERS.INITIALIZE,
          payload: user,
        });
      } else {
        // No user is signed in.
        dispatch({
          type: HANDLERS.INITIALIZE,
        });
      }
    });

    // if (isAuthenticated) {


    //   dispatch({
    //     type: HANDLERS.INITIALIZE,
    //     payload: auth.currentUser
    //   });
    // } else {
    //   dispatch({
    //     type: HANDLERS.INITIALIZE
    //   });
    // }
  };

  useEffect(
    () => {
      initialize();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const skip = () => {
    try {
      window.sessionStorage.setItem('authenticated', 'true');
    } catch (err) {
      console.error(err);
    }

    const user = {
      id: '5e86809283e28b96d2d38537',
      avatar: '/assets/avatars/avatar-anika-visser.png',
      name: 'Anika Visser',
      email: 'anika.visser@devias.io'
    };

    dispatch({
      type: HANDLERS.SIGN_IN,
      payload: user
    });
  };

  const signIn = async (email, password) => {
    // if (email !== 'demo@devias.io' || password !== 'Password123!') {
    //   throw new Error('Please check your email and password');
    // }
    try {
      let user = await signInWithEmailAndPassword(auth, email, password);
      console.log('user', user.user)
      dispatch({
        type: HANDLERS.SIGN_IN,
        payload: user.user
      });
      return { success: true }
    } catch (err) {
      // console.error(err.code);
      throw new Error('Please check your email and password');
    }

    // const user = {
    //   id: '5e86809283e28b96d2d38537',
    //   avatar: '/assets/avatars/avatar-anika-visser.png',
    //   name: 'Anika Visser',
    //   email: 'anika.visser@devias.io'
    // };


  };

  const signUp = async (email, name, password) => {

    try {
      let user = await createUserWithEmailAndPassword(auth, email, password)
      console.log('user', user)
      dispatch({
        type: HANDLERS.SIGN_IN,
        payload: user
      });
      return { success: true }
    } catch (error) {
      const code = error.code;
      let message = 'Something Went Wrong'
      if (code == 'auth/email-already-in-use') {
        message = 'Oops! Email already in use '
      }


      throw new Error(message);
    }



  };

  const signOut = async () => {

    await auth.signOut()

    dispatch({
      type: HANDLERS.SIGN_OUT
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        skip,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuthContext = () => useContext(AuthContext);
