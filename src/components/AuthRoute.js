import React from 'react'
import { Redirect, Route } from 'react-router-dom';
import { useLocalStorage } from '../utils';

const AuthRoute = ({ component, ...rest }) => {
    const { value: user } = useLocalStorage('user');
    return (
        <Route {...rest} render={(props) => user ? (<Redirect to="/" />) : (component)} />
    )
}

export default AuthRoute;
