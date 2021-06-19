import React from 'react'
import { Redirect, Route } from 'react-router-dom';
import { useLocalStorage } from '../utils';

const PrivateRoute = ({ component, ...rest }) => {
    const { value: user } = useLocalStorage('user');
    return (
        <Route {...rest} render={(props) => user ? (component) : (<Redirect to="/login" />)} />
    )
}

export default PrivateRoute;
