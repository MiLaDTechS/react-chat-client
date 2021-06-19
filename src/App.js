import { AnimatePresence } from 'framer-motion';
import { Route, Switch, useLocation } from 'react-router-dom';
import AuthRoute from './components/AuthRoute';
import PrivateRoute from './components/PrivateRoute';
import ConfirmEmail from './pages/ConfirmEmail';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence exitBeforeEnter initial={false}>
      <Switch location={location} key={location.pathname}>
        <PrivateRoute exact path="/" component={<Home />} />
        <AuthRoute path="/login" component={<Login />} />
        <AuthRoute path="/register" component={<Register />} />
        <Route path="/confirmemail" component={ConfirmEmail} />
      </Switch>
    </AnimatePresence>
  );
}

export default App;
